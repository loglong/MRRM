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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const encryption_service_1 = require("../common/encryption/encryption.service");
const logger_1 = require("../common/logger");
let PatientsService = class PatientsService {
    constructor(prisma, encryption) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.logger = new logger_1.Logger('PatientsService');
        this.encryptedFields = ['allergyHistory', 'pastHistory'];
    }
    async create(data, orgId) {
        const encryptedData = this.encryptSensitiveFields(data);
        const patient = await this.prisma.patient.create({
            data: {
                ...encryptedData,
                orgId,
                tier: data.tier || 'REGULAR',
            },
        });
        this.logger.log(`Patient created: ${patient.id} (${patient.name})`, 'PatientsService');
        return this.decryptSensitiveFields(patient);
    }
    async findAll(orgId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = { orgId, deletedAt: null };
        if (filters?.tier) {
            where.tier = filters.tier;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search } },
            ];
        }
        const [patients, total] = await Promise.all([
            this.prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.patient.count({ where }),
        ]);
        const decryptedPatients = patients.map((p) => this.decryptSensitiveFields(p));
        return {
            data: decryptedPatients,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const patient = await this.prisma.patient.findUnique({
            where: { id, deletedAt: null },
            include: {
                demands: { take: 10, orderBy: { createdAt: 'desc' } },
                touchpoints: { take: 10, orderBy: { createdAt: 'desc' } },
                followupPlans: { take: 5, orderBy: { createdAt: 'desc' } },
            },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.decryptSensitiveFields(patient);
    }
    async update(id, data) {
        await this.findById(id);
        const encryptedData = this.encryptSensitiveFields(data);
        const patient = await this.prisma.patient.update({
            where: { id },
            data: encryptedData,
        });
        this.logger.log(`Patient updated: ${patient.id}`, 'PatientsService');
        return this.decryptSensitiveFields(patient);
    }
    async delete(id) {
        await this.findById(id);
        const patient = await this.prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        this.logger.log(`Patient soft-deleted: ${patient.id}`, 'PatientsService');
        return patient;
    }
    async search(orgId, query, field = 'all') {
        const where = { orgId, deletedAt: null };
        if (field === 'name') {
            where.name = { contains: query, mode: 'insensitive' };
        }
        else if (field === 'phone') {
            where.phone = { contains: query };
        }
        else {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } },
            ];
        }
        const patients = await this.prisma.patient.findMany({
            where,
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
        return patients.map((p) => this.decryptSensitiveFields(p));
    }
    async getStats(orgId) {
        const [total, byTier, byGender] = await Promise.all([
            this.prisma.patient.count({ where: { orgId, deletedAt: null } }),
            this.prisma.patient.groupBy({
                by: ['tier'],
                where: { orgId, deletedAt: null },
                _count: true,
            }),
            this.prisma.patient.groupBy({
                by: ['gender'],
                where: { orgId, deletedAt: null },
                _count: true,
            }),
        ]);
        const byTierMap = { HIGH_VALUE: 0, REGULAR: 0, LOST_RISK: 0 };
        byTier.forEach((t) => {
            byTierMap[t.tier] = t._count;
        });
        const byGenderMap = {};
        byGender.forEach((g) => {
            byGenderMap[g.gender || 'UNKNOWN'] = g._count;
        });
        return {
            total,
            byTier: byTierMap,
            byGender: byGenderMap,
        };
    }
    encryptSensitiveFields(data) {
        if (!data)
            return data;
        const result = { ...data };
        for (const field of this.encryptedFields) {
            if (result[field]) {
                result[field] = this.encryption.encrypt(result[field]);
            }
        }
        return result;
    }
    decryptSensitiveFields(data) {
        if (!data)
            return data;
        const result = { ...data };
        for (const field of this.encryptedFields) {
            if (result[field]) {
                result[field] = this.encryption.decrypt(result[field]);
            }
        }
        return result;
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map