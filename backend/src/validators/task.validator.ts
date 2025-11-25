import { z } from 'zod';

const priorityEnum = z.enum(['low', 'medium', 'high']);
const statusEnum = z.enum(['todo', 'inprogress', 'done']);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    priority: priorityEnum.default('medium'),
    status: statusEnum.default('todo'),
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string()).default([]),
    orderIndex: z.number().int().default(0),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string()).optional(),
    orderIndex: z.number().int().optional(),
    isCompleted: z.boolean().optional(),
  }),
});

export const getTasksSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    search: z.string().optional(),
    tag: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'orderIndex']).default('orderIndex'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    tasks: z.array(
      z.object({
        id: z.string(),
        orderIndex: z.number().int(),
      })
    ),
  }),
});

