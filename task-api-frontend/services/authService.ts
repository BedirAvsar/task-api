import api from '@/lib/api';
import { AuthResponse, RegisterResponse } from '@/types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
}

export async function register(email: string, password: string): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>('/auth/register', { email, password });
  return response.data;
}
