const { z } = require('zod');

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be 3-80 characters').max(80, 'Title must be 3-80 characters'),
    description: z.string().optional(),
    deadline: z.string().refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, 'Deadline must be a future date').optional(),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(80).optional(),
    description: z.string().optional(),
    deadline: z.string().refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, 'Deadline must be a future date').optional(),
    status: z.string().optional(),
  }),
});

const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  }),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
