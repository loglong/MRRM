import api from './auth';

export interface Patient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN' | null;
  birthDate: string | null;
  allergyHistory: string | null;
  pastHistory: string | null;
  address: string | null;
  tier: 'HIGH_VALUE' | 'REGULAR' | 'LOST_RISK';
  status: 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'DECEASED';
  orgId: string;
  assignedUserId: string | null;
  lastVisitAt: string | null;
  nextVisitAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Relations (available when fetching single patient)
  demands?: Demand[];
  touchpoints?: Touchpoint[];
  followupPlans?: FollowupPlan[];
}

export interface Demand {
  id: string;
  patientId: string;
  orgId: string;
  type: string;
  source: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
}

export interface Touchpoint {
  id: string;
  patientId: string;
  orgId: string;
  type: string;
  channel: string;
  title: string;
  content: string | null;
  sentiment: string | null;
  createdAt: string;
}

export interface FollowupPlan {
  id: string;
  patientId: string;
  orgId: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
}

export interface CreatePatientDto {
  name: string;
  phone?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  birthDate?: string;
  allergyHistory?: string;
  pastHistory?: string;
  address?: string;
  tier?: 'HIGH_VALUE' | 'REGULAR' | 'LOST_RISK';
}

export interface UpdatePatientDto {
  name?: string;
  phone?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  birthDate?: string;
  allergyHistory?: string;
  pastHistory?: string;
  address?: string;
  tier?: 'HIGH_VALUE' | 'REGULAR' | 'LOST_RISK';
  status?: 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'DECEASED';
  assignedUserId?: string;
  lastVisitAt?: string;
  nextVisitAt?: string;
}

export interface PatientStats {
  total: number;
  byTier: {
    HIGH_VALUE: number;
    REGULAR: number;
    LOST_RISK: number;
  };
  byGender: Record<string, number>;
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

export const patientsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    tier?: string;
    search?: string;
  }): Promise<PaginatedResponse<Patient>> => {
    return api.get('/patients', { params });
  },

  search: (
    query: string,
    field: 'name' | 'phone' | 'all' = 'all',
  ): Promise<Patient[]> => {
    return api.get('/patients/search', {
      params: { q: query, field },
    });
  },

  getById: (id: string): Promise<Patient> => {
    return api.get(`/patients/${id}`);
  },

  create: (data: CreatePatientDto): Promise<Patient> => {
    return api.post('/patients', data);
  },

  update: (id: string, data: UpdatePatientDto): Promise<Patient> => {
    return api.put(`/patients/${id}`, data);
  },

  delete: (id: string): Promise<void> => {
    return api.delete(`/patients/${id}`);
  },

  getStats: (): Promise<PatientStats> => {
    return api.get('/patients/stats');
  },
};
