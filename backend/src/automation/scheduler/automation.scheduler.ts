import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BirthdayReminderService } from '../services/birthday-reminder.service';
import { FollowupReminderService } from '../services/followup-reminder.service';
import { ChurnPredictionService } from '../../ai/services/churn-prediction.service';
import { Logger } from '../../common/logger';

@Injectable()
export class AutomationScheduler {
  private readonly logger = new Logger(AutomationScheduler.name);

  constructor(
    private readonly birthdayReminderService: BirthdayReminderService,
    private readonly followupReminderService: FollowupReminderService,
    private readonly churnPredictionService: ChurnPredictionService,
  ) {}

  /**
   * Run daily automation tasks at 9:00 AM
   * - Birthday reminders
   * - Follow-up reminders
   * - Update churn risk scores
   */
  @Cron('0 9 * * *')
  async runDailyAutomation() {
    this.logger.log('Starting daily automation tasks...');

    try {
      // Birthday reminders
      const birthdayCount = await this.birthdayReminderService.checkAndCreateBirthdayReminders();
      this.logger.log(`Created ${birthdayCount} birthday reminders`);
    } catch (error) {
      this.logger.error('Birthday reminder task failed', error);
    }

    try {
      // Follow-up reminders
      const followupCount = await this.followupReminderService.checkAndCreateFollowupReminders();
      this.logger.log(`Created ${followupCount} follow-up reminders`);
    } catch (error) {
      this.logger.error('Follow-up reminder task failed', error);
    }

    this.logger.log('Daily automation tasks completed');
  }

  /**
   * Run churn risk update every hour
   * Identifies high-risk patients and logs them
   */
  @Cron('0 * * * *')
  async updateChurnRiskScores() {
    try {
      const highRiskPatients = await this.churnPredictionService.getHighRiskPatients(70);
      if (highRiskPatients.length > 0) {
        this.logger.warn(`Found ${highRiskPatients.length} high-risk patients`);
        // In production, this would trigger notifications
      }
    } catch (error) {
      this.logger.error('Churn risk update failed', error);
    }
  }

  /**
   * Run every 5 minutes for more timely alerts (optional)
   * Commented out - enable if real-time alerts are needed
   */
  // @Cron('*/5 * * * *')
  // async frequentChurnCheck() {
  //   this.logger.debug('Running frequent churn risk check...');
  //   await this.updateChurnRiskScores();
  // }
}
