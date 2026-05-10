const { z } = require('zod');

const { objectIdSchema, optionalDateSchema, optionalObjectIdSchema } = require('./common');

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(140),
    description: z.string().max(2000).optional(),
    assignedToId: optionalObjectIdSchema,
    projectId: objectIdSchema,
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: optionalDateSchema
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(140).optional(),
    description: z.string().max(2000).optional(),
    assignedToId: optionalObjectIdSchema,
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: optionalDateSchema
  }),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({}).optional()
});

const taskQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    projectId: objectIdSchema.optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    assignedTo: objectIdSchema.optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

const commentQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    taskId: objectIdSchema
  }),
  query: z.object({}).optional()
});

module.exports = {
  commentQuerySchema,
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema
};
