import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FollowupsService } from './followups.service';
import { Logger } from '../common/logger';

@Injectable()
export class FollowupSchedulerService {
  private logger = new Logger('FollowupSchedulerService');

  constructor(private followupsService: FollowupsService) {}

  // Run every hour to detect and mark overdue followup records
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueDetection() {
    this.logger.log('Running overdue followup detection...', 'FollowupSchedulerService');

    try {
      const result = await this.followupsService.detectOverdueRecords();
      this.logger.log(
        `Overdue detection complete: ${result.updated} records marked as missed`,
        'FollowupSchedulerService',
      );
    } catch (error) {
      this.logger.error(
        `Overdue detection failed: ${error.message}`,
        error.stack,
        'FollowupSchedulerService',
      );
    }
  }
}
