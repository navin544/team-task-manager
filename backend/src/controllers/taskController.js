const {
  addTaskAttachment,
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask
} = require('../services/taskService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

const createTaskController = catchAsync(async (req, res) => {
  const task = await createTask(req.validated.body, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Task created successfully',
    data: task
  });
});

const getTasksController = catchAsync(async (req, res) => {
  const result = await listTasks(req.user, req.validated.query || {});

  return sendSuccess(res, {
    message: 'Tasks fetched successfully',
    data: result
  });
});

const getTaskController = catchAsync(async (req, res) => {
  const task = await getTaskById(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Task fetched successfully',
    data: task
  });
});

const updateTaskController = catchAsync(async (req, res) => {
  const task = await updateTask(req.params.id, req.validated.body, req.user);

  return sendSuccess(res, {
    message: 'Task updated successfully',
    data: task
  });
});

const deleteTaskController = catchAsync(async (req, res) => {
  await deleteTask(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Task deleted successfully'
  });
});

const addTaskAttachmentController = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'A file upload is required');
  }

  const attachment = await addTaskAttachment(req.params.id, req.file, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Attachment uploaded successfully',
    data: attachment
  });
});

module.exports = {
  addTaskAttachmentController,
  createTaskController,
  deleteTaskController,
  getTaskController,
  getTasksController,
  updateTaskController
};
