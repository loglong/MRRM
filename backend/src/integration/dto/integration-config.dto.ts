import { IsOptional, IsString, IsNumber } from 'class-validator';

export class IntegrationConfigDto {
  // HIS Integration
  @IsOptional()
  @IsString()
  hisBaseUrl?: string;

  @IsOptional()
  @IsString()
  hisApiKey?: string;

  // CRM Integration
  @IsOptional()
  @IsString()
  crmBaseUrl?: string;

  @IsOptional()
  @IsString()
  crmApiKey?: string;

  @IsOptional()
  @IsString()
  crmSyncDirection?: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';

  // BI Integration
  @IsOptional()
  @IsString()
  biBaseUrl?: string;

  @IsOptional()
  @IsString()
  biApiKey?: string;

  @IsOptional()
  @IsString()
  biPushInterval?: string; // cron expression
}
