const mongoose = require('mongoose');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

function isObjectId(value) {
  return objectIdRegex.test(String(value || ''));
}

function normalizeId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value.id) {
    return String(value.id);
  }

  if (value._id) {
    return String(value._id);
  }

  return String(value);
}

function toObjectId(value) {
  return new mongoose.Types.ObjectId(String(value));
}

module.exports = {
  isObjectId,
  normalizeId,
  objectIdRegex,
  toObjectId
};
