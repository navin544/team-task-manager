const path = require('path');

const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const { normalizeId, toObjectId } = require('../utils/objectId');
const { buildSearchRegex } = require('../utils/search');
const {
  serializeTask,
  serializeTaskAttachment,
  serializeTaskComment
} = require('../utils/serializers');

const { logActivity } = require('./activityService');
const { createNotificationsBulk } = require('./notificationService');
const { ensureProjectAccess, syncProjectProgress } = require('./projectService');

const USER_SELECT = 'name email role avatar createdAt updatedAt';
const PROJECT_SELECT = 'title status progress members';

function normalizeDueDate(dueDate) {
  return dueDate ? new Date(dueDate) : null;
}

function resolveTaskStatus(status, dueDate) {
  if (status === 'COMPLETED') {
    return 'COMPLETED';
  }

  if (dueDate && dueDate < new Date()) {
    return 'OVERDUE';
  }

  return status || 'TODO';
}

async function getAccessibleProjectIds(user) {
  if (user.role === 'ADMIN') {
    return [];
  }

  const projects = await Project.find({
    'members.userId': toObjectId(user.id)
  }).select('_id');

  return projects.map((project) => project._id);
}

function buildTaskPopulate() {
  return [
    {
      path: 'assignedToId',
      select: USER_SELECT
    },
    {
      path: 'createdById',
      select: USER_SELECT
    },
    {
      path: 'projectId',
      select: PROJECT_SELECT,
      populate: {
        path: 'members.userId',
        select: USER_SELECT
      }
    },
    {
      path: 'comments.authorId',
      select: USER_SELECT
    },
    {
      path: 'attachments.uploadedById',
      select: USER_SELECT
    }
  ];
}

async function ensureTaskAccess(taskId, user) {
  const task = await Task.findById(taskId).populate(buildTaskPopulate());

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const hasAccess =
    user.role === 'ADMIN' ||
    task.projectId.members.some((member) => normalizeId(member.userId) === user.id) ||
    normalizeId(task.assignedToId) === user.id;

  if (!hasAccess) {
    throw new ApiError(403, 'You do not have access to this task');
  }

  return task;
}

async function listTasks(user, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 18);
  const skip = (page - 1) * limit;
  const conditions = [];

  if (query.projectId) {
    conditions.push({
      projectId: toObjectId(query.projectId)
    });
  }

  if (query.status) {
    conditions.push({
      status: query.status
    });
  }

  if (query.priority) {
    conditions.push({
      priority: query.priority
    });
  }

  if (query.assignedTo) {
    conditions.push({
      assignedToId: toObjectId(query.assignedTo)
    });
  }

  if (query.search) {
    const searchRegex = buildSearchRegex(query.search);
    conditions.push({
      $or: [{ title: searchRegex }, { description: searchRegex }]
    });
  }

  if (user.role !== 'ADMIN') {
    const accessibleProjectIds = await getAccessibleProjectIds(user);
    conditions.push({
      $or: [
        { assignedToId: toObjectId(user.id) },
        {
          projectId: {
            $in: accessibleProjectIds
          }
        }
      ]
    });
  }

  const where = conditions.length ? { $and: conditions } : {};
  const sortBy = query.sortBy || 'updatedAt';
  const sortOrder = query.sortOrder || 'desc';

  const [items, total] = await Promise.all([
    Task.find(where)
      .populate(buildTaskPopulate())
      .sort({
        [sortBy]: sortOrder
      })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(where)
  ]);

  return {
    items: items.map((task) => serializeTask(task)),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getTaskById(taskId, user) {
  const task = await ensureTaskAccess(taskId, user);
  return serializeTask(task);
}

async function createTask(payload, actor) {
  const project = await ensureProjectAccess(payload.projectId, actor);
  const dueDate = normalizeDueDate(payload.dueDate);
  const status = resolveTaskStatus(payload.status || 'TODO', dueDate);

  if (payload.assignedToId) {
    const membership = project.members.find(
      (member) => normalizeId(member.userId) === payload.assignedToId
    );

    if (!membership) {
      throw new ApiError(400, 'Assigned user must be a member of the project');
    }
  }

  const task = await Task.create({
    title: payload.title,
    description: payload.description || null,
    assignedToId: payload.assignedToId || null,
    projectId: payload.projectId,
    status,
    priority: payload.priority || 'MEDIUM',
    dueDate,
    createdById: actor.id,
    completedAt: status === 'COMPLETED' ? new Date() : null
  });

  await task.populate(buildTaskPopulate());
  await syncProjectProgress(payload.projectId);

  await logActivity({
    actorId: actor.id,
    action: 'task.created',
    entityType: 'TASK',
    entityId: task.id,
    projectId: payload.projectId,
    taskId: task.id,
    metadata: { title: task.title }
  });

  if (payload.assignedToId) {
    await createNotificationsBulk([payload.assignedToId], {
      title: 'Task assigned',
      message: `${task.title} was assigned to you`,
      type: 'TASK_ASSIGNED',
      entityId: task.id
    });
  }

  return serializeTask(task);
}

async function updateTask(taskId, payload, actor) {
  const existingTask = await ensureTaskAccess(taskId, actor);
  const dueDate =
    payload.dueDate !== undefined ? normalizeDueDate(payload.dueDate) : existingTask.dueDate;

  if (actor.role !== 'ADMIN' && normalizeId(existingTask.assignedToId) !== actor.id) {
    throw new ApiError(403, 'Members can only update tasks assigned to them');
  }

  if (
    actor.role === 'ADMIN' &&
    payload.assignedToId &&
    !existingTask.projectId.members.some(
      (member) => normalizeId(member.userId) === payload.assignedToId
    )
  ) {
    throw new ApiError(400, 'Assigned user must be a member of the project');
  }

  const updateData =
    actor.role === 'ADMIN'
      ? {
          ...(payload.title ? { title: payload.title } : {}),
          ...(payload.description !== undefined ? { description: payload.description || null } : {}),
          ...(payload.assignedToId !== undefined
            ? { assignedToId: payload.assignedToId || null }
            : {}),
          ...(payload.priority ? { priority: payload.priority } : {}),
          ...(payload.dueDate !== undefined ? { dueDate } : {}),
          ...(payload.status ? { status: resolveTaskStatus(payload.status, dueDate) } : {})
        }
      : {
          ...(payload.status ? { status: resolveTaskStatus(payload.status, dueDate) } : {})
        };

  if (updateData.status === 'COMPLETED') {
    updateData.completedAt = new Date();
  } else if (updateData.status) {
    updateData.completedAt = null;
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: updateData
    },
    {
      new: true,
      runValidators: true
    }
  ).populate(buildTaskPopulate());

  const projectId = normalizeId(task.projectId);
  await syncProjectProgress(projectId);

  await logActivity({
    actorId: actor.id,
    action: 'task.updated',
    entityType: 'TASK',
    entityId: task.id,
    projectId,
    taskId: task.id,
    metadata: {
      status: task.status,
      priority: task.priority
    }
  });

  const recipients = [normalizeId(task.assignedToId), normalizeId(task.createdById)].filter(
    (userId) => userId && userId !== actor.id
  );

  if (recipients.length) {
    await createNotificationsBulk(recipients, {
      title: 'Task updated',
      message: `${task.title} was updated`,
      type: 'TASK_UPDATED',
      entityId: task.id
    });
  }

  return serializeTask(task);
}

