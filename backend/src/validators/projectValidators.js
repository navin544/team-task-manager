const { z } = require('zod');

const { objectIdSchema, optionalDateSchema } = require('./common');

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().max(1500).optional(),
    deadline: optionalDateSchema,
    status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
    memberIds: z.array(objectIdSchema).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().max(1500).optional(),
    deadline: optionalDateSchema,
    status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
    memberIds: z.array(objectIdSchema).optional()
  }),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({}).optional()
});

const projectQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
    search: z.string().optional(),
    status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional()
  })
});

const addMemberSchema = z.object({
  body: z
    .object({
      userId: objectIdSchema.optional(),
      email: z.string().email().optional(),
      role: z.enum(['ADMIN', 'MEMBER']).optional()
    })
    .refine((value) => value.userId || value.email, {
      message: 'Either userId or email is required'
    }),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({}).optional()
});

const removeMemberSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: objectIdSchema,
    userId: objectIdSchema
  }),
  query: z.object({}).optional()
});

module.exports = {
  addMemberSchema,
  createProjectSchema,
  projectQuerySchema,
  removeMemberSchema,
  updateProjectSchema
};
