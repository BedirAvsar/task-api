import api from '@/lib/api';
import { Task, TasksResponse, ApiResponse } from '@/types';

export interface GetTasksParams {
  page?: number;
  limit?: number;
  completed?: boolean;
  search?: string;
}

export async function getTasks(params?: GetTasksParams): Promise<TasksResponse> {
  const response = await api.get<TasksResponse>('/tasks', { params });
  return response.data;
}

export async function createTask(title: string): Promise<ApiResponse<Task>> {
  const response = await api.post<ApiResponse<Task>>('/tasks', { title });
  return response.data;
}

export async function updateTask(id: string, updates: { title?: string; completed?: boolean }): Promise<ApiResponse<Task>> {
  const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
  return response.data;
}

export async function deleteTask(id: string): Promise<ApiResponse<{ message: string }>> {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
  return response.data;
}
