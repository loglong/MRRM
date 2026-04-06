import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import { CreateHealthRecordDtoType } from './dto/health-archive.dto';
import { CreateHealthReminderDtoType } from './dto/health-reminder.dto';

export interface HealthRecordResponse {
  id: string;
  patientId: string;
  orgId: string;
  category: 'ALLERGY' | 'PAST_HISTORY' | 'EXAM_RESULT' | 'DIAGNOSIS' | 'TREATMENT';
  title: string;
  description: string | null;
  recordDate: string;
  data: Record<string, any> | null;
  source: string;
  createdAt: string;
}

export interface HealthReminderResponse {
  id: string;
  patientId: string;
  orgId: string;
  type: 'REVIEW' | 'MEDICATION';
  title: string;
  content: string | null;
  remindAt: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface HealthArchive {
  allergies: HealthRecordResponse[];
  pastHistory: HealthRecordResponse[];
  examResults: HealthRecordResponse[];
}

export interface TimelineResult {
  data: HealthRecordResponse[];
  nextCursor?: string;
}

@Injectable()
export class HealthService {
  private logger = new Logger('HealthService');

  constructor(private prisma: PrismaService) {}

  private formatHealthRecord(record: any): HealthRecordResponse {
    return {
      id: record.id,
      patientId: record.patientId,
      orgId: record.orgId,
      category: record.category,
      title: record.title,
      description: record.description,
      recordDate: record.recordDate.toISOString(),
      data: record.data,
      source: record.source,
      createdAt: record.createdAt.toISOString(),
    };
  }

  private formatHealthReminder(reminder: any): HealthReminderResponse {
    return {
      id: reminder.id,
      patientId: reminder.patientId,
      orgId: reminder.orgId,
      type: reminder.type,
      title: reminder.title,
      content: reminder.content,
      remindAt: reminder.remindAt.toISOString(),
      status: reminder.status,
      createdAt: reminder.createdAt.toISOString(),
      updatedAt: reminder.updatedAt.toISOString(),
    };
  }

  async getHealthArchive(orgId: string, patientId: string): Promise<HealthArchive> {
    const records = await this.prisma.healthRecord.findMany({
      where: { orgId, patientId },
      orderBy: { recordDate: 'desc' },
    });

    const formatted = records.map((r) => this.formatHealthRecord(r));

    return {
      allergies: formatted.filter((r) => r.category === 'ALLERGY'),
      pastHistory: formatted.filter((r) => r.category === 'PAST_HISTORY'),
      examResults: formatted.filter((r) => r.category === 'EXAM_RESULT').slice(0, 10),
    };
  }

  async getHealthTimeline(
    orgId: string,
    patientId: string,
    cursor?: string,
    limit = 20,
  ): Promise<TimelineResult> {
    const where: any = { orgId, patientId };

    if (cursor) {
      const cursorRecord = await this.prisma.healthRecord.findUnique({
        where: { id: cursor },
      });
      if (cursorRecord) {
        where.recordDate = { lt: cursorRecord.recordDate };
      }
    }

    const records = await this.prisma.healthRecord.findMany({
      where,
      take: limit + 1,
      orderBy: { recordDate: 'desc' },
    });

    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, limit) : records;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : undefined;

    return {
      data: data.map((r) => this.formatHealthRecord(r)),
      nextCursor,
    };
  }

  async createHealthRecord(orgId: string, patientId: string, data: CreateHealthRecordDtoType): Promise<HealthRecordResponse> {
    const record = await this.prisma.healthRecord.create({
      data: {
        patientId,
        orgId,
        category: data.category,
        title: data.title,
        description: data.description,
        recordDate: new Date(data.recordDate),
        data: data.data,
        source: data.source || 'manual',
      },
    });

    this.logger.log(`Health record created: ${record.id} for patient ${record.patientId}`, 'HealthService');
    return this.formatHealthRecord(record);
  }

  async getReminders(orgId: string, patientId: string): Promise<HealthReminderResponse[]> {
    const reminders = await this.prisma.healthReminder.findMany({
      where: {
        orgId,
        patientId,
        remindAt: { gte: new Date() },
        status: 'PENDING',
      },
      orderBy: { remindAt: 'asc' },
    });

    return reminders.map((r) => this.formatHealthReminder(r));
  }

  async createReminder(orgId: string, data: CreateHealthReminderDtoType): Promise<HealthReminderResponse> {
    const reminder = await this.prisma.healthReminder.create({
      data: {
        patientId: data.patientId,
        orgId,
        type: data.type,
        title: data.title,
        content: data.content,
        remindAt: new Date(data.remindAt),
      },
    });

    this.logger.log(`Health reminder created: ${reminder.id} for patient ${reminder.patientId}`, 'HealthService');
    return this.formatHealthReminder(reminder);
  }

  async completeReminder(id: string, orgId: string): Promise<HealthReminderResponse> {
    const reminder = await this.prisma.healthReminder.findFirst({
      where: { id, orgId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    const updated = await this.prisma.healthReminder.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`Health reminder completed: ${id}`, 'HealthService');
    return this.formatHealthReminder(updated);
  }

  async deleteReminder(id: string, orgId: string): Promise<void> {
    const reminder = await this.prisma.healthReminder.findFirst({
      where: { id, orgId, status: 'PENDING' },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found or not cancellable');
    }

    await this.prisma.healthReminder.delete({
      where: { id },
    });

    this.logger.log(`Health reminder deleted: ${id}`, 'HealthService');
  }
}
