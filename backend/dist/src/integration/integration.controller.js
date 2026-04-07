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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../common/prisma/prisma.service");
const openapi_payload_dto_1 = require("./dto/openapi-payload.dto");
let IntegrationController = class IntegrationController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    extractOrgId(headers) {
        const orgId = headers['x-org-id'];
        if (!orgId) {
            throw new common_1.UnauthorizedException('X-Org-Id header is required for API access');
        }
        return orgId;
    }
    async listPatients(query, headers) {
        const orgId = this.extractOrgId(headers);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId, deletedAt: null };
        if (query.tier)
            where.tier = query.tier;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search } },
            ];
        }
        const [patients, total] = await Promise.all([
            this.prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    gender: true,
                    phone: true,
                    tier: true,
                    lastVisitAt: true,
                    createdAt: true,
                },
            }),
            this.prisma.patient.count({ where }),
        ]);
        return {
            data: patients,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getPatient(id, headers) {
        const orgId = this.extractOrgId(headers);
        const patient = await this.prisma.patient.findFirst({
            where: { id, orgId, deletedAt: null },
            select: {
                id: true,
                name: true,
                gender: true,
                phone: true,
                tier: true,
                lastVisitAt: true,
                createdAt: true,
            },
        });
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    }
    async listDemands(query, headers) {
        const orgId = this.extractOrgId(headers);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId };
        if (query.patientId)
            where.patientId = query.patientId;
        if (query.status)
            where.status = query.status;
        const [demands, total] = await Promise.all([
            this.prisma.demand.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    patientId: true,
                    type: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.demand.count({ where }),
        ]);
        return {
            data: demands,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async listTouchpoints(query, headers) {
        const orgId = this.extractOrgId(headers);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId };
        if (query.patientId)
            where.patientId = query.patientId;
        if (query.fromDate || query.toDate) {
            where.createdAt = {};
            if (query.fromDate)
                where.createdAt.gte = new Date(query.fromDate);
            if (query.toDate)
                where.createdAt.lte = new Date(query.toDate);
        }
        const [touchpoints, total] = await Promise.all([
            this.prisma.touchpoint.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    patientId: true,
                    type: true,
                    channel: true,
                    title: true,
                    sentiment: true,
                    createdAt: true,
                },
            }),
            this.prisma.touchpoint.count({ where }),
        ]);
        return {
            data: touchpoints,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async listHealthRecords(query, headers) {
        const orgId = this.extractOrgId(headers);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = { orgId, deletedAt: null };
        if (query.patientId)
            where.id = query.patientId;
        const patients = await this.prisma.patient.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                allergyHistory: true,
                pastHistory: true,
                createdAt: true,
            },
        });
        const healthRecords = patients.map((p) => ({
            patientId: p.id,
            patientName: p.name,
            category: 'GENERAL',
            allergyHistory: p.allergyHistory,
            pastHistory: p.pastHistory,
            createdAt: p.createdAt,
        }));
        const total = await this.prisma.patient.count({ where });
        return {
            data: healthRecords,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Get)('patients'),
    (0, swagger_1.ApiOperation)({
        summary: 'List patients',
        description: 'Public API endpoint for external systems to list patients. Requires X-Org-Id header.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tier', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [openapi_payload_dto_1.PatientQueryDto, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "listPatients", null);
__decorate([
    (0, common_1.Get)('patients/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get patient by ID',
        description: 'Public API endpoint for external systems to get a patient by ID.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "getPatient", null);
__decorate([
    (0, common_1.Get)('demands'),
    (0, swagger_1.ApiOperation)({
        summary: 'List demands',
        description: 'Public API endpoint for external systems to list demands.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'patientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [openapi_payload_dto_1.DemandQueryDto, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "listDemands", null);
__decorate([
    (0, common_1.Get)('touchpoints'),
    (0, swagger_1.ApiOperation)({
        summary: 'List touchpoints',
        description: 'Public API endpoint for external systems to list touchpoints.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'patientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [openapi_payload_dto_1.TouchpointQueryDto, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "listTouchpoints", null);
__decorate([
    (0, common_1.Get)('health-records'),
    (0, swagger_1.ApiOperation)({
        summary: 'List health records',
        description: 'Public API endpoint for external systems to list health records.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'patientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [openapi_payload_dto_1.HealthRecordQueryDto, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "listHealthRecords", null);
exports.IntegrationController = IntegrationController = __decorate([
    (0, swagger_1.ApiTags)('Integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map