const { Schema, model } = require('mongoose');

const { applyBaseSchema } = require('./baseSchema');

const passwordResetTokenSchema = new Schema(
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
    usedAt: {
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

applyBaseSchema(passwordResetTokenSchema);

module.exports = model('PasswordResetToken', passwordResetTokenSchema);
