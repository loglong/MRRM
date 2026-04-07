export declare class CrmPatientDto {
    externalId: string;
    name: string;
    phone: string;
    email?: string;
    tier: 'HIGH_VALUE' | 'REGULAR' | 'LOST_RISK';
    status: 'ACTIVE' | 'INACTIVE' | 'CHURNED';
    lastContactAt: string;
    metadata?: Record<string, any>;
}
