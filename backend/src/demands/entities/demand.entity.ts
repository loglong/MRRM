export class DemandEntity {
  id: string;
  patientId: string;
  orgId: string;
  type: string;
  source: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  estimatedAmount: number | null;
  actualAmount: number | null;
  closeReason: string | null;
  closedAt: Date | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<DemandEntity>) {
    Object.assign(this, partial);
  }
}
