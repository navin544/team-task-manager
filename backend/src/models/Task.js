const { Schema, model } = require('mongoose');

const { applyBaseSchema } = require('./baseSchema');
const { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } = require('./enums');

const taskCommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

const taskAttachmentSchema = new Schema(
  {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true
  }
);

applyBaseSchema(taskCommentSchema);
applyBaseSchema(taskAttachmentSchema);

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: null
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    status: {
      type: String,
      enum: TASK_STATUS_VALUES,
      default: 'TODO'
    },
    priority: {
      type: String,
      enum: TASK_PRIORITY_VALUES,
      default: 'MEDIUM'
    },
    dueDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    comments: {
      type: [taskCommentSchema],
      default: []
    },
    attachments: {
      type: [taskAttachmentSchema],
      default: []
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedToId: 1 });
taskSchema.index({ updatedAt: -1 });

applyBaseSchema(taskSchema);

module.exports = model('Task', taskSchema);
