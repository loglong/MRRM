import { IsString, IsObject, IsNotEmpty, IsISO8601 } from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  eventType: string; // e.g., 'patient.created', 'demand.status_changed'

  @IsString()
  @IsNotEmpty()
  eventId: string; // UUID for idempotency

  @IsISO8601()
  timestamp: string; // ISO 8601

  @IsObject()
  data: Record<string, any>; // event-specific payload
}
