const express = require('express');

const {
  addProjectMemberController,
  createProjectController,
  deleteProjectController,
  getProjectController,
  getProjectsController,
  removeProjectMemberController,
  updateProjectController
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  addMemberSchema,
  createProjectSchema,
  projectQuerySchema,
  removeMemberSchema,
  updateProjectSchema
} = require('../validators/projectValidators');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('ADMIN'), validateRequest(createProjectSchema), createProjectController);
router.get('/', validateRequest(projectQuerySchema), getProjectsController);
router.get('/:id', getProjectController);
router.put('/:id', roleMiddleware('ADMIN'), validateRequest(updateProjectSchema), updateProjectController);
router.delete('/:id', roleMiddleware('ADMIN'), deleteProjectController);
router.post(
  '/:id/members',
  roleMiddleware('ADMIN'),
  validateRequest(addMemberSchema),
  addProjectMemberController
);
router.delete(
  '/:id/members/:userId',
  roleMiddleware('ADMIN'),
  validateRequest(removeMemberSchema),
  removeProjectMemberController
);

module.exports = router;
