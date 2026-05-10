const { z } = require('zod');

const { objectIdSchema } = require('./common');

const createCommentSchema = z.object({
  body: z.object({
    taskId: objectIdSchema,
    content: z.string().min(1).max(1000)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = {
  createCommentSchema
};
