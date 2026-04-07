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
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let MobileService = class MobileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPatients(dto, orgId) {
        const { page = 1, pageSize = 20, search } = dto;
        const skip = (page - 1) * pageSize;
        const where = {
            orgId,
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [patients, total] = await this.prisma.$transaction([
            this.prisma.patient.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    assignedUser: {
                        select: { name: true },
                    },
                },
            }),
            this.prisma.patient.count({ where }),
        ]);
        const data = patients.map((p) => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            gender: p.gender || null,
            tier: p.tier,
            status: p.status,
            lastVisitAt: p.lastVisitAt ? p.lastVisitAt.toISOString() : null,
            assignedUserName: p.assignedUser?.name || null,
        }));
        return {
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getDemands(dto, orgId) {
        const { page = 1, pageSize = 20, status } = dto;
        const skip = (page - 1) * pageSize;
        const where = {
            orgId,
        };
        if (status) {
            where.status = status;
        }
        const [demands, total] = await this.prisma.$transaction([
            this.prisma.demand.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: {
                        select: { name: true },
                    },
                },
            }),
            this.prisma.demand.count({ where }),
        ]);
        const data = demands.map((d) => ({
            id: d.id,
            patientId: d.patientId,
            patientName: d.patient.name,
            type: d.type,
            title: d.title,
            status: d.status,
            priority: d.priority,
            createdAt: d.createdAt.toISOString(),
        }));
        return {
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getRecentTouchpoints(orgId, limit = 10) {
        const touchpoints = await this.prisma.touchpoint.findMany({
            where: {
                orgId,
                voidedAt: null,
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                patient: {
                    select: { name: true },
                },
            },
        });
        const data = touchpoints.map((t) => ({
            id: t.id,
            patientId: t.patientId,
            patientName: t.patient.name,
            type: t.type,
            title: t.title,
            content: t.content,
            sentiment: t.sentiment || null,
            createdAt: t.createdAt.toISOString(),
        }));
        return { data };
    }
    async getPendingFollowups(orgId, limit = 20) {
        const followups = await this.prisma.followupRecord.findMany({
            where: {
                orgId,
                status: 'PENDING',
            },
            take: limit,
            orderBy: { scheduledAt: 'asc' },
            include: {
                patient: {
                    select: { name: true },
                },
            },
        });
        const data = followups.map((f) => ({
            id: f.id,
            patientId: f.patientId,
            patientName: f.patient.name,
            type: f.type,
            status: f.status,
            planTime: f.scheduledAt.toISOString(),
            content: f.outcome || null,
        }));
        return { data };
    }
};
exports.MobileService = MobileService;
exports.MobileService = MobileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MobileService);
//# sourceMappingURL=mobile.service.js.map