export declare class BiPushPayloadDto {
    reportDate: string;
    metrics: {
        newPatients: number;
        demandsCreated: number;
        demandsFulfilled: number;
        followupCompletionRate: number;
        avgPatientSatisfaction: number;
    };
    patientTiers: {
        highValue: number;
        regular: number;
        lostRisk: number;
    };
    touchpointCounts: {
        total: number;
        byChannel: Record<string, number>;
    };
    demandsByStatus: Record<string, number>;
}
