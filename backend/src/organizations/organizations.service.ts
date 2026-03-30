import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';

@Injectable()
export class OrganizationsService {
  private logger = new Logger('OrganizationsService');

  constructor(private prisma: PrismaService) {}

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

  async create(data: {
    name: string;
    code: string;
    domain?: string;
    metadata?: any;
  }): Promise<any> {
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

  async update(id: string, data: any): Promise<any> {
    const org = await this.prisma.organization.update({
      where: { id },
      data,
    });

    this.logger.log(`Organization updated: ${org.name}`, 'OrganizationsService');
    return org;
  }
}
