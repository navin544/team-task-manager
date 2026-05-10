const { getSocketServer } = require('../config/socket');
const Notification = require('../models/Notification');
const { serializeNotification } = require('../utils/serializers');


async function createNotification({ userId, title, message, type = 'SYSTEM', entityId = null }) {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    entityId
  });
  const serializedNotification = serializeNotification(notification);

  const io = getSocketServer();
  if (io) {
    io.to(`user:${userId}`).emit('notifications:new', serializedNotification);
  }

  return serializedNotification;
}

async function createNotificationsBulk(userIds, payload) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  return Promise.all(
    uniqueUserIds.map((userId) =>
      createNotification({
        userId,
        ...payload
      })
    )
  );
}

module.exports = {
  createNotification,
  createNotificationsBulk
};
