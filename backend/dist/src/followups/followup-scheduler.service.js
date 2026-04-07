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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowupSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const followups_service_1 = require("./followups.service");
const logger_1 = require("../common/logger");
let FollowupSchedulerService = class FollowupSchedulerService {
    constructor(followupsService) {
        this.followupsService = followupsService;
        this.logger = new logger_1.Logger('FollowupSchedulerService');
    }
    async handleOverdueDetection() {
        this.logger.log('Running overdue followup detection...', 'FollowupSchedulerService');
        try {
            const result = await this.followupsService.detectOverdueRecords();
            this.logger.log(`Overdue detection complete: ${result.updated} records marked as missed`, 'FollowupSchedulerService');
        }
        catch (error) {
            this.logger.error(`Overdue detection failed: ${error.message}`, error.stack, 'FollowupSchedulerService');
        }
    }
};
exports.FollowupSchedulerService = FollowupSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FollowupSchedulerService.prototype, "handleOverdueDetection", null);
exports.FollowupSchedulerService = FollowupSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [followups_service_1.FollowupsService])
], FollowupSchedulerService);
//# sourceMappingURL=followup-scheduler.service.js.map