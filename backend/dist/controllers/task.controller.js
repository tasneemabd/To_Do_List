"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskStatistics = exports.updateTaskOrder = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const http_status_codes_1 = require("http-status-codes");
const taskService = __importStar(require("../services/task.service"));
const logger_1 = __importDefault(require("../utils/logger"));
// Helper to get Socket.IO instance from request
const getIO = (req) => {
    return req.app.locals.io;
};
/**
 * Create a new task
 */
const createTask = async (req, res, next) => {
    try {
        const userId = req.user.userId;
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
        logger_1.default.info(`Task created: ${task.id} by user ${userId}`);
        // Emit real-time event
        const io = getIO(req);
        io.to(`user:${userId}`).emit('task:created', task);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
/**
 * Get all tasks with filtering, sorting, and pagination
 */
const getTasks = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, status, priority, search, tag, sortBy = 'orderIndex', sortOrder = 'asc', } = req.query;
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
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: result.tasks,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
/**
 * Get a single task by ID
 */
const getTaskById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const task = await taskService.getTaskById(id, userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskById = getTaskById;
/**
 * Update a task
 */
const updateTask = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;
        // Convert dueDate string to Date if provided
        if (updateData.dueDate !== undefined) {
            updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
        }
        const task = await taskService.updateTask(id, userId, updateData);
        logger_1.default.info(`Task updated: ${id} by user ${userId}`);
        // Emit real-time event
        const io = getIO(req);
        io.to(`user:${userId}`).emit('task:updated', task);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
/**
 * Delete a task
 */
const deleteTask = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        await taskService.deleteTask(id, userId);
        logger_1.default.info(`Task deleted: ${id} by user ${userId}`);
        // Emit real-time event
        const io = getIO(req);
        io.to(`user:${userId}`).emit('task:deleted', { id });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
/**
 * Update task order (for drag and drop)
 */
const updateTaskOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { tasks } = req.body;
        if (!Array.isArray(tasks) || tasks.length === 0) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Tasks array is required',
            });
            return;
        }
        const updatedTasks = await taskService.updateTaskOrder(userId, tasks);
        logger_1.default.info(`Task order updated by user ${userId}`);
        // Emit real-time event
        const io = getIO(req);
        io.to(`user:${userId}`).emit('task:order-updated', updatedTasks);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Task order updated successfully',
            data: updatedTasks,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTaskOrder = updateTaskOrder;
/**
 * Get task statistics for dashboard
 */
const getTaskStatistics = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const statistics = await taskService.getTaskStatistics(userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: statistics,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskStatistics = getTaskStatistics;
//# sourceMappingURL=task.controller.js.map