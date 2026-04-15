import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LifecycleService } from '../services/lifecycle.service';
import { TaggingService } from '../services/tagging.service';
import { ScoreCalculatorService } from '../services/score-calculator.service';

@Injectable()
export class PatientEventListener implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private lifecycleService: LifecycleService,
    private taggingService: TaggingService,
    private scoreCalculator: ScoreCalculatorService
  ) {}

  onModuleInit() {}

  async onVisitCompleted(patientId: string) {
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { totalVisits: { increment: 1 }, lastVisitAt: new Date(), lastContactAt: new Date() }
    });
    await this.scoreCalculator.recalculateEngagement(patientId);
    await this.scoreCalculator.recalculateValue(patientId);
    await this.lifecycleService.checkAndAdvanceLifecycle(patientId);
    await this.taggingService.processRules(patientId);
  }

  async onTouchpointCreated(patientId: string) {
    await this.prisma.patient.update({ where: { id: patientId }, data: { lastContactAt: new Date() } });
    await this.scoreCalculator.recalculateChurnRisk(patientId);
    await this.taggingService.processRules(patientId);
  }

  async onPaymentCompleted(patientId: string) {
    await this.scoreCalculator.recalculateRfm(patientId);
    await this.scoreCalculator.recalculateValue(patientId);
    await this.taggingService.processRules(patientId);
  }
}