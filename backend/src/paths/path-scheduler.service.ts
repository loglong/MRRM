import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PathsService } from './paths.service';
import { Logger } from '../common/logger';

@Injectable()
export class PathSchedulerService {
  private logger = new Logger('PathSchedulerService');

  constructor(private pathsService: PathsService) {}

  // Run every hour to detect and mark overdue steps
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueDetection() {
    this.logger.log('Running overdue step detection...', 'PathSchedulerService');

    try {
      const result = await this.pathsService.detectOverdueSteps();
      this.logger.log(
        `Overdue detection complete: ${result.updated} steps marked as overdue`,
        'PathSchedulerService',
      );
    } catch (error) {
      this.logger.error(
        `Overdue detection failed: ${error.message}`,
        error.stack,
        'PathSchedulerService',
      );
    }
  }
}
