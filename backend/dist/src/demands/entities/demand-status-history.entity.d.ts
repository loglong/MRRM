export declare class DemandStatusHistoryEntity {
    id: string;
    demandId: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: string;
    notes: string | null;
    createdAt: Date;
    constructor(partial: Partial<DemandStatusHistoryEntity>);
}
