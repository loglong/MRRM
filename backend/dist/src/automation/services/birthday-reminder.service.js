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
exports.BirthdayReminderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let BirthdayReminderService = class BirthdayReminderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkAndCreateBirthdayReminders(orgId) {
        const today = new Date();
        const targetDates = this.getTargetBirthdayDates(today, 7);
        const whereClause = {
            status: 'ACTIVE',
            birthDate: { not: null },
        };
        if (orgId) {
            whereClause.orgId = orgId;
        }
        const patients = await this.prisma.patient.findMany({
            where: whereClause,
        });
        const upcomingBirthdays = patients.filter(p => {
            if (!p.birthDate)
                return false;
            const birthDate = new Date(p.birthDate);
            const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            return targetDates.some(d => d.getMonth() === thisYearBirthday.getMonth() &&
                d.getDate() === thisYearBirthday.getDate());
        });
        for (const patient of upcomingBirthdays) {
            await this.createBirthdayFollowup(patient, today);
        }
        return upcomingBirthdays.length;
    }
    async createBirthdayFollowup(patient, today) {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        const existingFollowup = await this.prisma.followupRecord.findFirst({
            where: {
                patientId: patient.id,
                scheduledAt: { gte: yearStart, lte: yearEnd },
                notes: { contains: '生日随访' },
            },
        });
        if (existingFollowup) {
            return;
        }
        let plan = await this.prisma.followupPlan.findFirst({
            where: {
                patientId: patient.id,
                name: '生日随访计划',
            },
        });
        if (!plan) {
            plan = await this.prisma.followupPlan.create({
                data: {
                    patientId: patient.id,
                    orgId: patient.orgId,
                    name: '生日随访计划',
                    type: 'ROUTINE',
                    status: 'ACTIVE',
                    frequencyDays: 365,
                    startDate: today,
                },
            });
        }
        const birthDate = new Date(patient.birthDate);
        const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        await this.prisma.followupRecord.create({
            data: {
                planId: plan.id,
                patientId: patient.id,
                orgId: patient.orgId,
                scheduledAt: birthdayThisYear,
                status: 'PENDING',
                notes: `患者${patient.name}生日随访`,
            },
        });
    }
    getTargetBirthdayDates(from, days) {
        const dates = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(from);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }
};
exports.BirthdayReminderService = BirthdayReminderService;
exports.BirthdayReminderService = BirthdayReminderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BirthdayReminderService);
//# sourceMappingURL=birthday-reminder.service.js.map