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
exports.FollowupReminderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let FollowupReminderService = class FollowupReminderService {
    constructor(prisma) {
        this.prisma = prisma;
        this.FOLLOWUP_CYCLES = {
            implant: 180,
            orthodontics: 30,
            whitening: 14,
            restoration: 30,
            periodontal: 90,
            extraction: 7,
            pediatric: 90,
            checkup: 180,
        };
    }
    async checkAndCreateFollowupReminders(orgId) {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const whereClause = {
            status: 'FULFILLED',
            treatmentEndDate: { gte: twoYearsAgo },
        };
        if (orgId) {
            whereClause.orgId = orgId;
        }
        const completedDemands = await this.prisma.demand.findMany({
            where: whereClause,
            include: {
                patient: {
                    select: { id: true, name: true, orgId: true, assignedUserId: true },
                },
            },
        });
        let remindersCreated = 0;
        for (const demand of completedDemands) {
            if (!demand.treatmentEndDate)
                continue;
            const cycleDays = this.FOLLOWUP_CYCLES[demand.type.toLowerCase()] || 90;
            const followupDate = this.calculateFollowupDate(new Date(demand.treatmentEndDate), cycleDays);
            if (this.isWithinReminderWindow(followupDate, 7)) {
                const created = await this.createFollowupReminder(demand, followupDate);
                if (created)
                    remindersCreated++;
            }
        }
        return remindersCreated;
    }
    calculateFollowupDate(endTime, cycleDays) {
        const date = new Date(endTime);
        date.setDate(date.getDate() + cycleDays);
        return date;
    }
    isWithinReminderWindow(targetDate, windowDays) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + windowDays);
        return targetDate >= today && targetDate <= maxDate;
    }
    async createFollowupReminder(demand, followupDate) {
        const dayBefore = new Date(followupDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        const dayAfter = new Date(followupDate);
        dayAfter.setDate(dayAfter.getDate() + 1);
        const existing = await this.prisma.followupRecord.findFirst({
            where: {
                patientId: demand.patientId,
                scheduledAt: { gte: dayBefore, lte: dayAfter },
                notes: { contains: demand.type },
            },
        });
        if (existing) {
            return false;
        }
        await this.prisma.followupRecord.create({
            data: {
                patientId: demand.patientId,
                orgId: demand.patient.orgId,
                scheduledAt: followupDate,
                status: 'PENDING',
                notes: `${demand.type}复诊提醒`,
            },
        });
        return true;
    }
};
exports.FollowupReminderService = FollowupReminderService;
exports.FollowupReminderService = FollowupReminderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FollowupReminderService);
//# sourceMappingURL=followup-reminder.service.js.map