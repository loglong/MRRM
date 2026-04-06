import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import axios from 'axios';
import { BiPushPayloadDto } from '../dto/bi-push.dto';

@Injectable()
export class BiAdapterService {
  private readonly logger = new Logger('BiAdapterService');
  private readonly TIMEOUT_MS = 5000;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Push daily metrics report to BI system.
   */
  async pushMetricsReport(orgId: string, date: string): Promise<void> {
    const baseUrl = this.configService.get<string>('BI_API_BASE_URL');
    const apiKey = this.configService.get<string>('BI_API_KEY');

    if (!baseUrl || !apiKey) {
      this.logger.warn('BI integration not configured (BI_API_BASE_URL or BI_API_KEY missing)');
      return;
    }

    try {
      // Build metrics from Prisma queries
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [
        newPatientsCount,
        demandsCreatedCount,
        demandsFulfilledCount,
        followupsCompleted,
        followupsTotal,
        patientTiers,
        demandsByStatus,
        touchpointsTotal,
        touchpointsByChannel,
        avgSatisfaction,
      ] = await Promise.all([
        // New patients this day
        this.prisma.patient.count({
          where: {
            orgId,
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        // Demands created this day
        this.prisma.demand.count({
          where: {
            orgId,
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        // Demands fulfilled (status = COMPLETED or similar)
        this.prisma.demand.count({
          where: {
            orgId,
            status: 'COMPLETED',
            updatedAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        // Followup completion stats
        this.prisma.followupPlan.count({
          where: {
            patient: { orgId },
            completedAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        this.prisma.followupPlan.count({
          where: { patient: { orgId } },
        }),
        // Patient tiers
        this.prisma.patient.groupBy({
          by: ['tier'],
          where: { orgId, deletedAt: null },
          _count: true,
        }),
        // Demands by status
        this.prisma.demand.groupBy({
          by: ['status'],
          where: { orgId },
          _count: true,
        }),
        // Total touchpoints
        this.prisma.touchpoint.count({
          where: {
            orgId,
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        // Touchpoints by channel
        this.prisma.touchpoint.groupBy({
          by: ['channel'],
          where: {
            orgId,
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
          _count: true,
        }),
        // Average satisfaction (from touchpoints with sentiment)
        this.prisma.touchpoint.aggregate({
          where: {
            orgId,
            sentiment: { not: null },
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
          _avg: { sentimentScore: true },
        }),
      ]);

      // Calculate followup completion rate
      const followupCompletionRate = followupsTotal > 0
        ? followupsCompleted / followupsTotal
        : 0;

      // Build patient tiers map
      const tierMap: Record<string, number> = { HIGH_VALUE: 0, REGULAR: 0, LOST_RISK: 0 };
      for (const t of patientTiers) {
        tierMap[t.tier] = t._count;
      }

      // Build demands by status map
      const demandStatusMap: Record<string, number> = {};
      for (const d of demandsByStatus) {
        demandStatusMap[d.status] = d._count;
      }

      // Build touchpoints by channel map
      const channelMap: Record<string, number> = {};
      for (const c of touchpointsByChannel) {
        channelMap[c.channel || 'UNKNOWN'] = c._count;
      }

      const payload: BiPushPayloadDto = {
        reportDate: date,
        metrics: {
          newPatients: newPatientsCount,
          demandsCreated: demandsCreatedCount,
          demandsFulfilled: demandsFulfilledCount,
          followupCompletionRate: Math.round(followupCompletionRate * 100) / 100,
          avgPatientSatisfaction: avgSatisfaction._avg?.sentimentScore
            ? Math.round(avgSatisfaction._avg.sentimentScore * 100) / 100
            : 0,
        },
        patientTiers: {
          highValue: tierMap.HIGH_VALUE,
          regular: tierMap.REGULAR,
          lostRisk: tierMap.LOST_RISK,
        },
        touchpointCounts: {
          total: touchpointsTotal,
          byChannel: channelMap,
        },
        demandsByStatus: demandStatusMap,
      };

      await axios.post(`${baseUrl}/reports/daily`, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.TIMEOUT_MS,
      });

      this.logger.log(`Pushed daily metrics report for ${date} to BI`);
    } catch (error: any) {
      this.logger.error(`Failed to push metrics report to BI: ${error.message}`, error.stack);
    }
  }

  /**
   * Push patient analytics to BI system.
   */
  async pushPatientAnalytics(orgId: string): Promise<void> {
    const baseUrl = this.configService.get<string>('BI_API_BASE_URL');
    const apiKey = this.configService.get<string>('BI_API_KEY');

    if (!baseUrl || !apiKey) {
      this.logger.warn('BI integration not configured');
      return;
    }

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalPatients,
        newPatientsThisMonth,
        patientTiers,
        followupStats,
      ] = await Promise.all([
        this.prisma.patient.count({ where: { orgId, deletedAt: null } }),
        this.prisma.patient.count({
          where: { orgId, deletedAt: null, createdAt: { gte: startOfMonth } },
        }),
        this.prisma.patient.groupBy({
          by: ['tier'],
          where: { orgId, deletedAt: null },
          _count: true,
        }),
        this.prisma.followupPlan.groupBy({
          by: ['status'],
          where: { patient: { orgId } },
          _count: true,
        }),
      ]);

      const tierMap: Record<string, number> = { HIGH_VALUE: 0, REGULAR: 0, LOST_RISK: 0 };
      for (const t of patientTiers) {
        tierMap[t.tier] = t._count;
      }

      const payload = {
        orgId,
        reportDate: now.toISOString(),
        totalPatients,
        newPatientsThisMonth,
        patientTiers: tierMap,
        followupStatusCounts: Object.fromEntries(
          followupStats.map((f) => [f.status, f._count])
        ),
      };

      await axios.post(`${baseUrl}/reports/patients`, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.TIMEOUT_MS,
      });

      this.logger.log(`Pushed patient analytics to BI`);
    } catch (error: any) {
      this.logger.error(`Failed to push patient analytics to BI: ${error.message}`, error.stack);
    }
  }
}
