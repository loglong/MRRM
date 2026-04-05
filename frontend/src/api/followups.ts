import api from './auth';

export interface FollowupPlan {
  id: string;
  patientId: string;
  patient: { id: string; name: string };
  name: string;
  type: 'ROUTINE' | 'POST_TREATMENT' | 'PRE_APPOINTMENT' | 'CUSTOM';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  frequencyDays?: number;
  startDate: string;
  endDate?: string;
  assignedUserId?: string;
  assignedUser?: { id: string; name: string };
  recordCount?: number;
  completedCount?: number;
  createdAt: string;
}

export interface FollowupRecord {
  id: string;
  planId: string;
  plan: { id: string; name: string };
  patientId: string;
  patient: { id: string; name: string };
  scheduledAt: string;
  completedAt?: string;
  status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED' | 'RESCHEDULED';
  outcome?: string;
  notes?: string;
  completedById?: string;
  completedBy?: { id: string; name: string };
  pathInstanceStepId?: string;
}

export interface FollowupAnalytics {
  total: number;
  completed: number;
  missed: number;
  pending: number;
  completionRate: number;
  byPlan: { planId: string; planName: string; rate: number }[];
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

export const followupsApi = {
  // Plans
  listPlans: (params?: any): Promise<PaginatedResponse<FollowupPlan>> =>
    api.get('/followup-plans', { params }).then(res => res.data),

  getPlanById: (id: string): Promise<FollowupPlan> =>
    api.get(`/followup-plans/${id}`).then(res => res.data),

  createPlan: (data: any): Promise<FollowupPlan> =>
    api.post('/followup-plans', data).then(res => res.data),

  pausePlan: (id: string): Promise<FollowupPlan> =>
    api.put(`/followup-plans/${id}/pause`, {}).then(res => res.data),

  resumePlan: (id: string): Promise<FollowupPlan> =>
    api.put(`/followup-plans/${id}/resume`, {}).then(res => res.data),

  // Records
  listRecords: (params?: any): Promise<PaginatedResponse<FollowupRecord>> =>
    api.get('/followup-records', { params }).then(res => res.data),

  executeRecord: (id: string, data: { outcome?: string; notes?: string }): Promise<FollowupRecord> =>
    api.put(`/followup-records/${id}/execute`, data).then(res => res.data),

  // Analytics
  getCompletionRate: (params?: { startDate?: string; endDate?: string; patientId?: string }): Promise<FollowupAnalytics> =>
    api.get('/followup-records/analytics', { params }).then(res => res.data),
};
