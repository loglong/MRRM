import api from './auth';

export interface KPIFilters {
  startDate?: string;
  endDate?: string;
  orgIds?: string[];
  granularity?: 'day' | 'week' | 'month';
}

export interface KPIData {
  newPatients: number;
  conversionRate: number;
  followupCompletionRate: number;
  period: { start: string; end: string };
}

export interface KPITrend {
  date: string;
  newPatients: number;
  conversionRate: number;
  followupCompletionRate: number;
}

export interface DemandAnalysis {
  status: string;
  count: number;
}

export const reportsApi = {
  getKPIs: (filters: KPIFilters): Promise<KPIData> =>
    api.get('/reports/kpis', { params: filters }).then((res) => res.data),

  getKPITrends: (filters: KPIFilters): Promise<KPITrend[]> =>
    api.get('/reports/kpis/trends', { params: filters }).then((res) => res.data),

  getDemandAnalysis: (filters: KPIFilters): Promise<DemandAnalysis[]> =>
    api.get('/reports/demand-analysis', { params: filters }).then((res) => res.data),

  exportKPIs: (filters: KPIFilters): Promise<Blob> =>
    api.get('/reports/export/kpi', { params: filters, responseType: 'blob' }).then((res) => res.data),
};
