export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'done';
  dueDate?: string | null;
  tags: string[];
  orderIndex: number;
  isCompleted: boolean;
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatistics {
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
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'inprogress' | 'done';
  dueDate?: string | null;
  tags?: string[];
  orderIndex?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'inprogress' | 'done';
  dueDate?: string | null;
  tags?: string[];
  orderIndex?: number;
  isCompleted?: boolean;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: 'todo' | 'inprogress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  tag?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'orderIndex';
  sortOrder?: 'asc' | 'desc';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

