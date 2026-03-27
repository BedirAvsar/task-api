export interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
}

export interface ApiError {
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface TasksResponse {
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  error: ApiError | null;
}
