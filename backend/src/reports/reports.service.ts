import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';

export interface KpiFilters {
  startDate?: Date;
  endDate?: Date;
  orgIds?: string[];
  granularity?: 'day' | 'week' | 'month';
}

export interface KPIData {
  newPatients: number;
  conversionRate: number;
  followupCompletionRate: number;
  period: { start: string; end: string };
}

export interface KPITrend {
  date: string;
  newPatients: number;
  conversionRate: number;
  followupCompletionRate: number;
}

@Injectable()
export class ReportsService {
  private logger = new Logger('ReportsService');

  constructor(private prisma: PrismaService) {}

  async getKPIs(orgId: string, filters: KpiFilters): Promise<KPIData> {
    const where: any = { orgId };

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // Parallel queries for KPIs
    const [newPatientsCount, demandStats, followupStats] = await Promise.all([
      // New patients count
      this.prisma.patient.count({
        where: {
          orgId,
          createdAt: where.createdAt,
          deletedAt: null,
        },
      }),

      // Demand stats by status
      this.prisma.demand.groupBy({
        by: ['status'],
        where: {
          orgId,
          createdAt: where.createdAt,
        },
        _count: true,
      }),

      // Followup stats by status
      this.prisma.followupRecord.groupBy({
        by: ['status'],
        where: {
          orgId,
          scheduledAt: where.createdAt,
        },
        _count: true,
      }),
    ]);

    // Calculate conversion rate: FULFILLED / (OPEN + IN_PROGRESS + PENDING + FULFILLED) * 100
    let demandTotal = 0;
    let fulfilledCount = 0;
    for (const stat of demandStats) {
      demandTotal += stat._count;
      if (stat.status === 'FULFILLED') {
        fulfilledCount = stat._count;
      }
    }
    const conversionRate =
      demandTotal > 0 ? Math.round((fulfilledCount / demandTotal) * 100 * 100) / 100 : 0;

    // Calculate followup completion rate: COMPLETED / (COMPLETED + MISSED + PENDING) * 100
    let followupTotal = 0;
    let completedCount = 0;
    for (const stat of followupStats) {
      if (['COMPLETED', 'MISSED', 'PENDING'].includes(stat.status)) {
        followupTotal += stat._count;
        if (stat.status === 'COMPLETED') {
          completedCount = stat._count;
        }
      }
    }
    const followupCompletionRate =
      followupTotal > 0 ? Math.round((completedCount / followupTotal) * 100 * 100) / 100 : 0;

    const periodStart = filters.startDate ? filters.startDate.toISOString() : 'all time';
    const periodEnd = filters.endDate ? filters.endDate.toISOString() : 'now';

    this.logger.log(
      `KPI report for org ${orgId}: ${newPatientsCount} new patients, ${conversionRate}% conversion, ${followupCompletionRate}% followup completion`,
      'ReportsService',
    );

    return {
      newPatients: newPatientsCount,
      conversionRate,
      followupCompletionRate,
      period: { start: periodStart, end: periodEnd },
    };
  }

  async getDemandAnalysis(
    orgId: string,
    filters: KpiFilters,
  ): Promise<{ status: string; count: number }[]> {
    const where: any = { orgId };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const demandStats = await this.prisma.demand.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return demandStats.map((stat) => ({
      status: stat.status,
      count: stat._count,
    }));
  }

  async getKPITrends(
    orgId: string,
    filters: KpiFilters,
  ): Promise<KPITrend[]> {
    const granularity = filters.granularity || 'day';
    const trends: KPITrend[] = [];

    if (!filters.startDate || !filters.endDate) {
      return trends;
    }

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    // Generate date keys based on granularity
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const periodEnd = this.getPeriodEnd(currentDate, granularity);
      const periodWhere: any = {
        orgId,
        createdAt: {
          gte: currentDate,
          lt: periodEnd > endDate ? endDate : periodEnd,
        },
      };

      // Calculate KPIs for this period
      const [newPatientsCount, demandStats, followupStats] = await Promise.all([
        this.prisma.patient.count({
          where: {
            orgId,
            createdAt: periodWhere.createdAt,
            deletedAt: null,
          },
        }),
        this.prisma.demand.groupBy({
          by: ['status'],
          where: {
            orgId,
            createdAt: periodWhere.createdAt,
          },
          _count: true,
        }),
        this.prisma.followupRecord.groupBy({
          by: ['status'],
          where: {
            orgId,
            scheduledAt: periodWhere.createdAt,
          },
          _count: true,
        }),
      ]);

      // Conversion rate
      let demandTotal = 0;
      let fulfilledCount = 0;
      for (const stat of demandStats) {
        demandTotal += stat._count;
        if (stat.status === 'FULFILLED') {
          fulfilledCount = stat._count;
        }
      }
      const conversionRate =
        demandTotal > 0 ? Math.round((fulfilledCount / demandTotal) * 100 * 100) / 100 : 0;

      // Followup completion rate
      let followupTotal = 0;
      let completedCount = 0;
      for (const stat of followupStats) {
        if (['COMPLETED', 'MISSED', 'PENDING'].includes(stat.status)) {
          followupTotal += stat._count;
          if (stat.status === 'COMPLETED') {
            completedCount = stat._count;
          }
        }
      }
      const followupCompletionRate =
        followupTotal > 0 ? Math.round((completedCount / followupTotal) * 100 * 100) / 100 : 0;

      trends.push({
        date: this.getDateKey(currentDate, granularity),
        newPatients: newPatientsCount,
        conversionRate,
        followupCompletionRate,
      });

      // Move to next period
      this.moveToNextPeriod(currentDate, granularity);
    }

    return trends;
  }

  private getDateKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    if (granularity === 'day') {
      return d.toISOString().split('T')[0];
    } else if (granularity === 'week') {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      return weekStart.toISOString().split('T')[0];
    } else {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  private getPeriodEnd(date: Date, granularity: 'day' | 'week' | 'month'): Date {
    const d = new Date(date);
    if (granularity === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (granularity === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d;
  }

  private moveToNextPeriod(date: Date, granularity: 'day' | 'week' | 'month'): void {
    if (granularity === 'day') {
      date.setDate(date.getDate() + 1);
    } else if (granularity === 'week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
  }
}
