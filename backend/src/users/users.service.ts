import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string, orgId?: string): Promise<any> {
    const where: any = { email };
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

  async findById(id: string): Promise<any> {
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
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(orgId: string, page = 1, limit = 20): Promise<any> {
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

  async create(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    orgId: string;
  }): Promise<any> {
    // Check for existing user
    const existing = await this.findByEmail(data.email, data.orgId);
    if (existing) {
      throw new ConflictException('User with this email already exists');
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

  async createFromSSO(data: {
    email: string;
    name: string;
    orgId: string;
  }): Promise<any> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        orgId: data.orgId,
        // No password for SSO users
      },
      include: {
        organization: true,
      },
    });

    this.logger.log(`SSO user created: ${user.email}`, 'UsersService');
    return user;
  }

  async update(id: string, data: any): Promise<any> {
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

  async incrementFailedLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: { increment: 1 },
        lockedUntil: undefined, // Will be set if needed
      },
    });

    // Lock account after 5 failed attempts
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user && user.failedLoginAttempts >= 4) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + 30); // Lock for 30 minutes
      await this.prisma.user.update({
        where: { id },
        data: { lockedUntil },
      });
    }
  }

  async resetFailedLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    // Remove existing roles
    await this.prisma.userRole.deleteMany({ where: { userId } });

    // Add new roles
    await this.prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
    });

    this.logger.log(`Roles assigned to user ${userId}`, 'UsersService');
  }
}
