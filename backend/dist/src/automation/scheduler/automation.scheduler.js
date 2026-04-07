"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AutomationScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const birthday_reminder_service_1 = require("../services/birthday-reminder.service");
const followup_reminder_service_1 = require("../services/followup-reminder.service");
const churn_prediction_service_1 = require("../../ai/services/churn-prediction.service");
const logger_1 = require("../../common/logger");
let AutomationScheduler = AutomationScheduler_1 = class AutomationScheduler {
    constructor(birthdayReminderService, followupReminderService, churnPredictionService) {
        this.birthdayReminderService = birthdayReminderService;
        this.followupReminderService = followupReminderService;
        this.churnPredictionService = churnPredictionService;
        this.logger = new logger_1.Logger(AutomationScheduler_1.name);
    }
    async runDailyAutomation() {
        this.logger.log('Starting daily automation tasks...');
        try {
            const birthdayCount = await this.birthdayReminderService.checkAndCreateBirthdayReminders();
            this.logger.log(`Created ${birthdayCount} birthday reminders`);
        }
        catch (error) {
            this.logger.error('Birthday reminder task failed', error);
        }
        try {
            const followupCount = await this.followupReminderService.checkAndCreateFollowupReminders();
            this.logger.log(`Created ${followupCount} follow-up reminders`);
        }
        catch (error) {
            this.logger.error('Follow-up reminder task failed', error);
        }
        this.logger.log('Daily automation tasks completed');
    }
    async updateChurnRiskScores() {
        try {
            const highRiskPatients = await this.churnPredictionService.getHighRiskPatients(70);
            if (highRiskPatients.length > 0) {
                this.logger.warn(`Found ${highRiskPatients.length} high-risk patients`);
            }
        }
        catch (error) {
            this.logger.error('Churn risk update failed', error);
        }
    }
};
exports.AutomationScheduler = AutomationScheduler;
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationScheduler.prototype, "runDailyAutomation", null);
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationScheduler.prototype, "updateChurnRiskScores", null);
exports.AutomationScheduler = AutomationScheduler = AutomationScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [birthday_reminder_service_1.BirthdayReminderService,
        followup_reminder_service_1.FollowupReminderService,
        churn_prediction_service_1.ChurnPredictionService])
], AutomationScheduler);
//# sourceMappingURL=automation.scheduler.js.map