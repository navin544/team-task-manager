
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { normalizeId, toObjectId } = require('../utils/objectId');
const { serializeActivity } = require('../utils/serializers');

function buildProjectScope(user) {
  if (user.role === 'ADMIN') {
    return {};
  }

  return {
    'members.userId': toObjectId(user.id)
  };
}

function aggregateBy(items, field) {
  return items.reduce((accumulator, item) => {
    const key = item[field];
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

async function getDashboardSummary(user) {
  const projectWhere = buildProjectScope(user);
  const scopedProjects =
    user.role === 'ADMIN' ? [] : await Project.find(projectWhere).select('_id');
  const scopedProjectIds = scopedProjects.map((project) => project._id);
  const taskWhere =
    user.role === 'ADMIN'
      ? {}
      : {
          $or: [
            { assignedToId: toObjectId(user.id) },
            {
              projectId: {
                $in: scopedProjectIds
              }
            }
          ]
        };

  const [projectsCount, tasks, teamSize] = await Promise.all([
    Project.countDocuments(projectWhere),
    Task.find(taskWhere).populate({
      path: 'assignedToId',
      select: 'name'
    }),
    User.countDocuments({})
  ]);

  const scopedTaskIds = tasks.map((task) => task._id);
  const activities = await ActivityLog.find(
    user.role === 'ADMIN'
      ? {}
      : {
          $or: [
            { actorId: toObjectId(user.id) },
            {
              projectId: {
                $in: scopedProjectIds
              }
            },
            {
              taskId: {
                $in: scopedTaskIds
              }
            }
          ]
        }
  )
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: 'actorId',
      select: 'name email role avatar createdAt updatedAt'
    });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((task) => ['TODO', 'IN_PROGRESS'].includes(task.status)).length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.status === 'OVERDUE' ||
      (task.dueDate && task.dueDate < new Date() && task.status !== 'COMPLETED')
  ).length;
  const productivity = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusBreakdown = aggregateBy(tasks, 'status');
  const priorityBreakdown = aggregateBy(tasks, 'priority');

  const performanceByUser = tasks.reduce((accumulator, task) => {
    if (!task.assignedToId || !task.assignedToId.name) {
      return accumulator;
    }

    const assigneeId = normalizeId(task.assignedToId);
    const existing = accumulator[assigneeId] || {
      userId: assigneeId,
      name: task.assignedToId.name,
      completed: 0,
      total: 0
    };

    existing.total += 1;
    if (task.status === 'COMPLETED') {
      existing.completed += 1;
    }

    accumulator[assigneeId] = existing;
    return accumulator;
  }, {});

  const userPerformance = Object.values(performanceByUser)
    .map((entry) => ({
      ...entry,
      completionRate: entry.total ? Math.round((entry.completed / entry.total) * 100) : 0
    }))
    .sort((left, right) => right.completionRate - left.completionRate)
    .slice(0, 6);

  const completionTrend = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const completed = tasks.filter((task) => {
      if (!task.completedAt) {
        return false;
      }

      const completedAt = new Date(task.completedAt);
      completedAt.setHours(0, 0, 0, 0);
      return completedAt.getTime() === day.getTime();
    }).length;

    return {
      label,
      completed
    };
  });

  return {
    summary: {
      totalProjects: projectsCount,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      teamProductivity: productivity
    },
    charts: {
      statusBreakdown,
      priorityBreakdown,
      completionTrend
    },
    recentActivity: activities.map(serializeActivity),
    userPerformance,
    teamSize
  };
}

module.exports = {
  getDashboardSummary
};
