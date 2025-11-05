// API base URL - adjust if your backend runs on a different port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Types for API responses
interface ApiError {
  error: string;
  message?: string;
}

/**
 * Get the auth token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Handle API errors - especially 401 (unauthorized)
 */
async function handleError(response: Response): Promise<never> {
  const data: ApiError = await response.json().catch(() => ({
    error: 'Unknown error occurred',
  }));

  // If 401, clear auth and potentially redirect to login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // You might want to trigger a logout event or redirect here
    // For now, we'll just clear storage
  }

  throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
}

/**
 * Base fetch wrapper with automatic token injection
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Automatically add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-OK responses
  if (!response.ok) {
    await handleError(response);
  }

  // Parse and return JSON response
  return response.json();
}

/**
 * API Client with convenient methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  /**
   * POST request for file uploads (multipart/form-data)
   */
  postFormData: <T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const headers: HeadersInit = {};
    // Don't set Content-Type for FormData - browser will set it with boundary
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = fetch(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });

    return response.then(async (res) => {
      if (!res.ok) {
        await handleError(res);
      }
      return res.json();
    });
  },
};

