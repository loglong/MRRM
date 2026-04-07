export declare class PatientQueryDto {
    search?: string;
    tier?: string;
    page?: number;
    limit?: number;
}
export declare class PatientResponseDto {
    id: string;
    name: string;
    gender?: string;
    phone?: string;
    tier: string;
    lastVisitAt?: string;
    createdAt: string;
}
export declare class DemandQueryDto {
    patientId?: string;
    status?: string;
    page?: number;
    limit?: number;
}
export declare class DemandResponseDto {
    id: string;
    patientId: string;
    type: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export declare class TouchpointQueryDto {
    patientId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
export declare class TouchpointResponseDto {
    id: string;
    patientId: string;
    type: string;
    channel?: string;
    title: string;
    sentiment?: string;
    createdAt: string;
}
export declare class HealthRecordQueryDto {
    patientId?: string;
    category?: string;
    page?: number;
    limit?: number;
}
