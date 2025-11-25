import api from '../config/api';
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, TaskStatistics } from '../types';

interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface TaskResponse {
  success: boolean;
  data: Task;
}

interface StatisticsResponse {
  success: boolean;
  data: TaskStatistics;
}

export const getTasks = async (filters?: TaskFilters): Promise<TasksResponse> => {
  const response = await api.get<TasksResponse>('/tasks', { params: filters });
  return response.data;
};

export const getTaskById = async (id: string): Promise<TaskResponse> => {
  const response = await api.get<TaskResponse>(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (task: CreateTaskInput): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>('/tasks', task);
  return response.data;
};

export const updateTask = async (id: string, task: UpdateTaskInput): Promise<TaskResponse> => {
  const response = await api.put<TaskResponse>(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const updateTaskOrder = async (
  tasks: Array<{ id: string; orderIndex: number }>
): Promise<{ success: boolean; data: Task[] }> => {
  const response = await api.patch<{ success: boolean; data: Task[] }>('/tasks/order', { tasks });
  return response.data;
};

export const getTaskStatistics = async (): Promise<StatisticsResponse> => {
  const response = await api.get<StatisticsResponse>('/tasks/statistics');
  return response.data;
};

