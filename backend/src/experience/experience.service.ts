import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';

export interface SatisfactionTrend {
  period: string;
  score: number;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface DecliningPatient {
  patientId: string;
  patientName: string;
  currentScore: number;
  previousScore: number;
  decline: number;
}

export interface SatisfactionFilters {
  startDate?: Date;
  endDate?: Date;
  granularity?: 'day' | 'week' | 'month';
  orgIds?: string[];
}

@Injectable()
export class ExperienceService {
  private logger = new Logger('ExperienceService');

  constructor(private prisma: PrismaService) {}

  async getSatisfactionTrends(orgId: string, filters: SatisfactionFilters): Promise<SatisfactionTrend[]> {
    const where: any = {
      orgId,
      voidedAt: null,
      sentiment: { not: null },
    };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
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

    // Group by period
    const groupedMap = new Map<string, { positive: number; neutral: number; negative: number; total: number }>();

    touchpoints.forEach((tp) => {
      const periodKey = this.getPeriodKey(tp.createdAt, filters.granularity || 'day');
      if (!groupedMap.has(periodKey)) {
        groupedMap.set(periodKey, { positive: 0, neutral: 0, negative: 0, total: 0 });
      }
      const entry = groupedMap.get(periodKey)!;
      entry.total++;
      if (tp.sentiment === 'POSITIVE') entry.positive++;
      else if (tp.sentiment === 'NEUTRAL') entry.neutral++;
      else if (tp.sentiment === 'NEGATIVE') entry.negative++;
    });

    const trends: SatisfactionTrend[] = [];
    groupedMap.forEach((counts, period) => {
      const score = counts.total > 0 ? Math.round(((counts.positive - counts.negative) / counts.total) * 100) : 0;
      trends.push({
        period,
        score,
        positive: counts.positive,
        neutral: counts.neutral,
        negative: counts.negative,
        total: counts.total,
      });
    });

    return trends.sort((a, b) => a.period.localeCompare(b.period));
  }

  async getDecliningPatients(
    orgId: string,
    lookbackWeeks: number = 4,
    declineThreshold: number = -20,
  ): Promise<DecliningPatient[]> {
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const previousPeriodStart = new Date(now.getTime() - lookbackWeeks * 7 * 24 * 60 * 60 * 1000);
    const priorPreviousStart = new Date(previousPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get current period scores
    const currentScores = await this.getPatientSentimentScores(orgId, currentPeriodStart, now);
    // Get previous period scores
    const previousScores = await this.getPatientSentimentScores(orgId, priorPreviousStart, previousPeriodStart);

    // Calculate declines
    const declining: DecliningPatient[] = [];
    for (const [patientId, current] of Object.entries(currentScores)) {
      const previous = previousScores[patientId];
      if (!previous) continue; // Need both periods to compare

      const decline = current.score - previous.score;
      if (decline <= declineThreshold) {
        // Get patient name
        const patient = await this.prisma.patient.findFirst({
          where: { id: patientId },
          select: { name: true },
        });
        declining.push({
          patientId,
          patientName: patient?.name || 'Unknown',
          currentScore: current.score,
          previousScore: previous.score,
          decline,
        });
      }
    }

    // Sort by decline (worst first)
    return declining.sort((a, b) => a.decline - b.decline);
  }

  async getPatientSatisfactionScore(patientId: string, orgId: string): Promise<number> {
    const touchpoints = await this.prisma.touchpoint.findMany({
      where: {
        patientId,
        orgId,
        voidedAt: null,
        sentiment: { not: null },
      },
      select: { sentiment: true },
    });

    if (touchpoints.length === 0) return 0;

    let positive = 0, negative = 0;
    touchpoints.forEach((tp) => {
      if (tp.sentiment === 'POSITIVE') positive++;
      else if (tp.sentiment === 'NEGATIVE') negative++;
    });

    return Math.round(((positive - negative) / touchpoints.length) * 100);
  }

  private async getPatientSentimentScores(
    orgId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, { score: number }>> {
    const touchpoints = await this.prisma.touchpoint.findMany({
      where: {
        orgId,
        voidedAt: null,
        sentiment: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        patientId: true,
        sentiment: true,
      },
    });

    // Group by patient
    const patientScores: Record<string, { positive: number; negative: number; total: number }> = {};
    touchpoints.forEach((tp) => {
      if (!patientScores[tp.patientId]) {
        patientScores[tp.patientId] = { positive: 0, negative: 0, total: 0 };
      }
      const entry = patientScores[tp.patientId];
      entry.total++;
      if (tp.sentiment === 'POSITIVE') entry.positive++;
      else if (tp.sentiment === 'NEGATIVE') entry.negative++;
    });

    // Calculate scores
    const result: Record<string, { score: number }> = {};
    for (const [patientId, counts] of Object.entries(patientScores)) {
      result[patientId] = {
        score: counts.total > 0 ? Math.round(((counts.positive - counts.negative) / counts.total) * 100) : 0,
      };
    }
    return result;
  }

  private getPeriodKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    if (granularity === 'day') {
      return d.toISOString().split('T')[0];
    } else if (granularity === 'week') {
      // Get start of week (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      return weekStart.toISOString().split('T')[0];
    } else {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  }
}
