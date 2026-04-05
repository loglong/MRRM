import api from './auth';

export interface AuditLog {
  id: string;
  userId: string | null;
  orgId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestMethod: string | null;
  requestPath: string | null;
  requestBody: any;
  responseStatus: number | null;
  errorMessage: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export const auditApi = {
  getLogs: (params: {
    page?: number;
    limit?: number;
    filters?: AuditLogFilters;
  }): Promise<AuditLogResponse> => {
    const { page = 1, limit = 50, filters = {} } = params;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== ''),
      ),
    });
    return api.get(`/audit?${query}`).then((res) => res.data);
  },

  getLogsByEntity: (entityType: string, entityId: string): Promise<AuditLog[]> => {
    return api.get(`/audit/entity/${entityType}/${entityId}`).then((res) => res.data);
  },

  exportLogs: (startDate: string, endDate: string): string => {
    const token = localStorage.getItem('mrrm_token');
    return `/api/v1/audit/export?startDate=${startDate}&endDate=${endDate}${token ? `&token=${token}` : ''}`;
  },
};
