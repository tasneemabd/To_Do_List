"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderSchema = exports.taskIdSchema = exports.getTasksSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const priorityEnum = zod_1.z.enum(['low', 'medium', 'high']);
const statusEnum = zod_1.z.enum(['todo', 'inprogress', 'done']);
exports.createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(200),
        description: zod_1.z.string().max(1000).optional(),
        priority: priorityEnum.default('medium'),
        status: statusEnum.default('todo'),
        dueDate: zod_1.z.string().datetime().optional().nullable(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        orderIndex: zod_1.z.number().int().default(0),
    }),
});
exports.updateTaskSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(200).optional(),
        description: zod_1.z.string().max(1000).optional().nullable(),
        priority: priorityEnum.optional(),
        status: statusEnum.optional(),
        dueDate: zod_1.z.string().datetime().optional().nullable(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        orderIndex: zod_1.z.number().int().optional(),
        isCompleted: zod_1.z.boolean().optional(),
    }),
});
exports.getTasksSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).default('1'),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default('10'),
        status: statusEnum.optional(),
        priority: priorityEnum.optional(),
        search: zod_1.z.string().optional(),
        tag: zod_1.z.string().optional(),
        sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'orderIndex']).default('orderIndex'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
    }),
});
exports.taskIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
exports.updateOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        tasks: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            orderIndex: zod_1.z.number().int(),
        })),
    }),
});
//# sourceMappingURL=task.validator.js.map