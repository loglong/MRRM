export declare class HealthRecordEntity {
    id: string;
    patientId: string;
    orgId: string;
    category: 'ALLERGY' | 'PAST_HISTORY' | 'EXAM_RESULT' | 'DIAGNOSIS' | 'TREATMENT';
    title: string;
    description: string | null;
    recordDate: Date;
    data: Record<string, any> | null;
    source: string;
    createdAt: Date;
    constructor(partial: Partial<HealthRecordEntity>);
}
