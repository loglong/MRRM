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
  pathId?: string;  // LINK-01
  path?: { id: string; name: string; specialty?: string };  // LINK-01
  recordCount?: number;
  completedCount?: number;
  createdAt: string;
}

// LINK-01: Path-based follow-up interfaces
export interface SuggestedPath {
  id: string;
  name: string;
  description?: string;
  specialty?: string;
  diagnosisName?: string;
  surgeryName?: string;
  icd10Code?: string;
  icd9Code?: string;
  stepCount: number;
  matchReason: string;
}

export interface PathSuggestion {
  patient: {
    id: string;
    name: string;
    specialty?: string;
  };
  demands: {
    id: string;
    title: string;
    status: string;
  }[];
  suggestedPaths: SuggestedPath[];
}

export interface AvailablePath {
  id: string;
  name: string;
  description?: string;
  specialty?: string;
  diagnosisName?: string;
  surgeryName?: string;
  icd10Code?: string;
  icd9Code?: string;
  stepCount: number;
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

  listPending: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<FollowupRecord>> =>
    api.get('/followup-records', { params: { ...params, status: 'PENDING' } }).then(res => res.data),

  executeRecord: (id: string, data: { outcome?: string; notes?: string }): Promise<FollowupRecord> =>
    api.put(`/followup-records/${id}/execute`, data).then(res => res.data),

  // Analytics
  getCompletionRate: (params?: { startDate?: string; endDate?: string; patientId?: string }): Promise<FollowupAnalytics> =>
    api.get('/followup-records/analytics', { params }).then(res => res.data),

  // Path-based follow-up (LINK-01)
  getAvailablePaths: (params?: { specialty?: string; search?: string }): Promise<AvailablePath[]> =>
    api.get('/paths/available', { params }).then(res => res.data),

  getSuggestedPathsForPatient: (patientId: string): Promise<PathSuggestion> =>
    api.get(`/patients/${patientId}/suggested-paths`).then(res => res.data),

  createPlanFromPath: (patientId: string, pathId: string, data: {
    name?: string;
    startDate: string;
    endDate?: string;
    assignedUserId?: string;
  }): Promise<FollowupPlan> =>
    api.post(`/patients/${patientId}/followup-plans/from-path/${pathId}`, data).then(res => res.data),
};
