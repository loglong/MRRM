import api from './auth';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  orgId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING_VERIFICATION';
  roles?: { role: { id: string; name: string; code: string } }[];
  organization?: { id: string; name: string };
  failedLoginAttempts: number;
  lockedUntil?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
}

export interface UsersListResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  list: async (params?: { page?: number; limit?: number }): Promise<UsersListResponse> => {
    const response = await api.get<UsersListResponse>('/users', { params });
    return response.data;
  },

  get: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  changeStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<User> => {
    const response = await api.put<User>(`/users/${id}/status`, { status });
    return response.data;
  },

  assignRoles: async (id: string, roleIds: string[]): Promise<void> => {
    await api.post(`/users/${id}/roles`, { roleIds });
  },
};
