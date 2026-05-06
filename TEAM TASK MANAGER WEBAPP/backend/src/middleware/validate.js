const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    next(error);
  }
};

// Validation Schemas
const schemas = {
  signup: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'member']).optional()
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  }),

  createProject: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().max(500).optional()
  }),

  createTask: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(1000).optional(),
    status: z.enum(['todo', 'inprogress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().optional().nullable(),
    projectId: z.string().min(1, 'Project is required'),
    assignedTo: z.string().optional().nullable()
  }),

  updateTaskStatus: z.object({
    status: z.enum(['todo', 'inprogress', 'completed'])
  })
};

module.exports = { validate, schemas };
