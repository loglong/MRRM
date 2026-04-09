import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TouchpointType, TouchpointChannel } from '@prisma/client';

export class CreateTouchpointDto {
  @IsEnum(TouchpointType)
  type: TouchpointType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(TouchpointChannel)
  @IsOptional()
  channel?: TouchpointChannel = 'OFFLINE';
}
