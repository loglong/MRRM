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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('UsersService');
    }
    async findByEmail(email, orgId) {
        const where = { email };
        if (orgId) {
            where.orgId = orgId;
        }
        return this.prisma.user.findFirst({
            where,
            include: {
                roles: {
                    include: { role: true },
                },
                organization: true,
            },
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: { role: true },
                },
                organization: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findAll(orgId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { orgId },
                skip,
                take: limit,
                include: {
                    roles: { include: { role: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { orgId } }),
        ]);
        return {
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async create(data) {
        const existing = await this.findByEmail(data.email, data.orgId);
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                name: data.name,
                phone: data.phone,
                orgId: data.orgId,
            },
            include: {
                organization: true,
            },
        });
        this.logger.log(`User created: ${user.email}`, 'UsersService');
        return user;
    }
    async createFromSSO(data) {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                orgId: data.orgId,
            },
            include: {
                organization: true,
            },
        });
        this.logger.log(`SSO user created: ${user.email}`, 'UsersService');
        return user;
    }
    async update(id, data) {
        const user = await this.prisma.user.update({
            where: { id },
            data,
            include: {
                organization: true,
            },
        });
        this.logger.log(`User updated: ${user.email}`, 'UsersService');
        return user;
    }
    async incrementFailedLogin(id) {
        await this.prisma.user.update({
            where: { id },
            data: {
                failedLoginAttempts: { increment: 1 },
            },
        });
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (user && user.failedLoginAttempts >= 5) {
            const lockedUntil = new Date();
            lockedUntil.setMinutes(lockedUntil.getMinutes() + 30);
            await this.prisma.user.update({
                where: { id },
                data: { lockedUntil },
            });
        }
    }
    async resetFailedLogin(id) {
        await this.prisma.user.update({
            where: { id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
    }
    async assignRoles(userId, roleIds) {
        await this.prisma.userRole.deleteMany({ where: { userId } });
        await this.prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({ userId, roleId })),
        });
        this.logger.log(`Roles assigned to user ${userId}`, 'UsersService');
    }
    async delete(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const deletedUser = await this.prisma.user.update({
            where: { id },
            data: { status: 'INACTIVE' },
            include: { organization: true },
        });
        this.logger.log(`User soft-deleted: ${user.email}`, 'UsersService');
        return deletedUser;
    }
    async changeStatus(id, status) {
        const user = await this.prisma.user.update({
            where: { id },
            data: { status },
            include: { organization: true },
        });
        this.logger.log(`User status changed: ${user.email} -> ${status}`, 'UsersService');
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map