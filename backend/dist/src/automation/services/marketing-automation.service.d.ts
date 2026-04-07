import { BirthdayReminderService } from './birthday-reminder.service';
import { FollowupReminderService } from './followup-reminder.service';
export interface AutomationResult {
    birthdayReminders: number;
    followupReminders: number;
    totalCreated: number;
}
export declare class MarketingAutomationService {
    private readonly birthdayReminderService;
    private readonly followupReminderService;
    constructor(birthdayReminderService: BirthdayReminderService, followupReminderService: FollowupReminderService);
    runAllAutomations(orgId?: string): Promise<AutomationResult>;
}
