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
exports.ExperienceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let ExperienceService = class ExperienceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('ExperienceService');
    }
    async getSatisfactionTrends(orgId, filters) {
        const where = {
            orgId,
            voidedAt: null,
            sentiment: { not: null },
        };
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }
        const touchpoints = await this.prisma.touchpoint.findMany({
            where,
            select: {
                createdAt: true,
                sentiment: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        const groupedMap = new Map();
        touchpoints.forEach((tp) => {
            const periodKey = this.getPeriodKey(tp.createdAt, filters.granularity || 'day');
            if (!groupedMap.has(periodKey)) {
                groupedMap.set(periodKey, { positive: 0, neutral: 0, negative: 0, total: 0 });
            }
            const entry = groupedMap.get(periodKey);
            entry.total++;
            if (tp.sentiment === 'POSITIVE')
                entry.positive++;
            else if (tp.sentiment === 'NEUTRAL')
                entry.neutral++;
            else if (tp.sentiment === 'NEGATIVE')
                entry.negative++;
        });
        const trends = [];
        groupedMap.forEach((counts, period) => {
            const score = counts.total > 0 ? Math.round(((counts.positive - counts.negative) / counts.total) * 100) : 0;
            trends.push({
                period,
                score,
                positive: counts.positive,
                neutral: counts.neutral,
                negative: counts.negative,
                total: counts.total,
            });
        });
        return trends.sort((a, b) => a.period.localeCompare(b.period));
    }
    async getDecliningPatients(orgId, lookbackWeeks = 4, declineThreshold = -20) {
        const now = new Date();
        const currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const previousPeriodStart = new Date(now.getTime() - lookbackWeeks * 7 * 24 * 60 * 60 * 1000);
        const priorPreviousStart = new Date(previousPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        const currentScores = await this.getPatientSentimentScores(orgId, currentPeriodStart, now);
        const previousScores = await this.getPatientSentimentScores(orgId, priorPreviousStart, previousPeriodStart);
        const declining = [];
        for (const [patientId, current] of Object.entries(currentScores)) {
            const previous = previousScores[patientId];
            if (!previous)
                continue;
            const decline = current.score - previous.score;
            if (decline <= declineThreshold) {
                const patient = await this.prisma.patient.findFirst({
                    where: { id: patientId },
                    select: { name: true },
                });
                declining.push({
                    patientId,
                    patientName: patient?.name || 'Unknown',
                    currentScore: current.score,
                    previousScore: previous.score,
                    decline,
                });
            }
        }
        return declining.sort((a, b) => a.decline - b.decline);
    }
    async getPatientSatisfactionScore(patientId, orgId) {
        const touchpoints = await this.prisma.touchpoint.findMany({
            where: {
                patientId,
                orgId,
                voidedAt: null,
                sentiment: { not: null },
            },
            select: { sentiment: true },
        });
        if (touchpoints.length === 0)
            return 0;
        let positive = 0, negative = 0;
        touchpoints.forEach((tp) => {
            if (tp.sentiment === 'POSITIVE')
                positive++;
            else if (tp.sentiment === 'NEGATIVE')
                negative++;
        });
        return Math.round(((positive - negative) / touchpoints.length) * 100);
    }
    async getPatientSentimentScores(orgId, startDate, endDate) {
        const touchpoints = await this.prisma.touchpoint.findMany({
            where: {
                orgId,
                voidedAt: null,
                sentiment: { not: null },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                patientId: true,
                sentiment: true,
            },
        });
        const patientScores = {};
        touchpoints.forEach((tp) => {
            if (!patientScores[tp.patientId]) {
                patientScores[tp.patientId] = { positive: 0, negative: 0, total: 0 };
            }
            const entry = patientScores[tp.patientId];
            entry.total++;
            if (tp.sentiment === 'POSITIVE')
                entry.positive++;
            else if (tp.sentiment === 'NEGATIVE')
                entry.negative++;
        });
        const result = {};
        for (const [patientId, counts] of Object.entries(patientScores)) {
            result[patientId] = {
                score: counts.total > 0 ? Math.round(((counts.positive - counts.negative) / counts.total) * 100) : 0,
            };
        }
        return result;
    }
    getPeriodKey(date, granularity) {
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
};
exports.ExperienceService = ExperienceService;
exports.ExperienceService = ExperienceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExperienceService);
//# sourceMappingURL=experience.service.js.map