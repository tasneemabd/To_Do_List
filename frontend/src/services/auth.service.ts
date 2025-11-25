import api from '../config/api';
import { AuthResponse, LoginInput, RegisterInput } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', {
    email,
    password,
  });
  return response.data.data;
};

export const register = async (
  email: string,
  username: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', {
    email,
    username,
    password,
    name,
  });
  return response.data.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

