const { createComment, listComments } = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

const createCommentController = catchAsync(async (req, res) => {
  const comment = await createComment(req.validated.body, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Comment created successfully',
    data: comment
  });
});

const getTaskCommentsController = catchAsync(async (req, res) => {
  const comments = await listComments(req.params.taskId, req.user);

  return sendSuccess(res, {
    message: 'Comments fetched successfully',
    data: comments
  });
});

module.exports = {
  createCommentController,
  getTaskCommentsController
};
