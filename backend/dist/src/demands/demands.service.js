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
exports.DemandsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
const VALID_TRANSITIONS = {
    OPEN: ['IN_PROGRESS', 'CANCELLED', 'LOST'],
    IN_PROGRESS: ['PENDING', 'FULFILLED', 'CANCELLED', 'LOST'],
    PENDING: ['FULFILLED', 'CANCELLED', 'LOST'],
    FULFILLED: [],
    CANCELLED: [],
    LOST: [],
};
const TERMINAL_STATUSES = ['FULFILLED', 'CANCELLED', 'LOST'];
let DemandsService = class DemandsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('DemandsService');
    }
    async create(data, orgId, userId) {
        const patient = await this.prisma.patient.findFirst({
            where: { id: data.patientId, orgId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const demand = await this.prisma.demand.create({
            data: {
                patientId: data.patientId,
                orgId,
                type: data.type,
                source: data.source || 'WALK_IN',
                title: data.title,
                description: data.description,
                priority: data.priority || 'MEDIUM',
                status: 'OPEN',
                estimatedAmount: data.estimatedAmount,
            },
        });
        await this.prisma.demandStatusHistory.create({
            data: {
                demandId: demand.id,
                fromStatus: null,
                toStatus: 'OPEN',
                changedBy: userId,
                notes: null,
            },
        });
        this.logger.log(`Demand created: ${demand.id} for patient ${patient.name}`, 'DemandsService');
        return this.findById(demand.id, orgId);
    }
    async findAll(orgId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId };
        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.priority) {
            where.priority = filters.priority;
        }
        if (filters?.source) {
            where.source = filters.source;
        }
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.createdAt.lte = new Date(filters.dateTo);
            }
        }
        const [demands, total] = await Promise.all([
            this.prisma.demand.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: {
                        select: { id: true, name: true },
                    },
                },
            }),
            this.prisma.demand.count({ where }),
        ]);
        return {
            data: demands,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id, orgId) {
        const demand = await this.prisma.demand.findFirst({
            where: { id, orgId },
            include: {
                patient: {
                    select: { id: true, name: true, phone: true },
                },
                statusHistory: {
                    orderBy: { createdAt: 'asc' },
                    include: {},
                },
            },
        });
        if (!demand) {
            throw new common_1.NotFoundException('Demand not found');
        }
        return demand;
    }
    async update(id, orgId, data) {
        const existing = await this.prisma.demand.findFirst({
            where: { id, orgId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Demand not found');
        }
        if (TERMINAL_STATUSES.includes(existing.status)) {
            throw new common_1.BadRequestException('Cannot update demand with terminal status');
        }
        const demand = await this.prisma.demand.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                source: data.source,
                estimatedAmount: data.estimatedAmount,
                actualAmount: data.actualAmount,
                closeReason: data.closeReason,
            },
        });
        this.logger.log(`Demand updated: ${demand.id}`, 'DemandsService');
        return this.findById(id, orgId);
    }
    async changeStatus(id, orgId, userId, data) {
        const existing = await this.prisma.demand.findFirst({
            where: { id, orgId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Demand not found');
        }
        const { status: newStatus, notes } = data;
        const validNextStatuses = VALID_TRANSITIONS[existing.status];
        if (!validNextStatuses || !validNextStatuses.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${existing.status} to ${newStatus}`);
        }
        const updateData = { status: newStatus };
        if (TERMINAL_STATUSES.includes(newStatus)) {
            updateData.closedAt = new Date();
        }
        const demand = await this.prisma.demand.update({
            where: { id },
            data: updateData,
        });
        await this.prisma.demandStatusHistory.create({
            data: {
                demandId: id,
                fromStatus: existing.status,
                toStatus: newStatus,
                changedBy: userId,
                notes: notes || null,
            },
        });
        this.logger.log(`Demand ${id} status changed: ${existing.status} -> ${newStatus}`, 'DemandsService');
        return this.findById(id, orgId);
    }
    async getStatusHistory(demandId, orgId) {
        const demand = await this.prisma.demand.findFirst({
            where: { id: demandId, orgId },
        });
        if (!demand) {
            throw new common_1.NotFoundException('Demand not found');
        }
        return this.prisma.demandStatusHistory.findMany({
            where: { demandId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getPatientDemands(patientId, orgId) {
        const patient = await this.prisma.patient.findFirst({
            where: { id: patientId, orgId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.prisma.demand.findMany({
            where: { patientId, orgId },
            orderBy: { createdAt: 'desc' },
            include: {
                statusHistory: {
                    orderBy: { createdAt: 'asc' },
                    take: 1,
                },
            },
        });
    }
    async getDemandStats(orgId) {
        const [total, byStatus, byType, byPriority] = await Promise.all([
            this.prisma.demand.count({ where: { orgId } }),
            this.prisma.demand.groupBy({
                by: ['status'],
                where: { orgId },
                _count: true,
            }),
            this.prisma.demand.groupBy({
                by: ['type'],
                where: { orgId },
                _count: true,
            }),
            this.prisma.demand.groupBy({
                by: ['priority'],
                where: { orgId },
                _count: true,
            }),
        ]);
        const byStatusMap = {
            OPEN: 0,
            IN_PROGRESS: 0,
            PENDING: 0,
            FULFILLED: 0,
            CANCELLED: 0,
            LOST: 0,
        };
        byStatus.forEach((s) => {
            byStatusMap[s.status] = s._count;
        });
        const byTypeMap = {};
        byType.forEach((t) => {
            byTypeMap[t.type] = t._count;
        });
        const byPriorityMap = {};
        byPriority.forEach((p) => {
            byPriorityMap[p.priority] = p._count;
        });
        return {
            total,
            byStatus: byStatusMap,
            byType: byTypeMap,
            byPriority: byPriorityMap,
        };
    }
};
exports.DemandsService = DemandsService;
exports.DemandsService = DemandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DemandsService);
//# sourceMappingURL=demands.service.js.map