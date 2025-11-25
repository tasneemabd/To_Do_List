"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskStatistics = exports.updateTaskOrder = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const Task_model_1 = __importDefault(require("../models/Task.model"));
const errorHandler_1 = require("../middleware/errorHandler");
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
/**
 * Create a new task
 */
const createTask = async (input) => {
    // Get the maximum orderIndex for the user's tasks
    const maxOrderResult = await Task_model_1.default.aggregate([
        { $match: { ownerId: new mongoose_1.Types.ObjectId(input.ownerId) } },
        { $group: { _id: null, maxOrder: { $max: '$orderIndex' } } },
    ]);
    const maxOrder = maxOrderResult.length > 0 ? maxOrderResult[0].maxOrder : -1;
    const orderIndex = maxOrder + 1;
    const task = await Task_model_1.default.create({
        ...input,
        ownerId: new mongoose_1.Types.ObjectId(input.ownerId),
        orderIndex,
    });
    // Populate owner
    await task.populate('ownerId', 'email username name');
    // Format response to match expected structure
    return {
        ...task.toObject(),
        id: task._id.toString(),
        owner: {
            id: task.ownerId._id?.toString() || task.ownerId.toString(),
            email: task.ownerId.email,
            username: task.ownerId.username,
            name: task.ownerId.name,
        },
        ownerId: task.ownerId.toString(),
    };
};
exports.createTask = createTask;
/**
 * Get tasks with filtering, sorting, and pagination
 */
const getTasks = async (filters) => {
    const { ownerId, status, priority, search, tag, page, limit, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;
    // Build query
    const query = {
        ownerId: new mongoose_1.Types.ObjectId(ownerId),
    };
    if (status) {
        query.status = status;
    }
    if (priority) {
        query.priority = priority;
    }
    if (tag) {
        query.tags = { $in: [tag] };
    }
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    // Get tasks and total count
    const [tasks, total] = await Promise.all([
        Task_model_1.default.find(query)
            .populate('ownerId', 'email username name')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Task_model_1.default.countDocuments(query),
    ]);
    // Format tasks to match expected structure
    const formattedTasks = tasks.map((task) => ({
        ...task,
        id: task._id.toString(),
        ownerId: task.ownerId._id?.toString() || task.ownerId.toString(),
        owner: {
            id: task.ownerId._id?.toString() || task.ownerId.toString(),
            email: task.ownerId.email,
            username: task.ownerId.username,
            name: task.ownerId.name,
        },
    }));
    return {
        tasks: formattedTasks,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};
exports.getTasks = getTasks;
/**
 * Get a single task by ID
 */
const getTaskById = async (taskId, ownerId) => {
    const task = await Task_model_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(taskId),
        ownerId: new mongoose_1.Types.ObjectId(ownerId),
    }).populate('ownerId', 'email username name');
    if (!task) {
        throw new errorHandler_1.AppError('Task not found', http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    const taskObj = task.toObject();
    const owner = taskObj.ownerId;
    return {
        ...taskObj,
        id: taskObj._id.toString(),
        ownerId: owner._id?.toString() || owner.toString(),
        owner: {
            id: owner._id?.toString() || owner.toString(),
            email: owner.email || '',
            username: owner.username || '',
            name: owner.name || '',
        },
    };
};
exports.getTaskById = getTaskById;
/**
 * Update a task
 */
const updateTask = async (taskId, ownerId, input) => {
    // Verify task exists and belongs to user
    const existingTask = await Task_model_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(taskId),
        ownerId: new mongoose_1.Types.ObjectId(ownerId),
    });
    if (!existingTask) {
        throw new errorHandler_1.AppError('Task not found', http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    // Update task
    const task = await Task_model_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(taskId), { $set: input }, { new: true, runValidators: true }).populate('ownerId', 'email username name');
    if (!task) {
        throw new errorHandler_1.AppError('Task not found', http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    const taskObj = task.toObject();
    const owner = taskObj.ownerId;
    return {
        ...taskObj,
        id: taskObj._id.toString(),
        ownerId: owner._id?.toString() || owner.toString(),
        owner: {
            id: owner._id?.toString() || owner.toString(),
            email: owner.email || '',
            username: owner.username || '',
            name: owner.name || '',
        },
    };
};
exports.updateTask = updateTask;
/**
 * Delete a task
 */
const deleteTask = async (taskId, ownerId) => {
    const task = await Task_model_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(taskId),
        ownerId: new mongoose_1.Types.ObjectId(ownerId),
    });
    if (!task) {
        throw new errorHandler_1.AppError('Task not found', http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    await Task_model_1.default.findByIdAndDelete(new mongoose_1.Types.ObjectId(taskId));
    return { message: 'Task deleted successfully' };
};
exports.deleteTask = deleteTask;
/**
 * Update task order (for drag and drop)
 */
const updateTaskOrder = async (ownerId, tasks) => {
    // Verify all tasks belong to the user
    const taskIds = tasks.map((t) => new mongoose_1.Types.ObjectId(t.id));
    const userTasks = await Task_model_1.default.find({
        _id: { $in: taskIds },
        ownerId: new mongoose_1.Types.ObjectId(ownerId),
    });
    if (userTasks.length !== taskIds.length) {
        throw new errorHandler_1.AppError('Some tasks not found or do not belong to user', http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    // Update all tasks
    const updatePromises = tasks.map((task) => Task_model_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(task.id), {
        $set: { orderIndex: task.orderIndex },
    }));
    await Promise.all(updatePromises);
    // Return updated tasks
    const updatedTasks = await Task_model_1.default.find({
        _id: { $in: taskIds },
    })
        .populate('ownerId', 'email username name')
        .lean();
    // Format tasks
    return updatedTasks.map((task) => ({
        ...task,
        id: task._id.toString(),
        ownerId: task.ownerId._id?.toString() || task.ownerId.toString(),
        owner: {
            id: task.ownerId._id?.toString() || task.ownerId.toString(),
            email: task.ownerId.email,
            username: task.ownerId.username,
            name: task.ownerId.name,
        },
    }));
};
exports.updateTaskOrder = updateTaskOrder;
/**
 * Get task statistics for dashboard
 */
const getTaskStatistics = async (ownerId) => {
    const ownerObjectId = new mongoose_1.Types.ObjectId(ownerId);
    const [total, completed, inProgress, todo, highPriority, mediumPriority, lowPriority, overdue,] = await Promise.all([
        Task_model_1.default.countDocuments({ ownerId: ownerObjectId }),
        Task_model_1.default.countDocuments({ ownerId: ownerObjectId, isCompleted: true }),
        Task_model_1.default.countDocuments({ ownerId: ownerObjectId, status: 'inprogress' }),
        Task_model_1.default.countDocuments({ ownerId: ownerObjectId, status: 'todo' }),
        Task_model_1.default.countDocuments({ ownerId: ownerObjectId, priority: 'high' }),
        Task_model_1.default.countDocuments({ ownerId: ownerObjectId, priority: 'medium' }),
        Task_model_1.default.countDocuments({ ownerId: ownerObjectId, priority: 'low' }),
        Task_model_1.default.countDocuments({
            ownerId: ownerObjectId,
            dueDate: { $lt: new Date() },
            isCompleted: false,
        }),
    ]);
    return {
        total,
        completed,
        inProgress,
        todo,
        byPriority: {
            high: highPriority,
            medium: mediumPriority,
            low: lowPriority,
        },
        overdue,
    };
};
exports.getTaskStatistics = getTaskStatistics;
//# sourceMappingURL=task.service.js.map