import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';

export interface AuditLogDto {
  userId?: string;
  orgId: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestBody?: any;
  responseStatus?: number;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  private logger = new Logger('AuditService');

  constructor(private prisma: PrismaService) {}

  async log(dto: AuditLogDto): Promise<void> {
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
    } catch (error) {
      // Don't let audit logging failures break the app
      this.logger.error('Failed to write audit log', error instanceof Error ? error.stack : String(error), 'AuditService');
    }
  }

  async findAll(
    orgId: string,
    page = 1,
    limit = 50,
    filters: Record<string, unknown> = {},
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const where = { orgId, ...filters } as any;

    // Validate date range (max 90 days)
    const createdAtFilter = where.createdAt as { gte?: Date; lte?: Date } | undefined;
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

  async findByOrg(orgId: string, page = 1, limit = 50): Promise<any> {
    return this.findAll(orgId, page, limit);
  }

  async findByEntity(entityType: string, entityId: string, orgId: string): Promise<any[]> {
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

  async getLogsForExport(orgId: string, startDate: Date, endDate: Date): Promise<any[]> {
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
      take: 10000, // Safety limit for exports
    });
  }
}
