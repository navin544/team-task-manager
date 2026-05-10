const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { normalizeId, toObjectId } = require('../utils/objectId');
const { buildSearchRegex } = require('../utils/search');
const { serializeProject, serializeProjectMember, serializeUser } = require('../utils/serializers');

const { logActivity } = require('./activityService');
const { createNotification } = require('./notificationService');

const USER_SELECT = 'name email role avatar createdAt updatedAt';
const PROJECT_SELECT = 'title description createdById members deadline status progress createdAt updatedAt';
const TASK_ASSIGNEE_SELECT = 'name email role avatar createdAt updatedAt';

function isAdmin(user) {
  return user.role === 'ADMIN';
}

function hasProjectAccess(project, userId) {
  return project.members.some((member) => normalizeId(member.userId) === userId);
}

async function populateProject(project) {
  return project.populate([
    {
      path: 'createdById',
      select: USER_SELECT
    },
    {
      path: 'members.userId',
      select: USER_SELECT
    }
  ]);
}

async function getTaskCountMap(projectIds) {
  if (!projectIds.length) {
    return new Map();
  }

  const counts = await Task.aggregate([
    {
      $match: {
        projectId: {
          $in: projectIds.map((projectId) => toObjectId(projectId))
        }
      }
    },
    {
      $group: {
        _id: '$projectId',
        count: {
          $sum: 1
        }
      }
    }
  ]);

  return new Map(counts.map((item) => [String(item._id), item.count]));
}

async function syncProjectProgress(projectId) {
  const [totalTasks, completedTasks] = await Promise.all([
    Task.countDocuments({ projectId }),
    Task.countDocuments({
      projectId,
      status: 'COMPLETED'
    })
  ]);

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  await Project.findByIdAndUpdate(projectId, {
    progress
  });
}

async function ensureProjectAccess(projectId, user) {
  const project = await Project.findById(projectId).select(PROJECT_SELECT);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  await populateProject(project);

  if (isAdmin(user) || hasProjectAccess(project, user.id)) {
    return project;
  }

  throw new ApiError(403, 'You do not have access to this project');
}

