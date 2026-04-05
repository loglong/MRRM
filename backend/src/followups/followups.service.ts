import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import { CreateFollowupPlanDto } from './dto/create-followup-plan.dto';
import { CreateFollowupRecordDto } from './dto/create-followup-record.dto';
import { ExecuteFollowupDto } from './dto/execute-followup.dto';
import { FollowupPlanFiltersDto, FollowupRecordFiltersDto } from './dto/followup-filters.dto';

@Injectable()
export class FollowupsService {
  private logger = new Logger('FollowupsService');

  constructor(private prisma: PrismaService) {}

  async createPlan(dto: CreateFollowupPlanDto, orgId: string, userId: string) {
    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Default assignedUserId to patient's assigned user if not provided
    const assignedUserId = dto.assignedUserId || patient.assignedUserId;

    // Verify pathInstanceStepId if provided
    if (dto.pathInstanceStepId) {
      const step = await this.prisma.pathInstanceStep.findUnique({
        where: { id: dto.pathInstanceStepId },
      });
      if (!step) {
        throw new NotFoundException('Path instance step not found');
      }
    }

    // Create the followup plan
    const plan = await this.prisma.followupPlan.create({
      data: {
        patientId: dto.patientId,
        orgId,
        name: dto.name,
        type: dto.type || 'ROUTINE',
        frequencyDays: dto.frequencyDays,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        assignedUserId,
      },
      include: {
        patient: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`FollowupPlan created: ${plan.id} for patient ${dto.patientId}`, 'FollowupsService');

    // Auto-generate followup records based on frequencyDays (FOLLOW-03)
    if (dto.frequencyDays && dto.frequencyDays > 0) {
      await this.generateFollowupRecords(plan, dto.pathInstanceStepId);
    }

    // Return plan with record count
    const recordCount = await this.prisma.followupRecord.count({
      where: { planId: plan.id },
    });

    return {
      ...plan,
      recordCount,
      completedCount: 0,
    };
  }

  async generateFollowupRecords(
    plan: { id: string; patientId: string; orgId: string; frequencyDays: number | null; startDate: Date; endDate: Date | null },
    pathInstanceStepId?: string,
  ) {
    if (!plan.frequencyDays || plan.frequencyDays <= 0) {
      return;
    }

    const frequencyDays = plan.frequencyDays;
    const startDate = new Date(plan.startDate);
    const endDate = plan.endDate ? new Date(plan.endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    const records: Array<{
      planId: string;
      patientId: string;
      orgId: string;
      scheduledAt: Date;
      status: 'PENDING';
      pathInstanceStepId?: string;
    }> = [];

    let currentDate = new Date(startDate);
    let recordCount = 0;
    const maxRecords = 365; // Cap at 365 records

    while (currentDate <= endDate && recordCount < maxRecords) {
      records.push({
        planId: plan.id,
        patientId: plan.patientId,
        orgId: plan.orgId,
        scheduledAt: new Date(currentDate),
        status: 'PENDING',
        pathInstanceStepId,
      });

      currentDate = new Date(currentDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
      recordCount++;
    }

    if (records.length > 0) {
      await this.prisma.followupRecord.createMany({ data: records });
      this.logger.log(`Generated ${records.length} FollowupRecords for plan ${plan.id}`, 'FollowupsService');
    }
  }

  async findPlans(orgId: string, filters: FollowupPlanFiltersDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { orgId };

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.assignedUserId) {
      where.assignedUserId = filters.assignedUserId;
    }

    const [plans, total] = await Promise.all([
      this.prisma.followupPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true } },
          assignedUser: { select: { id: true, name: true } },
          _count: { select: { records: true } },
        },
      }),
      this.prisma.followupPlan.count({ where }),
    ]);

    // Get completion stats for each plan
    const plansWithStats = await Promise.all(
      plans.map(async (plan) => {
        const [totalRecords, completedRecords] = await Promise.all([
          this.prisma.followupRecord.count({ where: { planId: plan.id } }),
          this.prisma.followupRecord.count({ where: { planId: plan.id, status: 'COMPLETED' } }),
        ]);
        return {
          ...plan,
          recordCount: totalRecords,
          completedCount: completedRecords,
        };
      }),
    );

    return {
      data: plansWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPlanById(id: string, orgId: string) {
    const plan = await this.prisma.followupPlan.findFirst({
      where: { id, orgId },
      include: {
        patient: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true } },
        records: {
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('FollowupPlan not found');
    }

    return plan;
  }

  async findRecords(orgId: string, filters: FollowupRecordFiltersDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { orgId };

    // Default: exclude completed/cancelled unless status filter is explicitly provided
    if (!filters.status) {
      where.status = { in: ['PENDING', 'MISSED'] };
    } else {
      where.status = filters.status;
    }

    if (filters.planId) {
      where.planId = filters.planId;
    }
    if (filters.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters.fromDate || filters.toDate) {
      where.scheduledAt = {};
      if (filters.fromDate) {
        where.scheduledAt.gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        where.scheduledAt.lte = new Date(filters.toDate);
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.followupRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          plan: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
        },
      }),
      this.prisma.followupRecord.count({ where }),
    ]);

    return {
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async executeRecord(recordId: string, dto: ExecuteFollowupDto, userId: string, orgId: string) {
    const record = await this.prisma.followupRecord.findFirst({
      where: { id: recordId, orgId },
      include: {
        plan: true,
        patient: true,
      },
    });

    if (!record) {
      throw new NotFoundException('FollowupRecord not found');
    }

    if (record.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING records can be executed');
    }

    // Update the record
    const updatedRecord = await this.prisma.followupRecord.update({
      where: { id: recordId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedById: userId,
        outcome: dto.outcome,
        notes: dto.notes,
      },
      include: {
        plan: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`FollowupRecord executed: ${recordId}`, 'FollowupsService');

    // Auto-create a Touchpoint when followup is completed (FOLLOW-04)
    await this.prisma.touchpoint.create({
      data: {
        patientId: record.patientId,
        orgId: record.orgId,
        type: 'VISIT',
        channel: 'OFFLINE',
        title: `随访完成: ${record.plan.name}`,
        content: dto.notes || dto.outcome || null,
        followupRequired: false,
      },
    });

    this.logger.log(`Auto-created Touchpoint for FollowupRecord ${recordId}`, 'FollowupsService');

    // Check if all records in the plan are completed
    const remainingPending = await this.prisma.followupRecord.count({
      where: { planId: record.planId, status: 'PENDING', id: { not: recordId } },
    });

    if (remainingPending === 0) {
      // All records completed - mark plan as completed
      await this.prisma.followupPlan.update({
        where: { id: record.planId },
        data: { status: 'COMPLETED' },
      });
      this.logger.log(`FollowupPlan ${record.planId} marked as COMPLETED`, 'FollowupsService');
    }

    return updatedRecord;
  }

  async detectOverdueRecords() {
    const now = new Date();

    // Find all PENDING records that are past their scheduledAt
    const overdueRecords = await this.prisma.followupRecord.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lt: now },
      },
      include: {
        plan: {
          include: {
            assignedUser: true,
            patient: true,
          },
        },
      },
    });

    let updatedCount = 0;

    for (const record of overdueRecords) {
      // Mark as MISSED
      await this.prisma.followupRecord.update({
        where: { id: record.id },
        data: { status: 'MISSED' },
      });

      // Create FOLLOWUP_OVERDUE notification (FOLLOW-05)
      if (record.plan.assignedUserId && record.plan.assignedUser) {
        await this.prisma.notification.create({
          data: {
            userId: record.plan.assignedUserId,
            title: '随访逾期提醒',
            message: `患者 ${record.plan.patient.name} 的随访任务已逾期，请及时处理。`,
            type: 'FOLLOWUP_OVERDUE',
            link: `/followups?recordId=${record.id}`,
            orgId: record.orgId,
          },
        });
      }

      updatedCount++;
    }

    return { updated: updatedCount };
  }

  async getCompletionRate(orgId: string, filters?: { startDate?: string; endDate?: string; patientId?: string }) {
    const where: any = { orgId };

    if (filters?.startDate || filters?.endDate) {
      where.scheduledAt = {};
      if (filters.startDate) {
        where.scheduledAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.scheduledAt.lte = new Date(filters.endDate);
      }
    }
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    const [total, completed, missed, pending] = await Promise.all([
      this.prisma.followupRecord.count({ where }),
      this.prisma.followupRecord.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.followupRecord.count({ where: { ...where, status: 'MISSED' } }),
      this.prisma.followupRecord.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Get completion rate by plan
    const plans = await this.prisma.followupPlan.findMany({
      where: { orgId },
      select: { id: true, name: true },
    });

    const byPlan = await Promise.all(
      plans.map(async (plan) => {
        const [planTotal, planCompleted] = await Promise.all([
          this.prisma.followupRecord.count({ where: { ...where, planId: plan.id } }),
          this.prisma.followupRecord.count({ where: { ...where, planId: plan.id, status: 'COMPLETED' } }),
        ]);
        return {
          planId: plan.id,
          planName: plan.name,
          rate: planTotal > 0 ? Math.round((planCompleted / planTotal) * 100) : 0,
        };
      }),
    );

    return {
      total,
      completed,
      missed,
      pending,
      completionRate,
      byPlan,
    };
  }

  async pausePlan(planId: string, orgId: string) {
    const plan = await this.prisma.followupPlan.findFirst({
      where: { id: planId, orgId },
    });

    if (!plan) {
      throw new NotFoundException('FollowupPlan not found');
    }

    if (plan.status !== 'ACTIVE') {
      throw new BadRequestException('Only ACTIVE plans can be paused');
    }

    return this.prisma.followupPlan.update({
      where: { id: planId },
      data: { status: 'PAUSED' },
    });
  }

  async resumePlan(planId: string, orgId: string) {
    const plan = await this.prisma.followupPlan.findFirst({
      where: { id: planId, orgId },
    });

    if (!plan) {
      throw new NotFoundException('FollowupPlan not found');
    }

    if (plan.status !== 'PAUSED') {
      throw new BadRequestException('Only PAUSED plans can be resumed');
    }

    return this.prisma.followupPlan.update({
      where: { id: planId },
      data: { status: 'ACTIVE' },
    });
  }
}
