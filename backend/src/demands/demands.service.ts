import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import { CreateDemandDtoType } from './dto/create-demand.dto';
import { UpdateDemandDtoType } from './dto/update-demand.dto';
import { ChangeStatusDemandDtoType } from './dto/change-status-demand.dto';
import { FilterDemandDtoType } from './dto/filter-demand.dto';

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED', 'LOST'],
  IN_PROGRESS: ['PENDING', 'FULFILLED', 'CANCELLED', 'LOST'],
  PENDING: ['FULFILLED', 'CANCELLED', 'LOST'],
  FULFILLED: [],
  CANCELLED: [],
  LOST: [],
};

// Terminal statuses
const TERMINAL_STATUSES = ['FULFILLED', 'CANCELLED', 'LOST'];

@Injectable()
export class DemandsService {
  private logger = new Logger('DemandsService');

  constructor(private prisma: PrismaService) {}

  async create(data: CreateDemandDtoType, orgId: string, userId: string): Promise<any> {
    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: data.patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const demand = await this.prisma.demand.create({
      data: {
        patientId: data.patientId,
        orgId,
        type: data.type,
        source: data.source || 'WALK_IN',
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: 'OPEN',
        estimatedAmount: data.estimatedAmount,
      },
    });

    // Create initial status history record
    await this.prisma.demandStatusHistory.create({
      data: {
        demandId: demand.id,
        fromStatus: null,
        toStatus: 'OPEN',
        changedBy: userId,
        notes: null,
      },
    });

    this.logger.log(`Demand created: ${demand.id} for patient ${patient.name}`, 'DemandsService');

    return this.findById(demand.id, orgId);
  }

  async findAll(orgId: string, filters?: FilterDemandDtoType): Promise<any> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { orgId };

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.source) {
      where.source = filters.source;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [demands, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    return {
      data: demands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, orgId: string): Promise<any> {
    const demand = await this.prisma.demand.findFirst({
      where: { id, orgId },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            // Note: We don't have a User relation on DemandStatusHistory directly
            // changedBy is stored as string userId
          },
        },
      },
    });

    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    return demand;
  }

  async update(id: string, orgId: string, data: UpdateDemandDtoType): Promise<any> {
    // Check demand exists
    const existing = await this.prisma.demand.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      throw new NotFoundException('Demand not found');
    }

    // Cannot update terminal demands
    if (TERMINAL_STATUSES.includes(existing.status)) {
      throw new BadRequestException('Cannot update demand with terminal status');
    }

    const demand = await this.prisma.demand.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        source: data.source,
        estimatedAmount: data.estimatedAmount,
        actualAmount: data.actualAmount,
        closeReason: data.closeReason,
      },
    });

    this.logger.log(`Demand updated: ${demand.id}`, 'DemandsService');
    return this.findById(id, orgId);
  }

  async changeStatus(
    id: string,
    orgId: string,
    userId: string,
    data: ChangeStatusDemandDtoType,
  ): Promise<any> {
    const existing = await this.prisma.demand.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      throw new NotFoundException('Demand not found');
    }

    const { status: newStatus, notes } = data;

    // Validate transition
    const validNextStatuses = VALID_TRANSITIONS[existing.status];
    if (!validNextStatuses || !validNextStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${existing.status} to ${newStatus}`,
      );
    }

    // Update demand status
    const updateData: any = { status: newStatus };

    // Set closedAt for terminal statuses
    if (TERMINAL_STATUSES.includes(newStatus)) {
      updateData.closedAt = new Date();
    }

    const demand = await this.prisma.demand.update({
      where: { id },
      data: updateData,
    });

    // Create history record
    await this.prisma.demandStatusHistory.create({
      data: {
        demandId: id,
        fromStatus: existing.status,
        toStatus: newStatus,
        changedBy: userId,
        notes: notes || null,
      },
    });

    this.logger.log(
      `Demand ${id} status changed: ${existing.status} -> ${newStatus}`,
      'DemandsService',
    );

    return this.findById(id, orgId);
  }

  async getStatusHistory(demandId: string, orgId: string): Promise<any[]> {
    // Verify demand belongs to org
    const demand = await this.prisma.demand.findFirst({
      where: { id: demandId, orgId },
    });

    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    return this.prisma.demandStatusHistory.findMany({
      where: { demandId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPatientDemands(patientId: string, orgId: string): Promise<any[]> {
    // Verify patient belongs to org
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.demand.findMany({
      where: { patientId, orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
  }

  async getDemandStats(orgId: string): Promise<any> {
    const [total, byStatus, byType, byPriority] = await Promise.all([
      this.prisma.demand.count({ where: { orgId } }),
      this.prisma.demand.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true,
      }),
      this.prisma.demand.groupBy({
        by: ['type'],
        where: { orgId },
        _count: true,
      }),
      this.prisma.demand.groupBy({
        by: ['priority'],
        where: { orgId },
        _count: true,
      }),
    ]);

    const byStatusMap: any = {
      OPEN: 0,
      IN_PROGRESS: 0,
      PENDING: 0,
      FULFILLED: 0,
      CANCELLED: 0,
      LOST: 0,
    };
    byStatus.forEach((s) => {
      byStatusMap[s.status] = s._count;
    });

    const byTypeMap: any = {};
    byType.forEach((t) => {
      byTypeMap[t.type] = t._count;
    });

    const byPriorityMap: any = {};
    byPriority.forEach((p) => {
      byPriorityMap[p.priority] = p._count;
    });

    return {
      total,
      byStatus: byStatusMap,
      byType: byTypeMap,
      byPriority: byPriorityMap,
    };
  }
}
