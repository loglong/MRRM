import api from './auth';

// Types
export enum ChurnRiskLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum RiskFactorType {
  LAST_VISIT_DAYS = 'lastVisitDays',
  SATISFACTION_DROP = 'satisfactionDrop',
  TOUCHPOINT_DECLINE = 'touchpointDecline',
  PATH_MISSED = 'pathMissed',
}

export interface RiskFactor {
  type: RiskFactorType;
  value: number;
  weight: number;
  description: string;
}

export interface PatientRiskScore {
  patientId: string;
  patientName: string;
  score: number;
  riskLevel: ChurnRiskLevel;
  factors: RiskFactor[];
  lastUpdated: string;
}

export const churnRiskApi = {
  getPatientRisk: (patientId: string): Promise<PatientRiskScore> => {
    return api.get<PatientRiskScore>(`/ai/churn-risk/${patientId}`).then(res => res.data);
  },

  getHighRiskPatients: (threshold?: number): Promise<PatientRiskScore[]> => {
    return api.get<PatientRiskScore[]>('/ai/churn-risk/high-risk', {
      params: { threshold },
    }).then(res => res.data);
  },
};
