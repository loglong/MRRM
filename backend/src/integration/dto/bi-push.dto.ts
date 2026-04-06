export class BiPushPayloadDto {
  reportDate: string; // ISO date
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
