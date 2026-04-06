import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MobilePatientListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(50)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}

export class MobileDemandListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(50)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  status?: string;
}

export class MobilePatientDto {
  id: string;
  name: string;
  phone: string | null;
  gender: string | null;
  tier: string;
  status: string;
  lastVisitAt: string | null;
  assignedUserName: string | null;
}

export class MobileDemandDto {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export class MobileTouchpointDto {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  title: string;
  content: string | null;
  sentiment: string | null;
  createdAt: string;
}

export class MobileFollowupDto {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  status: string;
  planTime: string;
  content: string | null;
}
