import { BirthdayReminderService } from '../services/birthday-reminder.service';
import { FollowupReminderService } from '../services/followup-reminder.service';
import { ChurnPredictionService } from '../../ai/services/churn-prediction.service';
export declare class AutomationScheduler {
    private readonly birthdayReminderService;
    private readonly followupReminderService;
    private readonly churnPredictionService;
    private readonly logger;
    constructor(birthdayReminderService: BirthdayReminderService, followupReminderService: FollowupReminderService, churnPredictionService: ChurnPredictionService);
    runDailyAutomation(): Promise<void>;
    updateChurnRiskScores(): Promise<void>;
}
