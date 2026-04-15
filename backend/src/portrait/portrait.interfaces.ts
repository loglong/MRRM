import { LifecycleStage, TagCategory, TagSource, TagStatus } from '@prisma/client';

export interface PatientPortrait {
  patientId: string;
  lifecycle: { stage: LifecycleStage; enteredAt: Date; updatedAt: Date };
  rfm: { lastOrderAt: Date | null; orderCount: number; totalAmount: number; avgAmount: number };
  stats: { totalVisits: number; lastContactAt: Date | null; touchpointCount: number; avgSatisfaction: number | null };
  scores: { churnRisk: number; engagement: number; value: number };
  aiRecommendation: string | null;
}

export interface TagCondition {
  and?: TagCondition[];
  or?: TagCondition[];
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';
  value: any;
}

export interface TagSuggestion {
  tagCode: string;
  tagName: string;
  source: TagSource;
  confidence: number;
  reason: string;
}

export enum PortraitEvent {
  VISIT_COMPLETED = 'VISIT_COMPLETED',
  TOUCHPOINT_CREATED = 'TOUCHPOINT_CREATED',
  DEMAND_STATUS_CHANGED = 'DEMAND_STATUS_CHANGED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PATIENT_CREATED = 'PATIENT_CREATED'
}