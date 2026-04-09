import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { FollowupType } from '@prisma/client';

export class CreateFollowupDto {
  @IsEnum(FollowupType)
  type: FollowupType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsDateString()
  plannedAt: string;
}
