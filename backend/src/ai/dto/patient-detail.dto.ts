import { IsUUID } from 'class-validator';

export class PatientDetailDto {
  @IsUUID()
  id: string;
}
