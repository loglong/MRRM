import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ScoreCalculatorService {
  constructor(private prisma: PrismaService) {}

  async recalculateRfm(patientId: string): Promise<void> {
    const payments = await this.prisma.demand.findMany({
      where: { patientId, actualAmount: { not: null } },
      select: { actualAmount: true, closedAt: true }
    });

    if (payments.length === 0) return;

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.actualAmount || 0), 0);
    const lastOrderAt = payments.filter(p => p.closedAt).sort((a, b) => b.closedAt!.getTime() - a.closedAt!.getTime())[0]?.closedAt;

    await this.prisma.patient.update({
      where: { id: patientId },
      data: { orderCount: payments.length, totalAmount, avgAmount: totalAmount / payments.length, lastOrderAt }
    });
  }

  async recalculateChurnRisk(patientId: string): Promise<number> {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return 0;

    let score = 0;
    if (patient.lastVisitAt) {
      const daysSinceVisit = (Date.now() - patient.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceVisit > 90) score += 50;
      else if (daysSinceVisit > 60) score += 30;
      else if (daysSinceVisit > 30) score += 10;
    }
    if (patient.lastContactAt) {
      const daysSinceContact = (Date.now() - patient.lastContactAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceContact > 60) score += 30;
      else if (daysSinceContact > 30) score += 15;
    }
    if (patient.lifecycleStage === 'MAINTENANCE') score += 10;
    if (patient.lifecycleStage === 'DEVELOPMENT') score += 5;
    score += Math.max(0, 20 - (Number(patient.engagementScore) || 0) / 5);
    score = Math.min(100, Math.max(0, score));

    await this.prisma.patient.update({ where: { id: patientId }, data: { churnRiskScore: score } });
    return score;
  }

  async recalculateEngagement(patientId: string): Promise<number> {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return 0;

    let score = 0;
    score += Math.min(30, (patient.totalVisits || 0) * 3);
    if (patient.lastContactAt) {
      const days = (Date.now() - patient.lastContactAt.getTime()) / (1000 * 60 * 60 * 24);
      if (days <= 7) score += 40;
      else if (days <= 30) score += 30;
      else if (days <= 60) score += 20;
      else if (days <= 90) score += 10;
    }
    if (patient.avgSatisfaction) score += (Number(patient.avgSatisfaction) / 10) * 30;
    score = Math.min(100, Math.max(0, score));

    await this.prisma.patient.update({ where: { id: patientId }, data: { engagementScore: score } });
    return score;
  }

  async recalculateValue(patientId: string): Promise<number> {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return 0;

    let score = 0;
    const amount = Number(patient.totalAmount || 0);
    if (amount >= 50000) score += 40;
    else if (amount >= 20000) score += 30;
    else if (amount >= 10000) score += 20;
    else if (amount >= 5000) score += 10;

    const count = patient.orderCount || 0;
    if (count >= 10) score += 30;
    else if (count >= 5) score += 20;
    else if (count >= 3) score += 10;

    const avg = Number(patient.avgAmount || 0);
    if (avg >= 5000) score += 30;
    else if (avg >= 2000) score += 20;
    else if (avg >= 1000) score += 10;

    score = Math.min(100, Math.max(0, score));
    await this.prisma.patient.update({ where: { id: patientId }, data: { valueScore: score } });
    return score;
  }
}