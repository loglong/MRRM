import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HealthService, HealthArchive, TimelineResult } from './health.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateHealthRecordDtoType } from './dto/health-archive.dto';
import { CreateHealthReminderDtoType } from './dto/health-reminder.dto';

@Controller('health')
@UseGuards(JwtAuthGuard)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('patients/:patientId/archive')
  async getHealthArchive(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.healthService.getHealthArchive(orgId, patientId);
  }

  @Get('patients/:patientId/timeline')
  async getHealthTimeline(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const orgId = req?.user?.orgId || req?.user?.user?.orgId;
    return this.healthService.getHealthTimeline(
      orgId,
      patientId,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('patients/:patientId/records')
  async createHealthRecord(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() createDto: CreateHealthRecordDtoType,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.healthService.createHealthRecord(orgId, patientId, createDto);
  }

  @Get('patients/:patientId/reminders')
  async getReminders(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.healthService.getReminders(orgId, patientId);
  }

  @Post('reminders')
  async createReminder(
    @Body() createDto: CreateHealthReminderDtoType,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.healthService.createReminder(orgId, createDto);
  }

  @Patch('reminders/:id/complete')
  async completeReminder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.healthService.completeReminder(id, orgId);
  }

  @Delete('reminders/:id')
  async deleteReminder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.healthService.deleteReminder(id, orgId);
  }
}
