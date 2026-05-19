const { z } = require('zod');

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be 3-120 characters').max(120, 'Title must be 3-120 characters'),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    dueDate: z.string().refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date').optional(),
    assigneeId: z.string().uuid('Invalid assignee ID').optional(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date').optional(),
    assigneeId: z.string().uuid().optional(),
  }),
});

const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  }),
});

module.exports = { createTaskSchema, updateTaskSchema, updateTaskStatusSchema };
