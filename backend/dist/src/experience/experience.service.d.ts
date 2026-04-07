import { PrismaService } from '../common/prisma/prisma.service';
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
export interface SatisfactionFilters {
    startDate?: Date;
    endDate?: Date;
    granularity?: 'day' | 'week' | 'month';
    orgIds?: string[];
}
export declare class ExperienceService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    getSatisfactionTrends(orgId: string, filters: SatisfactionFilters): Promise<SatisfactionTrend[]>;
    getDecliningPatients(orgId: string, lookbackWeeks?: number, declineThreshold?: number): Promise<DecliningPatient[]>;
    getPatientSatisfactionScore(patientId: string, orgId: string): Promise<number>;
    private getPatientSentimentScores;
    private getPeriodKey;
}
