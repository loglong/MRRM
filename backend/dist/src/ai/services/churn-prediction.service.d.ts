import { PrismaService } from '../../common/prisma/prisma.service';
import { PatientRiskScore } from '../entities/patient-risk.entity';
export declare class ChurnPredictionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateRiskScore(patientId: string): Promise<PatientRiskScore | null>;
    getHighRiskPatients(threshold?: number): Promise<PatientRiskScore[]>;
    private getRiskLevel;
    private getLastVisitDays;
    private getLastVisitFactor;
    private getSatisfactionTrend;
    private getTouchpointTrend;
    private getPathMissedSteps;
    private daysDifference;
}
