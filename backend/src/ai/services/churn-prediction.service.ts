import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  PatientRiskScore,
  ChurnRiskLevel,
  RiskFactor,
  RiskFactorType,
} from '../entities/patient-risk.entity';

@Injectable()
export class ChurnPredictionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate risk score for a single patient
   * Rule-based MVP with factors:
   * - lastVisitDays (40%): >90d=100, >60d=60, >30d=30, <=30d=0
   * - satisfactionDrop (30%): drop>=2=100, drop>=1=50, else=0
   * - touchpointDecline (20%): decreasing trend = 100, else = 0
   * - pathMissed (10%): missed steps = proportional score
   */
  async calculateRiskScore(patientId: string): Promise<PatientRiskScore | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { assignedUser: { select: { name: true } } },
    });

    if (!patient) {
      return null;
    }

    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Factor 1: Days since last visit (weight: 40%)
    const lastVisitFactor = await this.getLastVisitFactor(patientId);
    if (lastVisitFactor) {
      factors.push(lastVisitFactor);
      totalScore += lastVisitFactor.value * lastVisitFactor.weight;
      totalWeight += lastVisitFactor.weight;
    }

    // Factor 2: Satisfaction drop (weight: 30%)
    const satisfactionFactor = await this.getSatisfactionTrend(patientId);
    if (satisfactionFactor) {
      factors.push(satisfactionFactor);
      totalScore += satisfactionFactor.value * satisfactionFactor.weight;
      totalWeight += satisfactionFactor.weight;
    }

    // Factor 3: Touchpoint frequency decline (weight: 20%)
    const touchpointFactor = await this.getTouchpointTrend(patientId);
    if (touchpointFactor) {
      factors.push(touchpointFactor);
      totalScore += touchpointFactor.value * touchpointFactor.weight;
      totalWeight += touchpointFactor.weight;
    }

    // Factor 4: Path steps missed (weight: 10%)
    const pathMissedFactor = await this.getPathMissedSteps(patientId);
    if (pathMissedFactor) {
      factors.push(pathMissedFactor);
      totalScore += pathMissedFactor.value * pathMissedFactor.weight;
      totalWeight += pathMissedFactor.weight;
    }

    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const riskLevel = this.getRiskLevel(finalScore);

    return {
      patientId,
      patientName: patient.name,
      score: finalScore,
      riskLevel,
      factors,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get all patients with risk score >= threshold
   */
  async getHighRiskPatients(threshold: number = 70): Promise<PatientRiskScore[]> {
    // Get all active patients
    const patients = await this.prisma.patient.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    const riskScores = await Promise.all(
      patients.map(p => this.calculateRiskScore(p.id))
    );

    return riskScores
      .filter((r): r is PatientRiskScore => r !== null && r.score >= threshold)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get risk level based on score
   */
  private getRiskLevel(score: number): ChurnRiskLevel {
    if (score >= 70) return ChurnRiskLevel.HIGH;
    if (score >= 40) return ChurnRiskLevel.MEDIUM;
    return ChurnRiskLevel.LOW;
  }

  /**
   * Calculate days since last visit
   */
  private async getLastVisitDays(patientId: string): Promise<number> {
    const lastTouchpoint = await this.prisma.touchpoint.findFirst({
      where: { patientId, voidedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (lastTouchpoint) {
      return this.daysDifference(new Date(), lastTouchpoint.createdAt);
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { createdAt: true },
    });

    if (!patient) return 999;
    return this.daysDifference(new Date(), patient.createdAt);
  }

  /**
   * Factor: Last visit days (weight: 40%)
   * >90 days: 100, >60 days: 60, >30 days: 30, <=30 days: 0
   */
  private async getLastVisitFactor(patientId: string): Promise<RiskFactor | null> {
    const days = await this.getLastVisitDays(patientId);
    let value = 0;
    let description = '';

    if (days > 90) {
      value = 100;
      description = `超过90天未就诊（${days}天）`;
    } else if (days > 60) {
      value = 60;
      description = `超过60天未就诊（${days}天）`;
    } else if (days > 30) {
      value = 30;
      description = `超过30天未就诊（${days}天）`;
    } else {
      value = 0;
      description = `最近就诊在${days}天内`;
    }

    return {
      type: RiskFactorType.LAST_VISIT_DAYS,
      value,
      weight: 0.4,
      description,
    };
  }

  /**
   * Factor: Satisfaction drop (weight: 30%)
   * Get satisfaction scores from recent touchpoints
   * Maps sentiment (POSITIVE=3, NEUTRAL=2, NEGATIVE=1) to calculate trend
   */
  private async getSatisfactionTrend(patientId: string): Promise<RiskFactor | null> {
    const recentTouchpoints = await this.prisma.touchpoint.findMany({
      where: { patientId, voidedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { sentiment: true },
    });

    const sentimentMap: Record<string, number> = {
      'POSITIVE': 3,
      'NEUTRAL': 2,
      'NEGATIVE': 1,
    };

    const scores = recentTouchpoints
      .map(t => t.sentiment ? sentimentMap[t.sentiment] : null)
      .filter((s): s is number => s !== null);

    if (scores.length < 2) {
      return null;
    }

    const latest = scores[0];
    const previous = scores[1];
    const drop = previous - latest;

    let value = 0;
    if (drop >= 2) value = 100;
    else if (drop >= 1) value = 50;

    return {
      type: RiskFactorType.SATISFACTION_DROP,
      value,
      weight: 0.3,
      description: drop > 0 ? `满意度下降${drop}分` : '满意度稳定',
    };
  }

  /**
   * Factor: Touchpoint frequency decline (weight: 20%)
   * Compare last 30 days vs previous 30 days
   */
  private async getTouchpointTrend(patientId: string): Promise<RiskFactor | null> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [recentCount, olderCount] = await Promise.all([
      this.prisma.touchpoint.count({
        where: {
          patientId,
          voidedAt: null,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.touchpoint.count({
        where: {
          patientId,
          voidedAt: null,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    // If older period had more touchpoints, it's a decline
    let value = 0;
    if (olderCount > 0 && recentCount < olderCount * 0.5) {
      // More than 50% decline
      value = 100;
    } else if (olderCount > 0 && recentCount < olderCount) {
      value = 50;
    }

    return {
      type: RiskFactorType.TOUCHPOINT_DECLINE,
      value,
      weight: 0.2,
      description: recentCount < olderCount
        ? `触点频率下降（近30天${recentCount}次 vs 前30天${olderCount}次）`
        : '触点频率正常',
    };
  }

  /**
   * Factor: Missed path steps (weight: 10%)
   * Check for overdue path instance steps
   */
  private async getPathMissedSteps(patientId: string): Promise<RiskFactor | null> {
    const overdueSteps = await this.prisma.pathInstanceStep.count({
      where: {
        instance: { patientId },
        status: 'OVERDUE',
      },
    });

    const totalSteps = await this.prisma.pathInstanceStep.count({
      where: {
        instance: { patientId },
      },
    });

    if (totalSteps === 0) {
      return null;
    }

    const missedRatio = overdueSteps / totalSteps;
    const value = Math.round(missedRatio * 100);

    return {
      type: RiskFactorType.PATH_MISSED,
      value,
      weight: 0.1,
      description: overdueSteps > 0
        ? `路径步骤遗漏（${overdueSteps}/${totalSteps}步骤逾期）`
        : '路径执行正常',
    };
  }

  /**
   * Helper: Calculate days between two dates
   */
  private daysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
