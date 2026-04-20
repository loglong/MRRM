export class PatientProfileResponseDto {
  id: string;
  name: string;
  phone: string;
  lifecycle: {
    stage: string;
    enteredAt: Date;
    updatedAt: Date | null;
  };
  rfm: {
    lastOrderAt: Date | null;
    orderCount: number;
    totalAmount: number;
    avgAmount: number;
  };
  stats: {
    totalVisits: number;
    lastContactAt: Date | null;
    touchpointCount: number;
    avgSatisfaction: number | null;
  };
  scores: {
    churnRisk: number;
    engagement: number;
    value: number;
  };
  tags: Array<{
    code: string;
    name: string;
    category: string;
    source: string;
    confidence: number | null;
    status: string;
  }>;
  aiRecommendation: string | null;
}