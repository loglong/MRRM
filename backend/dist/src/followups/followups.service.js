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
exports.FollowupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let FollowupsService = class FollowupsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('FollowupsService');
    }
    async createPlan(dto, orgId, userId) {
        const patient = await this.prisma.patient.findFirst({
            where: { id: dto.patientId, orgId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const assignedUserId = dto.assignedUserId || patient.assignedUserId;
        if (dto.pathInstanceStepId) {
            const step = await this.prisma.pathInstanceStep.findUnique({
                where: { id: dto.pathInstanceStepId },
            });
            if (!step) {
                throw new common_1.NotFoundException('Path instance step not found');
            }
        }
        const plan = await this.prisma.followupPlan.create({
            data: {
                patientId: dto.patientId,
                orgId,
                name: dto.name,
                type: dto.type || 'ROUTINE',
                frequencyDays: dto.frequencyDays,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                assignedUserId,
            },
            include: {
                patient: { select: { id: true, name: true } },
                assignedUser: { select: { id: true, name: true } },
            },
        });
        this.logger.log(`FollowupPlan created: ${plan.id} for patient ${dto.patientId}`, 'FollowupsService');
        if (dto.frequencyDays && dto.frequencyDays > 0) {
            await this.generateFollowupRecords(plan, dto.pathInstanceStepId);
        }
        const recordCount = await this.prisma.followupRecord.count({
            where: { planId: plan.id },
        });
        return {
            ...plan,
            recordCount,
            completedCount: 0,
        };
    }
    async generateFollowupRecords(plan, pathInstanceStepId) {
        if (!plan.frequencyDays || plan.frequencyDays <= 0) {
            return;
        }
        const frequencyDays = plan.frequencyDays;
        const startDate = new Date(plan.startDate);
        const endDate = plan.endDate ? new Date(plan.endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        const records = [];
        let currentDate = new Date(startDate);
        let recordCount = 0;
        const maxRecords = 365;
        while (currentDate <= endDate && recordCount < maxRecords) {
            records.push({
                planId: plan.id,
                patientId: plan.patientId,
                orgId: plan.orgId,
                scheduledAt: new Date(currentDate),
                status: 'PENDING',
                pathInstanceStepId,
            });
            currentDate = new Date(currentDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
            recordCount++;
        }
        if (records.length > 0) {
            await this.prisma.followupRecord.createMany({ data: records });
            this.logger.log(`Generated ${records.length} FollowupRecords for plan ${plan.id}`, 'FollowupsService');
        }
    }
    async findPlans(orgId, filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId };
        if (filters.patientId) {
            where.patientId = filters.patientId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.assignedUserId) {
            where.assignedUserId = filters.assignedUserId;
        }
        const [plans, total] = await Promise.all([
            this.prisma.followupPlan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: { select: { id: true, name: true } },
                    assignedUser: { select: { id: true, name: true } },
                    _count: { select: { records: true } },
                },
            }),
            this.prisma.followupPlan.count({ where }),
        ]);
        const plansWithStats = await Promise.all(plans.map(async (plan) => {
            const [totalRecords, completedRecords] = await Promise.all([
                this.prisma.followupRecord.count({ where: { planId: plan.id } }),
                this.prisma.followupRecord.count({ where: { planId: plan.id, status: 'COMPLETED' } }),
            ]);
            return {
                ...plan,
                recordCount: totalRecords,
                completedCount: completedRecords,
            };
        }));
        return {
            data: plansWithStats,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findPlanById(id, orgId) {
        const plan = await this.prisma.followupPlan.findFirst({
            where: { id, orgId },
            include: {
                patient: { select: { id: true, name: true } },
                assignedUser: { select: { id: true, name: true } },
                records: {
                    orderBy: { scheduledAt: 'asc' },
                },
            },
        });
        if (!plan) {
            throw new common_1.NotFoundException('FollowupPlan not found');
        }
        return plan;
    }
    async findRecords(orgId, filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId };
        if (!filters.status) {
            where.status = { in: ['PENDING', 'MISSED'] };
        }
        else {
            where.status = filters.status;
        }
        if (filters.planId) {
            where.planId = filters.planId;
        }
        if (filters.patientId) {
            where.patientId = filters.patientId;
        }
        if (filters.fromDate || filters.toDate) {
            where.scheduledAt = {};
            if (filters.fromDate) {
                where.scheduledAt.gte = new Date(filters.fromDate);
            }
            if (filters.toDate) {
                where.scheduledAt.lte = new Date(filters.toDate);
            }
        }
        const [records, total] = await Promise.all([
            this.prisma.followupRecord.findMany({
                where,
                skip,
                take: limit,
                orderBy: { scheduledAt: 'desc' },
                include: {
                    plan: { select: { id: true, name: true } },
                    patient: { select: { id: true, name: true } },
                },
            }),
            this.prisma.followupRecord.count({ where }),
        ]);
        return {
            data: records,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async executeRecord(recordId, dto, userId, orgId) {
        const record = await this.prisma.followupRecord.findFirst({
            where: { id: recordId, orgId },
            include: {
                plan: true,
                patient: true,
            },
        });
        if (!record) {
            throw new common_1.NotFoundException('FollowupRecord not found');
        }
        if (record.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only PENDING records can be executed');
        }
        const updatedRecord = await this.prisma.followupRecord.update({
            where: { id: recordId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                completedById: userId,
                outcome: dto.outcome,
                notes: dto.notes,
            },
            include: {
                plan: { select: { id: true, name: true } },
                patient: { select: { id: true, name: true } },
            },
        });
        this.logger.log(`FollowupRecord executed: ${recordId}`, 'FollowupsService');
        await this.prisma.touchpoint.create({
            data: {
                patientId: record.patientId,
                orgId: record.orgId,
                type: 'VISIT',
                channel: 'OFFLINE',
                title: `随访完成: ${record.plan.name}`,
                content: dto.notes || dto.outcome || null,
                followupRequired: false,
            },
        });
        this.logger.log(`Auto-created Touchpoint for FollowupRecord ${recordId}`, 'FollowupsService');
        const remainingPending = await this.prisma.followupRecord.count({
            where: { planId: record.planId, status: 'PENDING', id: { not: recordId } },
        });
        if (remainingPending === 0) {
            await this.prisma.followupPlan.update({
                where: { id: record.planId },
                data: { status: 'COMPLETED' },
            });
            this.logger.log(`FollowupPlan ${record.planId} marked as COMPLETED`, 'FollowupsService');
        }
        return updatedRecord;
    }
    async detectOverdueRecords() {
        const now = new Date();
        const overdueRecords = await this.prisma.followupRecord.findMany({
            where: {
                status: 'PENDING',
                scheduledAt: { lt: now },
            },
            include: {
                plan: {
                    include: {
                        assignedUser: true,
                        patient: true,
                    },
                },
            },
        });
        let updatedCount = 0;
        for (const record of overdueRecords) {
            await this.prisma.followupRecord.update({
                where: { id: record.id },
                data: { status: 'MISSED' },
            });
            if (record.plan.assignedUserId && record.plan.assignedUser) {
                await this.prisma.notification.create({
                    data: {
                        userId: record.plan.assignedUserId,
                        title: '随访逾期提醒',
                        message: `患者 ${record.plan.patient.name} 的随访任务已逾期，请及时处理。`,
                        type: 'FOLLOWUP_OVERDUE',
                        link: `/followups?recordId=${record.id}`,
                        orgId: record.orgId,
                    },
                });
            }
            updatedCount++;
        }
        return { updated: updatedCount };
    }
    async getCompletionRate(orgId, filters) {
        const where = { orgId };
        if (filters?.startDate || filters?.endDate) {
            where.scheduledAt = {};
            if (filters.startDate) {
                where.scheduledAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.scheduledAt.lte = new Date(filters.endDate);
            }
        }
        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }
        const [total, completed, missed, pending] = await Promise.all([
            this.prisma.followupRecord.count({ where }),
            this.prisma.followupRecord.count({ where: { ...where, status: 'COMPLETED' } }),
            this.prisma.followupRecord.count({ where: { ...where, status: 'MISSED' } }),
            this.prisma.followupRecord.count({ where: { ...where, status: 'PENDING' } }),
        ]);
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const plans = await this.prisma.followupPlan.findMany({
            where: { orgId },
            select: { id: true, name: true },
        });
        const byPlan = await Promise.all(plans.map(async (plan) => {
            const [planTotal, planCompleted] = await Promise.all([
                this.prisma.followupRecord.count({ where: { ...where, planId: plan.id } }),
                this.prisma.followupRecord.count({ where: { ...where, planId: plan.id, status: 'COMPLETED' } }),
            ]);
            return {
                planId: plan.id,
                planName: plan.name,
                rate: planTotal > 0 ? Math.round((planCompleted / planTotal) * 100) : 0,
            };
        }));
        return {
            total,
            completed,
            missed,
            pending,
            completionRate,
            byPlan,
        };
    }
    async pausePlan(planId, orgId) {
        const plan = await this.prisma.followupPlan.findFirst({
            where: { id: planId, orgId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('FollowupPlan not found');
        }
        if (plan.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Only ACTIVE plans can be paused');
        }
        return this.prisma.followupPlan.update({
            where: { id: planId },
            data: { status: 'PAUSED' },
        });
    }
    async resumePlan(planId, orgId) {
        const plan = await this.prisma.followupPlan.findFirst({
            where: { id: planId, orgId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('FollowupPlan not found');
        }
        if (plan.status !== 'PAUSED') {
            throw new common_1.BadRequestException('Only PAUSED plans can be resumed');
        }
        return this.prisma.followupPlan.update({
            where: { id: planId },
            data: { status: 'ACTIVE' },
        });
    }
};
exports.FollowupsService = FollowupsService;
exports.FollowupsService = FollowupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FollowupsService);
//# sourceMappingURL=followups.service.js.map