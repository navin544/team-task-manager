const { normalizeId } = require('./objectId');

function toPlain(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toObject === 'function') {
    return value.toObject({
      virtuals: true,
      versionKey: false
    });
  }

  return value;
}

function serializeUser(user) {
  const plain = toPlain(user);

  if (!plain) {
    return null;
  }

  return {
    id: normalizeId(plain),
    name: plain.name,
    email: plain.email,
    role: plain.role,
    avatar: plain.avatar || null,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  };
}

function serializeNotification(notification) {
  const plain = toPlain(notification);

  return {
    id: normalizeId(plain),
    userId: normalizeId(plain.userId),
    title: plain.title,
    message: plain.message,
    type: plain.type,
    entityId: plain.entityId,
    isRead: plain.isRead,
    createdAt: plain.createdAt
  };
}

function serializeActivity(activity) {
  const plain = toPlain(activity);

  return {
    id: normalizeId(plain),
    actorId: normalizeId(plain.actorId),
    action: plain.action,
    entityType: plain.entityType,
    entityId: plain.entityId,
    metadata: plain.metadata || null,
    projectId: normalizeId(plain.projectId),
    taskId: normalizeId(plain.taskId),
    createdAt: plain.createdAt,
    actor: serializeUser(plain.actorId && plain.actorId.name ? plain.actorId : plain.actor) ||
      serializeUser(plain.actor)
  };
}

function serializeProjectMember(member) {
  const plain = toPlain(member);
  const populatedUser = plain.user || plain.userId;

  return {
    id: normalizeId(plain),
    userId: normalizeId(plain.userId),
    role: plain.role,
    joinedAt: plain.joinedAt,
    user: populatedUser && populatedUser.name ? serializeUser(populatedUser) : null
  };
}

function serializeTaskComment(comment) {
  const plain = toPlain(comment);
  const populatedAuthor = plain.author || plain.authorId;

  return {
    id: normalizeId(plain),
    taskId: normalizeId(plain.taskId),
    authorId: normalizeId(plain.authorId),
    content: plain.content,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    author: populatedAuthor && populatedAuthor.name ? serializeUser(populatedAuthor) : null
  };
}

function serializeTaskAttachment(attachment) {
  const plain = toPlain(attachment);
  const populatedUploader = plain.uploadedBy || plain.uploadedById;

  return {
    id: normalizeId(plain),
    taskId: normalizeId(plain.taskId),
    filename: plain.filename,
    originalName: plain.originalName,
    url: plain.url,
    mimeType: plain.mimeType,
    size: plain.size,
    uploadedById: normalizeId(plain.uploadedById),
    createdAt: plain.createdAt,
    uploadedBy: populatedUploader && populatedUploader.name ? serializeUser(populatedUploader) : null
  };
}

function serializeTask(task, options = {}) {
  const plain = toPlain(task);
  const populatedAssignee = plain.assignee || plain.assignedToId;
  const populatedCreator = plain.creator || plain.createdById;
  const populatedProject = plain.project || plain.projectId;

  return {
    id: normalizeId(plain),
    title: plain.title,
    description: plain.description,
    assignedToId: normalizeId(plain.assignedToId),
    projectId: normalizeId(plain.projectId),
    status: plain.status,
    priority: plain.priority,
    dueDate: plain.dueDate,
    completedAt: plain.completedAt || null,
    createdById: normalizeId(plain.createdById),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    assignee: populatedAssignee && populatedAssignee.name ? serializeUser(populatedAssignee) : null,
    creator: populatedCreator && populatedCreator.name ? serializeUser(populatedCreator) : null,
    project:
      populatedProject && populatedProject.title
        ? {
            id: normalizeId(populatedProject),
            title: populatedProject.title,
            status: populatedProject.status,
            progress: populatedProject.progress
          }
        : null,
    comments: options.includeComments === false
      ? []
      : (plain.comments || []).map((comment) =>
          serializeTaskComment({
            ...comment,
            taskId: normalizeId(plain)
          })
        ),
    attachments: options.includeAttachments === false
      ? []
      : (plain.attachments || []).map((attachment) =>
          serializeTaskAttachment({
            ...attachment,
            taskId: normalizeId(plain)
          })
        )
  };
}

function serializeProject(project, options = {}) {
  const plain = toPlain(project);
  const populatedCreator = plain.creator || plain.createdById;
  const tasks = options.tasks || plain.tasks || [];
  const taskCount = options.taskCount ?? tasks.length;

  return {
    id: normalizeId(plain),
    title: plain.title,
    description: plain.description,
    createdById: normalizeId(plain.createdById),
    deadline: plain.deadline,
    status: plain.status,
    progress: plain.progress,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    creator: populatedCreator && populatedCreator.name ? serializeUser(populatedCreator) : null,
    members: (plain.members || []).map(serializeProjectMember),
    tasks: tasks.map((task) => serializeTask(task, { includeComments: false })),
    _count: {
      tasks: taskCount,
      members: (plain.members || []).length
    }
  };
}

module.exports = {
  serializeActivity,
  serializeNotification,
  serializeProject,
  serializeProjectMember,
  serializeTask,
  serializeTaskAttachment,
  serializeTaskComment,
  serializeUser,
  toPlain
};
