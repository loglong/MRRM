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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let OrganizationsService = class OrganizationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('OrganizationsService');
    }
    async onModuleInit() {
        await this.seedSystemOrganization();
    }
    async seedSystemOrganization() {
        const existingSystem = await this.prisma.organization.findUnique({
            where: { code: 'SYSTEM' },
        });
        if (!existingSystem) {
            try {
                await this.prisma.organization.create({
                    data: {
                        name: 'System',
                        code: 'SYSTEM',
                        status: 'ACTIVE',
                        metadata: { type: 'system', description: 'System-level organization' },
                    },
                });
                this.logger.log('System organization seeded', 'OrganizationsService');
            }
            catch (error) {
                this.logger.error('Failed to seed system organization', error instanceof Error ? error.stack : String(error), 'OrganizationsService');
            }
        }
        const existingDefault = await this.prisma.organization.findUnique({
            where: { id: 'default-org' },
        });
        if (!existingDefault) {
            try {
                await this.prisma.organization.create({
                    data: {
                        id: 'default-org',
                        name: 'Default Organization',
                        code: 'DEFAULT',
                        status: 'ACTIVE',
                        metadata: { type: 'default', description: 'Default organization for new users' },
                    },
                });
                this.logger.log('Default organization seeded', 'OrganizationsService');
            }
            catch (error) {
                this.logger.error('Failed to seed default organization', error instanceof Error ? error.stack : String(error), 'OrganizationsService');
            }
        }
    }
    async findById(id) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
        });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async findByCode(code) {
        const org = await this.prisma.organization.findUnique({
            where: { code },
        });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [orgs, total] = await Promise.all([
            this.prisma.organization.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.organization.count(),
        ]);
        return {
            data: orgs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async create(data) {
        const existing = await this.prisma.organization.findUnique({
            where: { code: data.code },
        });
        if (existing) {
            throw new common_1.ConflictException('Organization with this code already exists');
        }
        const org = await this.prisma.organization.create({
            data: {
                name: data.name,
                code: data.code,
                domain: data.domain,
                metadata: data.metadata,
            },
        });
        this.logger.log(`Organization created: ${org.name} (${org.code})`, 'OrganizationsService');
        return org;
    }
    async update(id, data) {
        const org = await this.prisma.organization.update({
            where: { id },
            data,
        });
        this.logger.log(`Organization updated: ${org.name}`, 'OrganizationsService');
        return org;
    }
    async delete(id) {
        const org = await this.prisma.organization.update({
            where: { id },
            data: { status: 'SUSPENDED' },
        });
        this.logger.log(`Organization soft-deleted: ${org.name}`, 'OrganizationsService');
        return org;
    }
    async createSuperAdminOrg(_userId, userEmail) {
        const code = `ORG-${Date.now()}`;
        const org = await this.prisma.organization.create({
            data: {
                name: 'Default Organization',
                code,
                status: 'ACTIVE',
                metadata: { createdFor: userEmail, type: 'default' },
            },
        });
        this.logger.log(`Created default org ${org.code} for super admin ${userEmail}`, 'OrganizationsService');
        return org;
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map