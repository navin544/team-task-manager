const { z } = require('zod');

const { objectIdSchema } = require('./common');

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
    avatar: z.string().url().optional().or(z.literal('')),
    role: z.enum(['ADMIN', 'MEMBER']).optional()
  }),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({}).optional()
});

module.exports = {
  updateUserSchema
};
