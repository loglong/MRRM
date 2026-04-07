export declare enum ChurnRiskLevel {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare enum RiskFactorType {
    LAST_VISIT_DAYS = "lastVisitDays",
    SATISFACTION_DROP = "satisfactionDrop",
    TOUCHPOINT_DECLINE = "touchpointDecline",
    PATH_MISSED = "pathMissed"
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
    lastUpdated: Date;
}
