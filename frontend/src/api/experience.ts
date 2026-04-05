import api from './auth';

export interface SatisfactionTrend {
  period: string;
  score: number;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface DecliningPatient {
  patientId: string;
  patientName: string;
  currentScore: number;
  previousScore: number;
  decline: number;
}

export interface ExperienceFilters {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
  orgIds?: string[];
}

export const experienceApi = {
  getSatisfactionTrends: (filters: ExperienceFilters): Promise<SatisfactionTrend[]> =>
    api.get('/experience/satisfaction', { params: filters }).then((res) => res.data),
  getDecliningPatients: (filters: ExperienceFilters & { lookbackWeeks?: number; declineThreshold?: number }): Promise<DecliningPatient[]> =>
    api.get('/experience/declining', { params: filters }).then((res) => res.data),
  exportExperience: (filters: ExperienceFilters): Promise<Blob> =>
    api.get('/experience/export', { params: filters, responseType: 'blob' }).then((res) => res.data),
};
