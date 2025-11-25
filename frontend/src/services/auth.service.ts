import api from '../config/api';
import { AuthResponse } from '../types';

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
  try {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', {
      email,
      username,
      password,
      name,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Register API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

