"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("../common/prisma/prisma.module");
const birthday_reminder_service_1 = require("./services/birthday-reminder.service");
const followup_reminder_service_1 = require("./services/followup-reminder.service");
const marketing_automation_service_1 = require("./services/marketing-automation.service");
const automation_scheduler_1 = require("./scheduler/automation.scheduler");
const ai_module_1 = require("../ai/ai.module");
let AutomationModule = class AutomationModule {
};
exports.AutomationModule = AutomationModule;
exports.AutomationModule = AutomationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            ai_module_1.AiModule,
        ],
        providers: [
            birthday_reminder_service_1.BirthdayReminderService,
            followup_reminder_service_1.FollowupReminderService,
            marketing_automation_service_1.MarketingAutomationService,
            automation_scheduler_1.AutomationScheduler,
        ],
        exports: [
            birthday_reminder_service_1.BirthdayReminderService,
            followup_reminder_service_1.FollowupReminderService,
            marketing_automation_service_1.MarketingAutomationService,
        ],
    })
], AutomationModule);
//# sourceMappingURL=automation.module.js.map