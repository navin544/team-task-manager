const { Schema, model } = require('mongoose');

const { applyBaseSchema } = require('./baseSchema');
const { ACTIVITY_ENTITY_VALUES } = require('./enums');

const activityLogSchema = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ACTIVITY_ENTITY_VALUES,
      required: true
    },
    entityId: {
      type: String,
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ taskId: 1, createdAt: -1 });
activityLogSchema.index({ actorId: 1, createdAt: -1 });

applyBaseSchema(activityLogSchema);

module.exports = model('ActivityLog', activityLogSchema);
