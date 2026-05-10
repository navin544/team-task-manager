const ActivityLog = require('../models/ActivityLog');
const { serializeActivity } = require('../utils/serializers');


const ACTOR_SELECT = 'name email role avatar createdAt updatedAt';

async function logActivity(payload) {
  const activity = await ActivityLog.create(payload);
  await activity.populate({
    path: 'actorId',
    select: ACTOR_SELECT
  });

  return serializeActivity(activity);
}

module.exports = {
  logActivity
};
