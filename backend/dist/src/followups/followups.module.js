"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowupsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("../common/prisma/prisma.module");
const followups_service_1 = require("./followups.service");
const followup_scheduler_service_1 = require("./followup-scheduler.service");
const followups_controller_1 = require("./followups.controller");
let FollowupsModule = class FollowupsModule {
};
exports.FollowupsModule = FollowupsModule;
exports.FollowupsModule = FollowupsModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), prisma_module_1.PrismaModule],
        controllers: [followups_controller_1.FollowupsController],
        providers: [followups_service_1.FollowupsService, followup_scheduler_service_1.FollowupSchedulerService],
        exports: [followups_service_1.FollowupsService],
    })
], FollowupsModule);
//# sourceMappingURL=followups.module.js.map