import api from './auth';

export interface HealthRecord {
  id: string;
  patientId: string;
  orgId: string;
  category: 'ALLERGY' | 'PAST_HISTORY' | 'EXAM_RESULT' | 'DIAGNOSIS' | 'TREATMENT';
  title: string;
  description: string | null;
  recordDate: string;
  data?: Record<string, any>;
  source: string;
  createdAt: string;
}

export interface HealthReminder {
  id: string;
  patientId: string;
  orgId: string;
  type: 'REVIEW' | 'MEDICATION';
  title: string;
  content: string | null;
  remindAt: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface HealthArchive {
  allergies: HealthRecord[];
  pastHistory: HealthRecord[];
  examResults: HealthRecord[];
}

export interface TimelineResult {
  data: HealthRecord[];
  nextCursor?: string;
}

export const healthApi = {
  getHealthArchive: async (patientId: string): Promise<HealthArchive> => {
    const response = await api.get(`/health/patients/${patientId}/archive`);
    return response.data;
  },

  getHealthTimeline: async (patientId: string, params?: { cursor?: string; limit?: number }): Promise<TimelineResult> => {
    const response = await api.get(`/health/patients/${patientId}/timeline`, { params });
    return response.data;
  },

  createHealthRecord: async (patientId: string, data: {
    category: string;
    title: string;
    description?: string;
    recordDate: string;
    data?: Record<string, any>;
    source?: string;
  }): Promise<HealthRecord> => {
    const response = await api.post(`/health/patients/${patientId}/records`, data);
    return response.data;
  },

  getReminders: async (patientId: string): Promise<HealthReminder[]> => {
    const response = await api.get(`/health/patients/${patientId}/reminders`);
    return response.data;
  },

  createReminder: async (data: {
    patientId: string;
    type: 'REVIEW' | 'MEDICATION';
    title: string;
    content?: string;
    remindAt: string;
  }): Promise<HealthReminder> => {
    const response = await api.post('/health/reminders', data);
    return response.data;
  },

  completeReminder: async (id: string): Promise<HealthReminder> => {
    const response = await api.patch(`/health/reminders/${id}/complete`);
    return response.data;
  },

  deleteReminder: async (id: string): Promise<void> => {
    await api.delete(`/health/reminders/${id}`);
  },
};

export default healthApi;
