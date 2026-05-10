const express = require('express');

const { deleteUser, getUserById, getUsers, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { updateUserSchema } = require('../validators/userValidators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', validateRequest(updateUserSchema), updateUser);
router.delete('/:id', roleMiddleware('ADMIN'), deleteUser);

module.exports = router;
