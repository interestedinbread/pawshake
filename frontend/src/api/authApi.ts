import { apiClient } from './apiClient';

// Response types
interface LoginResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  token: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
}

export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  register: (email: string, password: string): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>('/auth/register', { email, password });
  },
};