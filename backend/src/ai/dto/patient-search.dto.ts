import { IsOptional, IsString, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PatientTier } from '@prisma/client';

export class PatientSearchDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;  // 关键词搜索

  @IsOptional()
  @IsEnum(PatientTier)
  tier?: PatientTier;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