async function listProjects(user, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 9);
  const skip = (page - 1) * limit;
  const conditions = [];

  if (query.search) {
    const searchRegex = buildSearchRegex(query.search);
    conditions.push({
      $or: [{ title: searchRegex }, { description: searchRegex }]
    });
  }

  if (query.status) {
    conditions.push({
      status: query.status
    });
  }

  if (!isAdmin(user)) {
    conditions.push({
      'members.userId': toObjectId(user.id)
    });
  }

  const filter = conditions.length ? { $and: conditions } : {};

  const [items, total] = await Promise.all([
    Project.find(filter)
      .select(PROJECT_SELECT)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter)
  ]);

  await Promise.all(items.map(populateProject));
  const taskCountMap = await getTaskCountMap(items.map((item) => item.id));

  return {
    items: items.map((project) =>
      serializeProject(project, {
        taskCount: taskCountMap.get(project.id) || 0
      })
    ),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getProjectById(projectId, user) {
  const project = await ensureProjectAccess(projectId, user);
  const [tasks, activities] = await Promise.all([
    Task.find({
      projectId
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'assignedToId',
        select: TASK_ASSIGNEE_SELECT
      }),
    ActivityLog.find({
      projectId
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate({
        path: 'actorId',
        select: USER_SELECT
      })
  ]);

  return {
    ...serializeProject(project, {
      taskCount: tasks.length,
      tasks
    }),
    activities: activities.map((activity) => ({
      id: normalizeId(activity),
      actorId: normalizeId(activity.actorId),
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      metadata: activity.metadata || null,
      projectId: normalizeId(activity.projectId),
      taskId: normalizeId(activity.taskId),
      createdAt: activity.createdAt,
      actor: activity.actorId && activity.actorId.name ? serializeUser(activity.actorId) : null
    }))
  };
}

async function createProject(payload, actor) {
  const memberIds = [...new Set([actor.id, ...(payload.memberIds || [])])];

  if (memberIds.length) {
    const existingUsers = await User.countDocuments({
      _id: {
        $in: memberIds
      }
    });

    if (existingUsers !== memberIds.length) {
      throw new ApiError(400, 'One or more selected members do not exist');
    }
  }

  const project = await Project.create({
    title: payload.title,
    description: payload.description || null,
    deadline: payload.deadline ? new Date(payload.deadline) : null,
    status: payload.status || 'PLANNING',
    createdById: actor.id,
    members: memberIds.map((userId) => ({
      userId,
      role: userId === actor.id ? 'ADMIN' : 'MEMBER'
    }))
  });

  await populateProject(project);

  await logActivity({
    actorId: actor.id,
    action: 'project.created',
    entityType: 'PROJECT',
    entityId: project.id,
    projectId: project.id,
    metadata: { title: project.title }
  });

  return serializeProject(project);
}

async function updateProject(projectId, payload, actor) {
  const currentProject = await ensureProjectAccess(projectId, actor);

  if (payload.title) {
    currentProject.title = payload.title;
  }

  if (payload.description !== undefined) {
    currentProject.description = payload.description || null;
  }

  if (payload.deadline !== undefined) {
    currentProject.deadline = payload.deadline ? new Date(payload.deadline) : null;
  }

  if (payload.status) {
    currentProject.status = payload.status;
  }

  if (payload.memberIds) {
    const desiredMemberIds = [
      ...new Set([normalizeId(currentProject.createdById), ...payload.memberIds])
    ];
    const existingUsers = await User.countDocuments({
      _id: {
        $in: desiredMemberIds
      }
    });

    if (existingUsers !== desiredMemberIds.length) {
      throw new ApiError(400, 'One or more selected members do not exist');
    }

    currentProject.members = desiredMemberIds.map((userId) => ({
      userId,
      role: userId === normalizeId(currentProject.createdById) ? 'ADMIN' : 'MEMBER'
    }));
  }

  await currentProject.save();
  await populateProject(currentProject);

  await logActivity({
    actorId: actor.id,
    action: 'project.updated',
    entityType: 'PROJECT',
    entityId: currentProject.id,
    projectId: currentProject.id,
    metadata: { title: currentProject.title }
  });

  const taskCountMap = await getTaskCountMap([currentProject.id]);
  return serializeProject(currentProject, {
    taskCount: taskCountMap.get(currentProject.id) || 0
  });
}

async function deleteProject(projectId, actor) {
  const project = await ensureProjectAccess(projectId, actor);

  await Task.deleteMany({
    projectId
  });
  await Project.findByIdAndDelete(projectId);

  await logActivity({
    actorId: actor.id,
    action: 'project.deleted',
    entityType: 'PROJECT',
    entityId: projectId,
    metadata: {
      deleted: true,
      title: project.title
    }
  });
}

async function addProjectMember(projectId, payload, actor) {
  const project = await ensureProjectAccess(projectId, actor);

  let userId = payload.userId;
  if (!userId && payload.email) {
    const existingUser = await User.findOne({
      email: payload.email.toLowerCase()
    });

    if (!existingUser) {
      throw new ApiError(404, 'User with this email was not found');
    }

    userId = existingUser.id;
  }

  const existingMemberIndex = project.members.findIndex(
    (member) => normalizeId(member.userId) === userId
  );

  if (existingMemberIndex >= 0) {
    project.members[existingMemberIndex].role = payload.role || 'MEMBER';
  } else {
    project.members.push({
      userId,
      role: payload.role || 'MEMBER'
    });
  }

  await project.save();
  await populateProject(project);

  const member = project.members.find((item) => normalizeId(item.userId) === userId);
  const populatedUser = await User.findById(userId).select(USER_SELECT);

  if (!member || !populatedUser) {
    throw new ApiError(500, 'Failed to update project membership');
  }

  await logActivity({
    actorId: actor.id,
    action: 'project.member_added',
    entityType: 'PROJECT',
    entityId: project.id,
    projectId: project.id,
    metadata: { memberId: userId }
  });

  await createNotification({
    userId,
    title: 'Added to project',
    message: `You were added to ${project.title}`,
    type: 'PROJECT_INVITE',
    entityId: project.id
  });

  return serializeProjectMember({
    ...member.toObject({ virtuals: true }),
    user: populatedUser
  });
}

async function removeProjectMember(projectId, userId, actor) {
  const project = await ensureProjectAccess(projectId, actor);

  if (normalizeId(project.createdById) === userId) {
    throw new ApiError(400, 'Project creator cannot be removed');
  }

  project.members = project.members.filter((member) => normalizeId(member.userId) !== userId);
  await project.save();
  await Task.updateMany(
    {
      projectId,
      assignedToId: userId
    },
    {
      $set: {
        assignedToId: null
      }
    }
  );

  await logActivity({
    actorId: actor.id,
    action: 'project.member_removed',
    entityType: 'PROJECT',
    entityId: project.id,
    projectId: project.id,
    metadata: { memberId: userId }
  });
}

module.exports = {
  addProjectMember,
  createProject,
  deleteProject,
  ensureProjectAccess,
  getProjectById,
  listProjects,
  removeProjectMember,
  syncProjectProgress,
  updateProject
};
