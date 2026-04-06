import { Injectable } from '@nestjs/common';
import { BirthdayReminderService } from './birthday-reminder.service';
import { FollowupReminderService } from './followup-reminder.service';

export interface AutomationResult {
  birthdayReminders: number;
  followupReminders: number;
  totalCreated: number;
}

@Injectable()
export class MarketingAutomationService {
  constructor(
    private readonly birthdayReminderService: BirthdayReminderService,
    private readonly followupReminderService: FollowupReminderService,
  ) {}

  /**
   * Run all marketing automation tasks
   * Returns count of reminders created
   */
  async runAllAutomations(orgId?: string): Promise<AutomationResult> {
    const [birthdayCount, followupCount] = await Promise.all([
      this.birthdayReminderService.checkAndCreateBirthdayReminders(orgId),
      this.followupReminderService.checkAndCreateFollowupReminders(orgId),
    ]);

    return {
      birthdayReminders: birthdayCount,
      followupReminders: followupCount,
      totalCreated: birthdayCount + followupCount,
    };
  }
}
