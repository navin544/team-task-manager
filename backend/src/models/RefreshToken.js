const { Schema, model } = require('mongoose');

const { applyBaseSchema } = require('./baseSchema');

const refreshTokenSchema = new Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: {
      type: Date,
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

applyBaseSchema(refreshTokenSchema);

module.exports = model('RefreshToken', refreshTokenSchema);
