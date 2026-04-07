export declare class PatientEntity {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    gender: string | null;
    birthDate: Date | null;
    allergyHistory: string | null;
    pastHistory: string | null;
    address: string | null;
    tier: string;
    status: string;
    orgId: string;
    assignedUserId: string | null;
    lastVisitAt: Date | null;
    nextVisitAt: Date | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    constructor(partial: Partial<PatientEntity>);
}
