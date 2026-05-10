const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');
const optionalObjectIdSchema = objectIdSchema.optional().or(z.literal(''));
const optionalDateSchema = z
  .string()
  .datetime({ offset: true })
  .optional()
  .or(z.literal(''));

module.exports = {
  objectIdSchema,
  optionalDateSchema,
  optionalObjectIdSchema
};
