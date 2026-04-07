import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import { CreateTouchpointDto } from './dto/create-touchpoint.dto';
import { UpdateTouchpointDto } from './dto/update-touchpoint.dto';
import { TouchpointFiltersDto } from './dto/touchpoint-filters.dto';

@Injectable()
export class TouchpointsService {
  private logger = new Logger('TouchpointsService');

  constructor(private prisma: PrismaService) {}

  async create(data: CreateTouchpointDto, orgId: string, userId?: string): Promise<any> {
    // Verify patient exists and belongs to org
    const patient = await this.prisma.patient.findFirst({
      where: { id: data.patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const touchpoint = await this.prisma.touchpoint.create({
      data: {
        patientId: data.patientId,
        demandId: data.demandId,
        orgId,
        type: data.type,
        channel: data.channel || 'OFFLINE',
        title: data.title,
        content: data.content,
        sentiment: data.sentiment,
        feedback: data.feedback,
        satisfactionScore: data.satisfactionScore,
        duration: data.duration,
        outcome: data.outcome,
        nextPlan: data.nextPlan,
        nextPlanTime: data.nextPlanTime ? new Date(data.nextPlanTime) : null,
        followupRequired: data.followupRequired || false,
        followupDate: data.followupDate ? new Date(data.followupDate) : null,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`Touchpoint created: ${touchpoint.id} for patient ${data.patientId}`, 'TouchpointsService');
    return touchpoint;
  }

  async findAll(orgId: string, filters?: TouchpointFiltersDto): Promise<any> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { orgId, voidedAt: null }; // Exclude voided records (TOUCH-05)

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.channel) {
      where.channel = filters.channel;
    }
    if (filters?.sentiment) {
      where.sentiment = filters.sentiment;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [touchpoints, total] = await Promise.all([
      this.prisma.touchpoint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true } },
        },
      }),
      this.prisma.touchpoint.count({ where }),
    ]);

    return {
      data: touchpoints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, orgId: string): Promise<any> {
    const touchpoint = await this.prisma.touchpoint.findFirst({
      where: { id, orgId, voidedAt: null },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    if (!touchpoint) {
      throw new NotFoundException('Touchpoint not found');
    }

    return touchpoint;
  }

  async update(id: string, data: UpdateTouchpointDto, orgId: string): Promise<any> {
    // Verify touchpoint exists
    await this.findById(id, orgId);

    const touchpoint = await this.prisma.touchpoint.update({
      where: { id },
      data: {
        ...data,
        followupDate: data.followupDate ? new Date(data.followupDate) : undefined,
        nextPlanTime: data.nextPlanTime ? new Date(data.nextPlanTime) : undefined,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`Touchpoint updated: ${id}`, 'TouchpointsService');
    return touchpoint;
  }

  async void(id: string, reason: string, orgId: string): Promise<any> {
    // Verify touchpoint exists and is not already voided
    const existing = await this.prisma.touchpoint.findFirst({
      where: { id, orgId, voidedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Touchpoint not found or already voided');
    }

    const touchpoint = await this.prisma.touchpoint.update({
      where: { id },
      data: {
        voidedAt: new Date(),
        voidedReason: reason,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`Touchpoint voided: ${id}, reason: ${reason}`, 'TouchpointsService');
    return touchpoint;
  }

  async getAnalytics(
    orgId: string,
    startDate?: string,
    endDate?: string,
    granularity: 'day' | 'week' | 'month' = 'day',
  ): Promise<any> {
    const where: any = { orgId, voidedAt: null };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const touchpoints = await this.prisma.touchpoint.findMany({
      where,
      select: {
        createdAt: true,
        sentiment: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group counts by period
    const countsMap = new Map<string, number>();
    touchpoints.forEach((tp) => {
      const dateKey = this.getDateKey(tp.createdAt, granularity);
      countsMap.set(dateKey, (countsMap.get(dateKey) || 0) + 1);
    });

    const counts = Array.from(countsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Sentiment distribution
    const sentimentDistribution: Record<string, number> = {
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0,
    };
    touchpoints.forEach((tp) => {
      if (tp.sentiment) {
        sentimentDistribution[tp.sentiment]++;
      }
    });

    return {
      counts,
      sentimentDistribution: Object.entries(sentimentDistribution).map(([sentiment, count]) => ({
        sentiment,
        count,
      })),
      total: touchpoints.length,
    };
  }

  private getDateKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    if (granularity === 'day') {
      return d.toISOString().split('T')[0];
    } else if (granularity === 'week') {
      // Get start of week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      return weekStart.toISOString().split('T')[0];
    } else {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  }
}
