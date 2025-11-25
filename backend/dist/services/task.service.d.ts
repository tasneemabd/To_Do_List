import { Types } from 'mongoose';
interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'inprogress' | 'done';
    dueDate?: Date | null;
    tags?: string[];
    orderIndex?: number;
    ownerId: string;
}
interface UpdateTaskInput {
    title?: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'inprogress' | 'done';
    dueDate?: Date | null;
    tags?: string[];
    orderIndex?: number;
    isCompleted?: boolean;
}
interface GetTasksFilters {
    ownerId: string;
    status?: 'todo' | 'inprogress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    search?: string;
    tag?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
/**
 * Create a new task
 */
export declare const createTask: (input: CreateTaskInput) => Promise<{
    id: string;
    owner: {
        id: any;
        email: any;
        username: any;
        name: any;
    };
    ownerId: string;
    _id: Types.ObjectId;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "inprogress" | "done";
    dueDate?: Date;
    tags: string[];
    orderIndex: number;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    $locals: Record<string, unknown>;
    $op: "save" | "validate" | "remove" | null;
    $where: Record<string, unknown>;
    baseModelName?: string;
    collection: import("mongoose").Collection;
    db: import("mongoose").Connection;
    errors?: import("mongoose").Error.ValidationError;
    isNew: boolean;
    schema: import("mongoose").Schema;
    __v: number;
}>;
/**
 * Get tasks with filtering, sorting, and pagination
 */
export declare const getTasks: (filters: GetTasksFilters) => Promise<{
    tasks: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get a single task by ID
 */
export declare const getTaskById: (taskId: string, ownerId: string) => Promise<any>;
/**
 * Update a task
 */
export declare const updateTask: (taskId: string, ownerId: string, input: UpdateTaskInput) => Promise<any>;
/**
 * Delete a task
 */
export declare const deleteTask: (taskId: string, ownerId: string) => Promise<{
    message: string;
}>;
/**
 * Update task order (for drag and drop)
 */
export declare const updateTaskOrder: (ownerId: string, tasks: Array<{
    id: string;
    orderIndex: number;
}>) => Promise<any[]>;
/**
 * Get task statistics for dashboard
 */
export declare const getTaskStatistics: (ownerId: string) => Promise<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    byPriority: {
        high: number;
        medium: number;
        low: number;
    };
    overdue: number;
}>;
export {};
//# sourceMappingURL=task.service.d.ts.map