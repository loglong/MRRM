import api from './auth';

export interface PathStep {
  id: string;
  pathId: string;
  name: string;
  description: string | null;
  stepOrder: number;
  stepType: string;
  estimatedDays: number | null;
  timeoutHours: number | null;
  triggerAction: string | null;
  notificationTemplate: string | null;
}

export interface PathTemplate {
  id: string;
  name: string;
  description: string | null;
  orgId: string;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  stepCount?: number;
  steps?: PathStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePathDto {
  name: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

export interface UpdatePathDto {
  name?: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

export interface CreatePathStepDto {
  name: string;
  description?: string;
  stepOrder: number;
  stepType?: 'START' | 'TASK' | 'AUTOMATED_ACTION' | 'WAIT' | 'DECISION' | 'END';
  estimatedDays?: number;
  timeoutHours?: number;
  triggerAction?: string;
  notificationTemplate?: string;
}

export interface PathInstance {
  id: string;
  pathId: string;
  path: { id: string; name: string };
  patientId: string;
  patient: { id: string; name: string };
  demandId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentStep: number;
  startedAt: string;
  completedAt: string | null;
  orgId: string;
  steps: PathInstanceStep[];
}

export interface PathInstanceStep {
  id: string;
  instanceId: string;
  stepId: string;
  step: PathStep;
  stepOrder: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'OVERDUE';
  dueDate: string;
  completedAt: string | null;
  notes: string | null;
}

export interface AssignPathDto {
  patientId: string;
  demandId: string;
  startDate?: string;
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

export const pathsApi = {
  // Path Templates
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<PathTemplate>> => {
    return api.get('/path-templates', { params });
  },

  getById: (id: string): Promise<PathTemplate> => {
    return api.get(`/path-templates/${id}`);
  },

  create: (data: CreatePathDto): Promise<PathTemplate> => {
    return api.post('/path-templates', data);
  },

  update: (id: string, data: UpdatePathDto): Promise<PathTemplate> => {
    return api.put(`/path-templates/${id}`, data);
  },

  delete: (id: string): Promise<void> => {
    return api.delete(`/path-templates/${id}`);
  },

  duplicate: (id: string): Promise<PathTemplate> => {
    return api.post(`/path-templates/${id}/duplicate`, {});
  },

  // Path Steps
  addStep: (pathId: string, data: CreatePathStepDto): Promise<PathStep> => {
    return api.post(`/path-templates/${pathId}/steps`, data);
  },

  updateStep: (pathId: string, stepId: string, data: Partial<CreatePathStepDto>): Promise<PathStep> => {
    return api.put(`/path-templates/${pathId}/steps/${stepId}`, data);
  },

  deleteStep: (pathId: string, stepId: string): Promise<void> => {
    return api.delete(`/path-templates/${pathId}/steps/${stepId}`);
  },

  // Path Assignment
  assignToPatient: (pathId: string, data: AssignPathDto): Promise<PathInstance> => {
    return api.post(`/path-templates/${pathId}/assign`, data);
  },

  // Path Instances
  getInstances: (params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    demandId?: string;
    status?: string;
  }): Promise<PaginatedResponse<PathInstance>> => {
    return api.get('/path-instances', { params });
  },

  getInstance: (id: string): Promise<PathInstance> => {
    return api.get(`/path-instances/${id}`);
  },

  completeStep: (instanceId: string, stepId: string, notes?: string): Promise<PathInstance> => {
    return api.put(`/path-instances/${instanceId}/steps/${stepId}/complete`, { notes });
  },

  skipStep: (instanceId: string, stepId: string, reason?: string): Promise<PathInstance> => {
    return api.put(`/path-instances/${instanceId}/steps/${stepId}/skip`, { reason });
  },

  cancelInstance: (id: string): Promise<PathInstance> => {
    return api.put(`/path-instances/${id}/cancel`, {});
  },

  // Patient/Demand instances
  getPatientInstances: (patientId: string): Promise<PathInstance[]> => {
    return api.get(`/patients/${patientId}/path-instances`);
  },

  getDemandInstances: (demandId: string): Promise<PathInstance[]> => {
    return api.get(`/demands/${demandId}/path-instances`);
  },
};
