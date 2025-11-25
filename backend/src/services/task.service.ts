import Task from '../models/Task.model';
import { AppError } from '../middleware/errorHandler';
import { StatusCodes } from 'http-status-codes';
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
export const createTask = async (input: CreateTaskInput) => {
  // Get the maximum orderIndex for the user's tasks
  const maxOrderResult = await Task.aggregate([
    { $match: { ownerId: new Types.ObjectId(input.ownerId) } },
    { $group: { _id: null, maxOrder: { $max: '$orderIndex' } } },
  ]);

  const maxOrder = maxOrderResult.length > 0 ? maxOrderResult[0].maxOrder : -1;
  const orderIndex = maxOrder + 1;

  const task = await Task.create({
    ...input,
    ownerId: new Types.ObjectId(input.ownerId),
    orderIndex,
  });

  // Populate owner
  await task.populate('ownerId', 'email username name');

  // Format response to match expected structure
  return {
    ...task.toObject(),
    id: task._id.toString(),
    owner: {
      id: (task.ownerId as any)._id?.toString() || task.ownerId.toString(),
      email: (task.ownerId as any).email,
      username: (task.ownerId as any).username,
      name: (task.ownerId as any).name,
    },
    ownerId: task.ownerId.toString(),
  };
};

/**
 * Get tasks with filtering, sorting, and pagination
 */
export const getTasks = async (filters: GetTasksFilters) => {
  const { ownerId, status, priority, search, tag, page, limit, sortBy, sortOrder } = filters;

  const skip = (page - 1) * limit;

  // Build query
  const query: any = {
    ownerId: new Types.ObjectId(ownerId),
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
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Get tasks and total count
  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('ownerId', 'email username name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  // Format tasks to match expected structure
  const formattedTasks = tasks.map((task: any) => ({
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

/**
 * Get a single task by ID
 */
export const getTaskById = async (taskId: string, ownerId: string) => {
  const task = await Task.findOne({
    _id: new Types.ObjectId(taskId),
    ownerId: new Types.ObjectId(ownerId),
  }).populate('ownerId', 'email username name');

  if (!task) {
    throw new AppError('Task not found', StatusCodes.NOT_FOUND);
  }

  const taskObj = task.toObject() as any;
  const owner = taskObj.ownerId as any;

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

/**
 * Update a task
 */
export const updateTask = async (taskId: string, ownerId: string, input: UpdateTaskInput) => {
  // Verify task exists and belongs to user
  const existingTask = await Task.findOne({
    _id: new Types.ObjectId(taskId),
    ownerId: new Types.ObjectId(ownerId),
  });

  if (!existingTask) {
    throw new AppError('Task not found', StatusCodes.NOT_FOUND);
  }

  // Update task
  const task = await Task.findByIdAndUpdate(
    new Types.ObjectId(taskId),
    { $set: input },
    { new: true, runValidators: true }
  ).populate('ownerId', 'email username name');

  if (!task) {
    throw new AppError('Task not found', StatusCodes.NOT_FOUND);
  }

  const taskObj = task.toObject() as any;
  const owner = taskObj.ownerId as any;

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

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string, ownerId: string) => {
  const task = await Task.findOne({
    _id: new Types.ObjectId(taskId),
    ownerId: new Types.ObjectId(ownerId),
  });

  if (!task) {
    throw new AppError('Task not found', StatusCodes.NOT_FOUND);
  }

  await Task.findByIdAndDelete(new Types.ObjectId(taskId));

  return { message: 'Task deleted successfully' };
};

/**
 * Update task order (for drag and drop)
 */
export const updateTaskOrder = async (ownerId: string, tasks: Array<{ id: string; orderIndex: number }>) => {
  // Verify all tasks belong to the user
  const taskIds = tasks.map((t) => new Types.ObjectId(t.id));
  const userTasks = await Task.find({
    _id: { $in: taskIds },
    ownerId: new Types.ObjectId(ownerId),
  });

  if (userTasks.length !== taskIds.length) {
    throw new AppError('Some tasks not found or do not belong to user', StatusCodes.BAD_REQUEST);
  }

  // Update all tasks
  const updatePromises = tasks.map((task) =>
    Task.findByIdAndUpdate(new Types.ObjectId(task.id), {
      $set: { orderIndex: task.orderIndex },
    })
  );

  await Promise.all(updatePromises);

  // Return updated tasks
  const updatedTasks = await Task.find({
    _id: { $in: taskIds },
  })
    .populate('ownerId', 'email username name')
    .lean();

  // Format tasks
  return updatedTasks.map((task: any) => ({
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

/**
 * Get task statistics for dashboard
 */
export const getTaskStatistics = async (ownerId: string) => {
  const ownerObjectId = new Types.ObjectId(ownerId);

  const [
    total,
    completed,
    inProgress,
    todo,
    highPriority,
    mediumPriority,
    lowPriority,
    overdue,
  ] = await Promise.all([
    Task.countDocuments({ ownerId: ownerObjectId }),
    Task.countDocuments({ ownerId: ownerObjectId, isCompleted: true }),
    Task.countDocuments({ ownerId: ownerObjectId, status: 'inprogress' }),
    Task.countDocuments({ ownerId: ownerObjectId, status: 'todo' }),
    Task.countDocuments({ ownerId: ownerObjectId, priority: 'high' }),
    Task.countDocuments({ ownerId: ownerObjectId, priority: 'medium' }),
    Task.countDocuments({ ownerId: ownerObjectId, priority: 'low' }),
    Task.countDocuments({
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
