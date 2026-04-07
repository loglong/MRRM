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
exports.TouchpointsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let TouchpointsService = class TouchpointsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('TouchpointsService');
    }
    async create(data, orgId, userId) {
        const patient = await this.prisma.patient.findFirst({
            where: { id: data.patientId, orgId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const touchpoint = await this.prisma.touchpoint.create({
            data: {
                patientId: data.patientId,
                orgId,
                type: data.type,
                channel: data.channel || 'OFFLINE',
                title: data.title,
                content: data.content,
                sentiment: data.sentiment,
                duration: data.duration,
                outcome: data.outcome,
                followupRequired: data.followupRequired || false,
                followupDate: data.followupDate ? new Date(data.followupDate) : null,
            },
            include: {
                patient: { select: { id: true, name: true } },
            },
        });
        this.logger.log(`Touchpoint created: ${touchpoint.id} for patient ${data.patientId}`, 'TouchpointsService');
        return touchpoint;
    }
    async findAll(orgId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId, voidedAt: null };
        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.channel) {
            where.channel = filters.channel;
        }
        if (filters?.sentiment) {
            where.sentiment = filters.sentiment;
        }
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt.lte = new Date(filters.endDate);
            }
        }
        const [touchpoints, total] = await Promise.all([
            this.prisma.touchpoint.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: { select: { id: true, name: true } },
                },
            }),
            this.prisma.touchpoint.count({ where }),
        ]);
        return {
            data: touchpoints,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id, orgId) {
        const touchpoint = await this.prisma.touchpoint.findFirst({
            where: { id, orgId, voidedAt: null },
            include: {
                patient: { select: { id: true, name: true } },
            },
        });
        if (!touchpoint) {
            throw new common_1.NotFoundException('Touchpoint not found');
        }
        return touchpoint;
    }
    async update(id, data, orgId) {
        await this.findById(id, orgId);
        const touchpoint = await this.prisma.touchpoint.update({
            where: { id },
            data: {
                ...data,
                followupDate: data.followupDate ? new Date(data.followupDate) : undefined,
            },
            include: {
                patient: { select: { id: true, name: true } },
            },
        });
        this.logger.log(`Touchpoint updated: ${id}`, 'TouchpointsService');
        return touchpoint;
    }
    async void(id, reason, orgId) {
        const existing = await this.prisma.touchpoint.findFirst({
            where: { id, orgId, voidedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Touchpoint not found or already voided');
        }
        const touchpoint = await this.prisma.touchpoint.update({
            where: { id },
            data: {
                voidedAt: new Date(),
                voidedReason: reason,
            },
            include: {
                patient: { select: { id: true, name: true } },
            },
        });
        this.logger.log(`Touchpoint voided: ${id}, reason: ${reason}`, 'TouchpointsService');
        return touchpoint;
    }
    async getAnalytics(orgId, startDate, endDate, granularity = 'day') {
        const where = { orgId, voidedAt: null };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
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
        const countsMap = new Map();
        touchpoints.forEach((tp) => {
            const dateKey = this.getDateKey(tp.createdAt, granularity);
            countsMap.set(dateKey, (countsMap.get(dateKey) || 0) + 1);
        });
        const counts = Array.from(countsMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        const sentimentDistribution = {
            POSITIVE: 0,
            NEUTRAL: 0,
            NEGATIVE: 0,
        };
        touchpoints.forEach((tp) => {
            if (tp.sentiment) {
                sentimentDistribution[tp.sentiment]++;
            }
        });
        return {
            counts,
            sentimentDistribution: Object.entries(sentimentDistribution).map(([sentiment, count]) => ({
                sentiment,
                count,
            })),
            total: touchpoints.length,
        };
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
};
exports.TouchpointsService = TouchpointsService;
exports.TouchpointsService = TouchpointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TouchpointsService);
//# sourceMappingURL=touchpoints.service.js.map