import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Create a new task
 */
export declare const createTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get all tasks with filtering, sorting, and pagination
 */
export declare const getTasks: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get a single task by ID
 */
export declare const getTaskById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update a task
 */
export declare const updateTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete a task
 */
export declare const deleteTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update task order (for drag and drop)
 */
export declare const updateTaskOrder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get task statistics for dashboard
 */
export declare const getTaskStatistics: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=task.controller.d.ts.map