const { Schema, model } = require('mongoose');

const { applyBaseSchema } = require('./baseSchema');
const { PROJECT_STATUS_VALUES, ROLE_VALUES } = require('./enums');

const projectMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: 'MEMBER'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true
  }
);

applyBaseSchema(projectMemberSchema);

const projectSchema = new Schema(
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
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: {
      type: [projectMemberSchema],
      default: []
    },
    deadline: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: PROJECT_STATUS_VALUES,
      default: 'PLANNING'
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ status: 1, updatedAt: -1 });

applyBaseSchema(projectSchema);

module.exports = model('Project', projectSchema);
