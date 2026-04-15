import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScoreCalculatorService } from '../services/score-calculator.service';
import { TaggingService } from '../services/tagging.service';
import { LifecycleService } from '../services/lifecycle.service';

@Injectable()
export class PortraitBatchScheduler implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private scoreCalculator: ScoreCalculatorService,
    private taggingService: TaggingService,
    private lifecycleService: LifecycleService
  ) {}

  onModuleInit() {
    // Schedule daily batch at 2 AM
    this.scheduleDailyBatch();
    // Schedule hourly tag expiration check
    this.scheduleHourlyTagExpiration();
    console.log('Portrait batch scheduler initialized');
  }

  private scheduleDailyBatch() {
    const now = new Date();
    const next2AM = new Date(now);
    next2AM.setHours(2, 0, 0, 0);
    if (next2AM <= now) next2AM.setDate(next2AM.getDate() + 1);

    const msUntil2AM = next2AM.getTime() - now.getTime();
    setTimeout(async () => {
      await this.runDailyBatch();
      setInterval(() => this.runDailyBatch(), 24 * 60 * 60 * 1000);
    }, msUntil2AM);
  }

  private scheduleHourlyTagExpiration() {
    setInterval(async () => {
      try {
        await this.taggingService.expireOldTags();
        console.log('Tag expiration check completed');
      } catch (error) {
        console.error('Tag expiration check failed:', error);
      }
    }, 60 * 60 * 1000);
  }

  async runDailyBatch() {
    console.log('Starting daily portrait batch job...');

    const patients = await this.prisma.patient.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true }
    });

    let processed = 0;
    let errors = 0;

    for (const patient of patients) {
      try {
        await this.scoreCalculator.recalculateRfm(patient.id);
        await this.scoreCalculator.recalculateChurnRisk(patient.id);
        await this.scoreCalculator.recalculateEngagement(patient.id);
        await this.scoreCalculator.recalculateValue(patient.id);
        await this.lifecycleService.checkAndAdvanceLifecycle(patient.id);
        await this.taggingService.processRules(patient.id);
        processed++;
      } catch (error) {
        errors++;
        console.error(`Failed to process patient ${patient.id}:`, error);
      }
    }

    console.log(`Daily batch completed: ${processed} processed, ${errors} errors`);
  }
}