async function deleteTask(taskId, actor) {
  const task = await ensureTaskAccess(taskId, actor);

  await logActivity({
    actorId: actor.id,
    action: 'task.deleted',
    entityType: 'TASK',
    entityId: taskId,
    metadata: { title: task.title }
  });

  await Task.findByIdAndDelete(taskId);
  await syncProjectProgress(normalizeId(task.projectId));
}

async function createComment(payload, actor) {
  const task = await ensureTaskAccess(payload.taskId, actor);

  task.comments.push({
    authorId: actor.id,
    content: payload.content
  });
  await task.save();
  await task.populate(buildTaskPopulate());

  const comment = task.comments[task.comments.length - 1];

  await logActivity({
    actorId: actor.id,
    action: 'comment.created',
    entityType: 'COMMENT',
    entityId: comment.id,
    projectId: normalizeId(task.projectId),
    taskId: task.id,
    metadata: { taskTitle: task.title }
  });

  const recipients = [normalizeId(task.assignedToId), normalizeId(task.createdById)].filter(
    (userId) => userId && userId !== actor.id
  );

  if (recipients.length) {
    await createNotificationsBulk(recipients, {
      title: 'New task comment',
      message: `${actor.name} commented on ${task.title}`,
      type: 'COMMENT_ADDED',
      entityId: task.id
    });
  }

  return serializeTaskComment({
    ...comment.toObject({ virtuals: true }),
    taskId: task.id
  });
}

async function listComments(taskId, actor) {
  const task = await ensureTaskAccess(taskId, actor);

  return task.comments
    .slice()
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
    .map((comment) =>
      serializeTaskComment({
        ...comment.toObject({ virtuals: true }),
        taskId: task.id
      })
    );
}

async function addTaskAttachment(taskId, file, actor) {
  const task = await ensureTaskAccess(taskId, actor);

  if (actor.role !== 'ADMIN' && normalizeId(task.assignedToId) !== actor.id) {
    throw new ApiError(403, 'Members can only upload files for their own tasks');
  }

  task.attachments.push({
    uploadedById: actor.id,
    filename: file.filename,
    originalName: file.originalname,
    url: `/uploads/${path.basename(file.path)}`,
    mimeType: file.mimetype,
    size: file.size
  });
  await task.save();
  await task.populate(buildTaskPopulate());

  const attachment = task.attachments[task.attachments.length - 1];

  await logActivity({
    actorId: actor.id,
    action: 'task.attachment_added',
    entityType: 'TASK',
    entityId: task.id,
    projectId: normalizeId(task.projectId),
    taskId: task.id,
    metadata: { filename: file.originalname }
  });

  return serializeTaskAttachment({
    ...attachment.toObject({ virtuals: true }),
    taskId: task.id
  });
}

module.exports = {
  addTaskAttachment,
  createComment,
  createTask,
  deleteTask,
  ensureTaskAccess,
  getTaskById,
  listComments,
  listTasks,
  updateTask
};
