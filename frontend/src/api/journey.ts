import api from './auth';

export interface JourneyEvent {
  id: string;
  type: 'TOUCHPOINT' | 'DEMAND' | 'PATH_START' | 'PATH_STEP' | 'PATH_END' | 'FOLLOWUP' | 'MILESTONE';
  title: string;
  subType?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  status?: string;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export interface JourneyFilters {
  page?: number;
  limit?: number;
}

export interface JourneyResponse {
  events: JourneyEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const journeyApi = {
  getPatientJourney: async (patientId: string, filters?: JourneyFilters): Promise<JourneyResponse> => {
    const response = await api.get(`/journey/patients/${patientId}`, { params: filters });
    return response.data;
  },
};

export default journeyApi;
