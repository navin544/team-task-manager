const express = require('express');

const {
  getNotificationsController,
  markNotificationReadController
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotificationsController);
router.patch('/:id/read', markNotificationReadController);

module.exports = router;
