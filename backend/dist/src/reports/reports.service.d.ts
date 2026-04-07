import { PrismaService } from '../common/prisma/prisma.service';
export interface KpiFilters {
    startDate?: Date;
    endDate?: Date;
    orgIds?: string[];
    granularity?: 'day' | 'week' | 'month';
}
export interface KPIData {
    newPatients: number;
    conversionRate: number;
    followupCompletionRate: number;
    period: {
        start: string;
        end: string;
    };
}
export interface KPITrend {
    date: string;
    newPatients: number;
    conversionRate: number;
    followupCompletionRate: number;
}
export declare class ReportsService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    getKPIs(orgId: string, filters: KpiFilters): Promise<KPIData>;
    getKPITrends(orgId: string, filters: KpiFilters): Promise<KPITrend[]>;
    private getDateKey;
    private getPeriodEnd;
    private moveToNextPeriod;
}
