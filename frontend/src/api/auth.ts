import axios, { type AxiosError } from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for httpOnly JWT
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mrrm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mrrm_token');
      localStorage.removeItem('mrrm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth API functions
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    orgId: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  refreshToken: async (): Promise<{ accessToken: string | null }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  getAuthingSSOUrl: async (): Promise<{ url: string }> => {
    const response = await api.get<{ url: string }>('/auth/authing/sso-url');
    return response.data;
  },

  authingCallback: async (code: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/authing/callback', { code });
    return response.data;
  },
};

export default api;
