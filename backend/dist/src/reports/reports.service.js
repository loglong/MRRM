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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('ReportsService');
    }
    async getKPIs(orgId, filters) {
        const where = { orgId };
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }
        const [newPatientsCount, demandStats, followupStats] = await Promise.all([
            this.prisma.patient.count({
                where: {
                    orgId,
                    createdAt: where.createdAt,
                    deletedAt: null,
                },
            }),
            this.prisma.demand.groupBy({
                by: ['status'],
                where: {
                    orgId,
                    createdAt: where.createdAt,
                },
                _count: true,
            }),
            this.prisma.followupRecord.groupBy({
                by: ['status'],
                where: {
                    orgId,
                    scheduledAt: where.createdAt,
                },
                _count: true,
            }),
        ]);
        let demandTotal = 0;
        let fulfilledCount = 0;
        for (const stat of demandStats) {
            demandTotal += stat._count;
            if (stat.status === 'FULFILLED') {
                fulfilledCount = stat._count;
            }
        }
        const conversionRate = demandTotal > 0 ? Math.round((fulfilledCount / demandTotal) * 100 * 100) / 100 : 0;
        let followupTotal = 0;
        let completedCount = 0;
        for (const stat of followupStats) {
            if (['COMPLETED', 'MISSED', 'PENDING'].includes(stat.status)) {
                followupTotal += stat._count;
                if (stat.status === 'COMPLETED') {
                    completedCount = stat._count;
                }
            }
        }
        const followupCompletionRate = followupTotal > 0 ? Math.round((completedCount / followupTotal) * 100 * 100) / 100 : 0;
        const periodStart = filters.startDate ? filters.startDate.toISOString() : 'all time';
        const periodEnd = filters.endDate ? filters.endDate.toISOString() : 'now';
        this.logger.log(`KPI report for org ${orgId}: ${newPatientsCount} new patients, ${conversionRate}% conversion, ${followupCompletionRate}% followup completion`, 'ReportsService');
        return {
            newPatients: newPatientsCount,
            conversionRate,
            followupCompletionRate,
            period: { start: periodStart, end: periodEnd },
        };
    }
    async getKPITrends(orgId, filters) {
        const granularity = filters.granularity || 'day';
        const trends = [];
        if (!filters.startDate || !filters.endDate) {
            return trends;
        }
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const periodEnd = this.getPeriodEnd(currentDate, granularity);
            const periodWhere = {
                orgId,
                createdAt: {
                    gte: currentDate,
                    lt: periodEnd > endDate ? endDate : periodEnd,
                },
            };
            const [newPatientsCount, demandStats, followupStats] = await Promise.all([
                this.prisma.patient.count({
                    where: {
                        orgId,
                        createdAt: periodWhere.createdAt,
                        deletedAt: null,
                    },
                }),
                this.prisma.demand.groupBy({
                    by: ['status'],
                    where: {
                        orgId,
                        createdAt: periodWhere.createdAt,
                    },
                    _count: true,
                }),
                this.prisma.followupRecord.groupBy({
                    by: ['status'],
                    where: {
                        orgId,
                        scheduledAt: periodWhere.createdAt,
                    },
                    _count: true,
                }),
            ]);
            let demandTotal = 0;
            let fulfilledCount = 0;
            for (const stat of demandStats) {
                demandTotal += stat._count;
                if (stat.status === 'FULFILLED') {
                    fulfilledCount = stat._count;
                }
            }
            const conversionRate = demandTotal > 0 ? Math.round((fulfilledCount / demandTotal) * 100 * 100) / 100 : 0;
            let followupTotal = 0;
            let completedCount = 0;
            for (const stat of followupStats) {
                if (['COMPLETED', 'MISSED', 'PENDING'].includes(stat.status)) {
                    followupTotal += stat._count;
                    if (stat.status === 'COMPLETED') {
                        completedCount = stat._count;
                    }
                }
            }
            const followupCompletionRate = followupTotal > 0 ? Math.round((completedCount / followupTotal) * 100 * 100) / 100 : 0;
            trends.push({
                date: this.getDateKey(currentDate, granularity),
                newPatients: newPatientsCount,
                conversionRate,
                followupCompletionRate,
            });
            this.moveToNextPeriod(currentDate, granularity);
        }
        return trends;
    }
    getDateKey(date, granularity) {
        const d = new Date(date);
        if (granularity === 'day') {
            return d.toISOString().split('T')[0];
        }
        else if (granularity === 'week') {
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const weekStart = new Date(d.setDate(diff));
            return weekStart.toISOString().split('T')[0];
        }
        else {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
    }
    getPeriodEnd(date, granularity) {
        const d = new Date(date);
        if (granularity === 'day') {
            d.setDate(d.getDate() + 1);
        }
        else if (granularity === 'week') {
            d.setDate(d.getDate() + 7);
        }
        else {
            d.setMonth(d.getMonth() + 1);
        }
        return d;
    }
    moveToNextPeriod(date, granularity) {
        if (granularity === 'day') {
            date.setDate(date.getDate() + 1);
        }
        else if (granularity === 'week') {
            date.setDate(date.getDate() + 7);
        }
        else {
            date.setMonth(date.getMonth() + 1);
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map