import { IsOptional, IsDateString, IsIn, IsString, IsInt, Min, Max } from 'class-validator';

export class SatisfactionFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  granularity?: 'day' | 'week' | 'month' = 'day';

  @IsOptional()
  @IsString()
  orgIds?: string;
}

export class DeclineFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  lookbackWeeks?: number = 4;

  @IsOptional()
  @IsInt()
  declineThreshold?: number = -20;
}

export class ExportExperienceDto extends SatisfactionFiltersDto {}
