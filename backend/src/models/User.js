const { Schema, model } = require('mongoose');

const { applyBaseSchema } = require('./baseSchema');
const { ROLE_VALUES } = require('./enums');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: 'MEMBER'
    },
    avatar: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

applyBaseSchema(userSchema);

module.exports = model('User', userSchema);
