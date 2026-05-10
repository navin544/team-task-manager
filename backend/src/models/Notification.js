const { Schema, model } = require('mongoose');

const { applyBaseSchema } = require('./baseSchema');
const { NOTIFICATION_TYPE_VALUES } = require('./enums');

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      default: 'SYSTEM'
    },
    entityId: {
      type: String,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

applyBaseSchema(notificationSchema);

module.exports = model('Notification', notificationSchema);
