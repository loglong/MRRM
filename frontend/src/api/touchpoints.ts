import api from './auth';

export interface Touchpoint {
  id: string;
  patientId: string;
  patient: { id: string; name: string };
  type: 'VISIT' | 'CALL' | 'MESSAGE' | 'EMAIL' | 'WECHAT' | 'VIDEO' | 'SMS' | 'OTHER';
  channel?: 'OFFLINE' | 'ONLINE' | 'MOBILE' | 'PHONE';
  title: string;
  content?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  duration?: number;
  outcome?: string;
  followupRequired: boolean;
  followupDate?: string;
  createdAt: string;
}

export interface TouchpointFilters {
  patientId?: string;
  type?: string;
  channel?: string;
  sentiment?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TouchpointAnalytics {
  counts: { date: string; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
  total: number;
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

export const touchpointsApi = {
  list: (filters?: TouchpointFilters): Promise<PaginatedResponse<Touchpoint>> =>
    api.get('/touchpoints', { params: filters }).then((res) => res.data),

  getById: (id: string): Promise<Touchpoint> =>
    api.get(`/touchpoints/${id}`).then((res) => res.data),

  create: (data: Partial<Touchpoint>): Promise<Touchpoint> =>
    api.post('/touchpoints', data).then((res) => res.data),

  update: (id: string, data: Partial<Touchpoint>): Promise<Touchpoint> =>
    api.put(`/touchpoints/${id}`, data).then((res) => res.data),

  void: (id: string, reason: string): Promise<Touchpoint> =>
    api.put(`/touchpoints/${id}/void`, { reason }).then((res) => res.data),

  getAnalytics: (params: {
    startDate?: string;
    endDate?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<TouchpointAnalytics> =>
    api.get('/touchpoints/analytics', { params }).then((res) => res.data),
};
