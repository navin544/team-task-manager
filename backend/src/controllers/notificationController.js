const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { serializeNotification } = require('../utils/serializers');


const getNotificationsController = catchAsync(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user.id
  })
    .sort({ createdAt: -1 })
    .limit(25);

  return sendSuccess(res, {
    message: 'Notifications fetched successfully',
    data: notifications.map(serializeNotification)
  });
});

const markNotificationReadController = catchAsync(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  notification.isRead = true;
  await notification.save();

  return sendSuccess(res, {
    message: 'Notification marked as read',
    data: serializeNotification(notification)
  });
});

module.exports = {
  getNotificationsController,
  markNotificationReadController
};
