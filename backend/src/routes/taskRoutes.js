const express = require('express');

const {
  addTaskAttachmentController,
  createTaskController,
  deleteTaskController,
  getTaskController,
  getTasksController,
  updateTaskController
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createTaskSchema, taskQuerySchema, updateTaskSchema } = require('../validators/taskValidators');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('ADMIN'), validateRequest(createTaskSchema), createTaskController);
router.get('/', validateRequest(taskQuerySchema), getTasksController);
router.get('/:id', getTaskController);
router.put('/:id', validateRequest(updateTaskSchema), updateTaskController);
router.delete('/:id', roleMiddleware('ADMIN'), deleteTaskController);
router.post('/:id/attachments', upload.single('file'), addTaskAttachmentController);

module.exports = router;
