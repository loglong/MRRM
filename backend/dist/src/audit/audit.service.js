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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('AuditService');
    }
    async log(dto) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: dto.userId,
                    orgId: dto.orgId,
                    action: dto.action,
                    entityType: dto.entityType,
                    entityId: dto.entityId,
                    ipAddress: dto.ipAddress,
                    userAgent: dto.userAgent,
                    requestMethod: dto.requestMethod,
                    requestPath: dto.requestPath,
                    requestBody: dto.requestBody,
                    responseStatus: dto.responseStatus,
                    errorMessage: dto.errorMessage,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to write audit log', error instanceof Error ? error.stack : String(error), 'AuditService');
        }
    }
    async findAll(orgId, page = 1, limit = 50, filters = {}) {
        const skip = (page - 1) * limit;
        const where = { orgId, ...filters };
        const createdAtFilter = where.createdAt;
        if (createdAtFilter?.gte && createdAtFilter?.lte) {
            const diffDays = (createdAtFilter.lte.getTime() - createdAtFilter.gte.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 90) {
                throw new Error('Date range cannot exceed 90 days');
            }
        }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findByOrg(orgId, page = 1, limit = 50) {
        return this.findAll(orgId, page, limit);
    }
    async findByEntity(entityType, entityId, orgId) {
        return this.prisma.auditLog.findMany({
            where: {
                entityType,
                entityId,
                orgId,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getLogsForExport(orgId, startDate, endDate) {
        return this.prisma.auditLog.findMany({
            where: {
                orgId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10000,
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map