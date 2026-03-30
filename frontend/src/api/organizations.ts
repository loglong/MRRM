import api from './auth';

export type OrgStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface Organization {
  id: string;
  name: string;
  code: string;
  status: OrgStatus;
  domain?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  code: string;
  domain?: string;
  metadata?: Record<string, any>;
}

export interface UpdateOrganizationDto {
  name?: string;
  domain?: string;
  status?: OrgStatus;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const organizationsApi = {
  list: async (page = 1, limit = 20): Promise<PaginatedResponse<Organization>> => {
    const response = await api.get<PaginatedResponse<Organization>>('/organizations', {
      params: { page, limit },
    });
    return response.data;
  },

  get: async (id: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  getByCode: async (code: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/code/${code}`);
    return response.data;
  },

  create: async (data: CreateOrganizationDto): Promise<Organization> => {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateOrganizationDto): Promise<Organization> => {
    const response = await api.put<Organization>(`/organizations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<Organization> => {
    const response = await api.delete<Organization>(`/organizations/${id}`);
    return response.data;
  },
};
