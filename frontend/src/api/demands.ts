import api from './auth';

// Types
export type DemandType = 'CONSULTATION' | 'TREATMENT' | 'FOLLOWUP' | 'OTHER';
export type DemandPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type DemandStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'LOST';
export type DemandSource = 'PHONE' | 'WECHAT' | 'WEB' | 'WALK_IN' | 'REFERRAL' | 'CAMPAIGN' | 'OTHER';

export interface DemandStatusHistory {
  id: string;
  demandId: string;
  fromStatus: DemandStatus | null;
  toStatus: DemandStatus;
  changedBy: string;
  notes: string | null;
  createdAt: string;
}

export interface Demand {
  id: string;
  patientId: string;
  orgId: string;
  type: DemandType;
  source: DemandSource;
  title: string;
  description: string | null;
  status: DemandStatus;
  priority: DemandPriority;
  estimatedAmount: number | null;
  actualAmount: number | null;
  closeReason: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    name: string;
    phone: string | null;
  };
  statusHistory?: DemandStatusHistory[];
}

export interface CreateDemandDto {
  patientId: string;
  type: DemandType;
  title: string;
  description: string;
  priority?: DemandPriority;
  source?: DemandSource;
  estimatedAmount?: number;
}

export interface UpdateDemandDto {
  title?: string;
  description?: string | null;
  priority?: DemandPriority;
  source?: DemandSource;
  estimatedAmount?: number;
  actualAmount?: number;
  closeReason?: string;
}

export interface ChangeStatusDto {
  status: DemandStatus;
  notes?: string;
}

export interface DemandFilters {
  patientId?: string;
  status?: DemandStatus;
  type?: DemandType;
  priority?: DemandPriority;
  source?: DemandSource;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface DemandStats {
  total: number;
  byStatus: Record<DemandStatus, number>;
  byType: Record<DemandType, number>;
  byPriority: Record<DemandPriority, number>;
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

// Status labels for display
export const demandStatusLabels: Record<DemandStatus, string> = {
  OPEN: '新建',
  IN_PROGRESS: '跟进中',
  PENDING: '待成交',
  FULFILLED: '已成交',
  CANCELLED: '已取消',
  LOST: '已流失',
};

export const demandTypeLabels: Record<DemandType, string> = {
  CONSULTATION: '咨询',
  TREATMENT: '治疗',
  FOLLOWUP: '随访',
  OTHER: '其他',
};

export const demandPriorityLabels: Record<DemandPriority, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急',
};

export const demandSourceLabels: Record<DemandSource, string> = {
  PHONE: '电话',
  WECHAT: '微信',
  WEB: '网站',
  WALK_IN: '上门',
  REFERRAL: '转介绍',
  CAMPAIGN: '活动',
  OTHER: '其他',
};

// Valid status transitions
export const validStatusTransitions: Record<DemandStatus, DemandStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED', 'LOST'],
  IN_PROGRESS: ['PENDING', 'FULFILLED', 'CANCELLED', 'LOST'],
  PENDING: ['FULFILLED', 'CANCELLED', 'LOST'],
  FULFILLED: [],
  CANCELLED: [],
  LOST: [],
};

// API functions
export const demandsApi = {
  list: (params?: DemandFilters): Promise<PaginatedResponse<Demand>> => {
    return api.get('/demands', { params }).then((res) => res.data);
  },

  getById: (id: string): Promise<Demand> => {
    return api.get(`/demands/${id}`).then((res) => res.data);
  },

  create: (data: CreateDemandDto): Promise<Demand> => {
    return api.post('/demands', data).then((res) => res.data);
  },

  update: (id: string, data: UpdateDemandDto): Promise<Demand> => {
    return api.put(`/demands/${id}`, data).then((res) => res.data);
  },

  changeStatus: (id: string, data: ChangeStatusDto): Promise<Demand> => {
    return api.put(`/demands/${id}/status`, data).then((res) => res.data);
  },

  getStatusHistory: (id: string): Promise<DemandStatusHistory[]> => {
    return api.get(`/demands/${id}/history`).then((res) => res.data);
  },

  getPatientDemands: (patientId: string): Promise<Demand[]> => {
    return api.get(`/patients/${patientId}/demands`).then((res) => res.data);
  },

  getStats: (): Promise<DemandStats> => {
    return api.get('/demands/stats').then((res) => res.data);
  },
};
