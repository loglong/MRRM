export declare class HealthReminderEntity {
    id: string;
    patientId: string;
    orgId: string;
    type: 'REVIEW' | 'MEDICATION';
    title: string;
    content: string | null;
    remindAt: Date;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<HealthReminderEntity>);
}
