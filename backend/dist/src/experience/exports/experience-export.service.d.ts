interface SatisfactionTrend {
    period: string;
    score: number;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
}
interface DecliningPatient {
    patientId: string;
    patientName: string;
    currentScore: number;
    previousScore: number;
    decline: number;
}
export declare class ExperienceExportService {
    generateExperienceReport(trends: SatisfactionTrend[], declining: DecliningPatient[], filters: {
        startDate: string;
        endDate: string;
    }): Buffer;
}
export {};
