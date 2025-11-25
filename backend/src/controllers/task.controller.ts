import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Server as SocketIOServer } from 'socket.io';
import { AuthRequest } from '../middleware/auth';
import * as taskService from '../services/task.service';
import logger from '../utils/logger';

// Helper to get Socket.IO instance from request
const getIO = (req: AuthRequest): SocketIOServer => {
  return req.app.locals.io;
};

/**
 * Create a new task
 */
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, description, priority, status, dueDate, tags, orderIndex } = req.body;

    const dueDateObj = dueDate ? new Date(dueDate) : null;

    const task = await taskService.createTask({
      title,
      description,
      priority,
      status,
      dueDate: dueDateObj,
      tags: tags || [],
      orderIndex,
      ownerId: userId,
    });

    logger.info(`Task created: ${task.id} by user ${userId}`);

    // Emit real-time event
    const io = getIO(req);
    io.to(`user:${userId}`).emit('task:created', task);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks with filtering, sorting, and pagination
 */
export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      tag,
      sortBy = 'orderIndex',
      sortOrder = 'asc',
    } = req.query as any;

    const result = await taskService.getTasks({
      ownerId: userId,
      status,
      priority,
      search,
      tag,
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await taskService.getTaskById(id, userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 */
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updateData = req.body;

    // Convert dueDate string to Date if provided
    if (updateData.dueDate !== undefined) {
      updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }

    const task = await taskService.updateTask(id, userId, updateData);

    logger.info(`Task updated: ${id} by user ${userId}`);

    // Emit real-time event
    const io = getIO(req);
    io.to(`user:${userId}`).emit('task:updated', task);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await taskService.deleteTask(id, userId);

    logger.info(`Task deleted: ${id} by user ${userId}`);

    // Emit real-time event
    const io = getIO(req);
    io.to(`user:${userId}`).emit('task:deleted', { id });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task order (for drag and drop)
 */
export const updateTaskOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Tasks array is required',
      });
      return;
    }

    const updatedTasks = await taskService.updateTaskOrder(userId, tasks);

    logger.info(`Task order updated by user ${userId}`);

    // Emit real-time event
    const io = getIO(req);
    io.to(`user:${userId}`).emit('task:order-updated', updatedTasks);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Task order updated successfully',
      data: updatedTasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task statistics for dashboard
 */
export const getTaskStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const statistics = await taskService.getTaskStatistics(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};

