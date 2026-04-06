export class CrmPatientDto {
  externalId: string; // CRM patient ID
  name: string;
  phone: string;
  email?: string;
  tier: 'HIGH_VALUE' | 'REGULAR' | 'LOST_RISK';
  status: 'ACTIVE' | 'INACTIVE' | 'CHURNED';
  lastContactAt: string; // ISO date
  metadata?: Record<string, any>;
}
