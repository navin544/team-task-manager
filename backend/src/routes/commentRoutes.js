const express = require('express');

const {
  createCommentController,
  getTaskCommentsController
} = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createCommentSchema } = require('../validators/commentValidators');
const { commentQuerySchema } = require('../validators/taskValidators');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateRequest(createCommentSchema), createCommentController);
router.get('/:taskId', validateRequest(commentQuerySchema), getTaskCommentsController);

module.exports = router;
