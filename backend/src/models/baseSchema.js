function buildJsonOptions(options = {}) {
  return {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }

      return ret;
    },
    ...options
  };
}

function applyBaseSchema(schema) {
  schema.set('toJSON', buildJsonOptions(schema.get('toJSON')));
  schema.set('toObject', buildJsonOptions(schema.get('toObject')));
}

module.exports = {
  applyBaseSchema
};
