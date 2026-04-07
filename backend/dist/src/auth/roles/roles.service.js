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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const logger_1 = require("../../common/logger");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('RolesService');
    }
    async onModuleInit() {
        await this.seedDefaultRoles();
    }
    async findAll(orgId) {
        return this.prisma.role.findMany({
            where: { orgId },
            include: { _count: { select: { users: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async findByCode(code, orgId) {
        return this.prisma.role.findFirst({
            where: { code, orgId },
        });
    }
    async create(data) {
        const existing = await this.findByCode(data.code, data.orgId);
        if (existing) {
            throw new common_1.BadRequestException(`Role with code '${data.code}' already exists`);
        }
        const role = await this.prisma.role.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                orgId: data.orgId,
                isSystem: false,
            },
        });
        if (data.permissionIds && data.permissionIds.length > 0) {
            await this.prisma.rolePermission.createMany({
                data: data.permissionIds.map((permissionId) => ({
                    roleId: role.id,
                    permissionId,
                })),
            });
        }
        this.logger.log(`Role created: ${role.code}`, 'RolesService');
        return this.findById(role.id);
    }
    async update(id, data) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        if (role.isSystem) {
            throw new common_1.BadRequestException('Cannot modify system role');
        }
        const updatedRole = await this.prisma.role.update({
            where: { id },
            data: {
                name: data.name ?? role.name,
                description: data.description ?? role.description,
            },
        });
        if (data.permissionIds !== undefined) {
            await this.prisma.rolePermission.deleteMany({
                where: { roleId: id },
            });
            if (data.permissionIds.length > 0) {
                await this.prisma.rolePermission.createMany({
                    data: data.permissionIds.map((permissionId) => ({
                        roleId: id,
                        permissionId,
                    })),
                });
            }
        }
        this.logger.log(`Role updated: ${role.code}`, 'RolesService');
        return this.findById(id);
    }
    async delete(id) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        if (role.isSystem) {
            throw new common_1.BadRequestException('Cannot delete system role');
        }
        await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
        await this.prisma.userRole.deleteMany({ where: { roleId: id } });
        const deletedRole = await this.prisma.role.delete({ where: { id } });
        this.logger.log(`Role deleted: ${role.code}`, 'RolesService');
        return deletedRole;
    }
    async seedDefaultRoles() {
        const orgId = 'default-org';
        const existingRoles = await this.prisma.role.findMany({ where: { orgId } });
        if (existingRoles.length > 0) {
            this.logger.log(`Roles already seeded (${existingRoles.length})`, 'RolesService');
            return;
        }
        const allPermissions = await this.prisma.permission.findMany();
        const permissionMap = new Map(allPermissions.map((p) => [p.code, p.id]));
        const defaultRoles = [
            {
                name: 'System Administrator',
                code: 'SYSTEM_ADMIN',
                description: 'Full system access',
                isSystem: true,
                permissions: allPermissions.map((p) => p.id),
            },
            {
                name: 'Organization Administrator',
                code: 'ORG_ADMIN',
                description: 'Organization-level admin access',
                isSystem: true,
                permissions: [
                    'menu:dashboard',
                    'menu:patients',
                    'menu:demands',
                    'menu:paths',
                    'menu:touchpoints',
                    'menu:followups',
                    'menu:reports',
                    'menu:admin',
                    'patient:create',
                    'patient:read',
                    'patient:update',
                    'patient:delete',
                    'demand:create',
                    'demand:read',
                    'demand:update',
                    'demand:delete',
                    'path:create',
                    'path:read',
                    'path:update',
                    'path:delete',
                    'touchpoint:create',
                    'touchpoint:read',
                    'touchpoint:update',
                    'touchpoint:delete',
                    'followup:create',
                    'followup:read',
                    'followup:update',
                    'followup:delete',
                    'user:create',
                    'user:read',
                    'user:update',
                    'user:delete',
                    'role:read',
                    'role:update',
                    'report:read',
                    'report:export',
                ],
            },
            {
                name: 'Doctor',
                code: 'DOCTOR',
                description: 'Clinical staff with patient management access',
                isSystem: true,
                permissions: [
                    'menu:dashboard',
                    'menu:patients',
                    'menu:demands',
                    'menu:paths',
                    'menu:touchpoints',
                    'menu:followups',
                    'patient:create',
                    'patient:read',
                    'patient:update',
                    'demand:create',
                    'demand:read',
                    'demand:update',
                    'path:read',
                    'touchpoint:create',
                    'touchpoint:read',
                    'touchpoint:update',
                    'followup:create',
                    'followup:read',
                    'followup:update',
                ],
            },
            {
                name: 'Nurse',
                code: 'NURSE',
                description: 'Nursing staff with limited access',
                isSystem: true,
                permissions: [
                    'menu:dashboard',
                    'menu:patients',
                    'menu:touchpoints',
                    'menu:followups',
                    'patient:read',
                    'patient:update',
                    'touchpoint:create',
                    'touchpoint:read',
                    'touchpoint:update',
                    'followup:read',
                    'followup:update',
                ],
            },
            {
                name: 'Viewer',
                code: 'VIEWER',
                description: 'Read-only access',
                isSystem: true,
                permissions: [
                    'menu:dashboard',
                    'menu:patients',
                    'menu:demands',
                    'menu:paths',
                    'menu:touchpoints',
                    'menu:followups',
                    'patient:read',
                    'demand:read',
                    'path:read',
                    'touchpoint:read',
                    'followup:read',
                    'report:read',
                ],
            },
        ];
        try {
            for (const roleData of defaultRoles) {
                const { permissions: permCodes, ...roleInfo } = roleData;
                const permissionIds = permCodes
                    .map((code) => permissionMap.get(code))
                    .filter((id) => id !== undefined);
                const role = await this.prisma.role.create({
                    data: {
                        ...roleInfo,
                        orgId,
                    },
                });
                if (permissionIds.length > 0) {
                    await this.prisma.rolePermission.createMany({
                        data: permissionIds.map((permissionId) => ({
                            roleId: role.id,
                            permissionId,
                        })),
                    });
                }
                this.logger.log(`Seeded role: ${role.code}`, 'RolesService');
            }
        }
        catch (error) {
            this.logger.error('Failed to seed roles', error instanceof Error ? error.stack : String(error), 'RolesService');
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map