import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService implements OnModuleInit {
  private logger = new Logger('OrganizationsService');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedSystemOrganization();
  }

  private async seedSystemOrganization(): Promise<void> {
    const existingOrg = await this.prisma.organization.findUnique({
      where: { code: 'SYSTEM' },
    });

    if (existingOrg) {
      this.logger.log('System organization already exists', 'OrganizationsService');
      return;
    }

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
    } catch (error) {
      this.logger.error('Failed to seed system organization', error instanceof Error ? error.stack : String(error), 'OrganizationsService');
    }
  }

  async findById(id: string): Promise<any> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findByCode(code: string): Promise<any> {
    const org = await this.prisma.organization.findUnique({
      where: { code },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findAll(page = 1, limit = 20): Promise<any> {
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

  async create(data: CreateOrganizationDto): Promise<any> {
    // Check for existing org with same code
    const existing = await this.prisma.organization.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new ConflictException('Organization with this code already exists');
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

  async update(id: string, data: UpdateOrganizationDto): Promise<any> {
    const org = await this.prisma.organization.update({
      where: { id },
      data,
    });

    this.logger.log(`Organization updated: ${org.name}`, 'OrganizationsService');
    return org;
  }

  async delete(id: string): Promise<any> {
    // Soft delete by setting status to INACTIVE
    const org = await this.prisma.organization.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    this.logger.log(`Organization soft-deleted: ${org.name}`, 'OrganizationsService');
    return org;
  }

  async createSuperAdminOrg(_userId: string, userEmail: string): Promise<any> {
    // Create org for super admin on first login
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
}
