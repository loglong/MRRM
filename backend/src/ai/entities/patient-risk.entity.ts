export enum ChurnRiskLevel {
  HIGH = 'HIGH',      // Risk score > 70
  MEDIUM = 'MEDIUM',  // Risk score 40-70
  LOW = 'LOW',        // Risk score < 40
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
  score: number;           // 0-100
  riskLevel: ChurnRiskLevel;
  factors: RiskFactor[];    // Risk factors
  lastUpdated: Date;
}
