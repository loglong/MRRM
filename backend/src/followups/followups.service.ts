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

    // Verify pathId if provided (LINK-01)
    if (dto.pathId) {
      const path = await this.prisma.path.findFirst({
        where: { id: dto.pathId, orgId, status: 'ACTIVE' },
      });
      if (!path) {
        throw new NotFoundException('Path template not found or not active');
      }
    }

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
        pathId: dto.pathId || null,  // LINK-01: store path association
      },
      include: {
        patient: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true } },
        path: { select: { id: true, name: true, specialty: true } },
      },
    });

    this.logger.log(`FollowupPlan created: ${plan.id} for patient ${dto.patientId}${dto.pathId ? ` with path ${dto.pathId}` : ''}`, 'FollowupsService');

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
          path: { select: { id: true, name: true, specialty: true } },
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

  // ========================================================================
  // Path-based Follow-up Matching (LINK-01)
  // ========================================================================

  /**
   * Suggest paths for a patient based on their specialty
   * Used for auto-matching patients to appropriate follow-up paths
   */
  async suggestPathsForPatient(patientId: string, orgId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
      include: {
        demands: {
          where: { orgId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Find active path templates matching patient's demands/specialty
    const demandTitles = patient.demands.map(d => d.title);
    const specialty = patient.primarySpecialty;

    const suggestedPaths = await this.prisma.path.findMany({
      where: {
        orgId,
        status: 'ACTIVE',
        OR: [
          // Match by specialty
          specialty ? { specialty } : undefined,
          // Match by disease name in demand titles
          demandTitles.length > 0 ? {
            OR: demandTitles.map(title => ({
              diagnosisName: { contains: title, mode: 'insensitive' as const },
            })),
          } : undefined,
        ].filter(Boolean),
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        specialty: true,
        diagnosisName: true,
        surgeryName: true,
        icd10Code: true,
        icd9Code: true,
        _count: { select: { steps: true } },
      },
    });

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        specialty: patient.primarySpecialty,
      },
      demands: patient.demands.map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
      })),
      suggestedPaths: suggestedPaths.map(p => ({
        ...p,
        stepCount: p._count.steps,
        matchReason: this.getPathMatchReason(p, specialty, demandTitles),
      })),
    };
  }

  private getPathMatchReason(
    path: { diagnosisName: string | null; specialty: string | null },
    patientSpecialty: string | null,
    demandTitles: string[],
  ): string {
    if (patientSpecialty && path.specialty === patientSpecialty) {
      return '匹配患者专科';
    }
    if (path.diagnosisName && demandTitles.some(t => t.includes(path.diagnosisName!))) {
      return '匹配患者需求';
    }
    return '推荐路径';
  }

  /**
   * Get all active path templates for follow-up selection
   */
  async getAvailablePaths(orgId: string, filters?: { specialty?: string; search?: string }) {
    const where: any = {
      orgId,
      status: 'ACTIVE',
    };

    if (filters?.specialty) {
      where.specialty = filters.specialty;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { diagnosisName: { contains: filters.search, mode: 'insensitive' } },
        { surgeryName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const paths = await this.prisma.path.findMany({
      where,
      take: 50,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        specialty: true,
        diagnosisName: true,
        surgeryName: true,
        icd10Code: true,
        icd9Code: true,
        _count: { select: { steps: true } },
      },
    });

    return paths.map(p => ({
      ...p,
      stepCount: p._count.steps,
    }));
  }

  /**
   * Create follow-up plan from path template
   * Generates follow-up records based on path steps
   */
  async createPlanFromPath(
    patientId: string,
    pathId: string,
    dto: {
      name?: string;
      type?: 'ROUTINE' | 'POST_TREATMENT' | 'PRE_APPOINTMENT' | 'CUSTOM';
      frequencyDays?: number;
      startDate: string;
      endDate?: string;
      assignedUserId?: string;
    },
    orgId: string,
    userId: string,
  ) {
    // Verify patient
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Get path template with steps
    const path = await this.prisma.path.findFirst({
      where: { id: pathId, orgId, status: 'ACTIVE' },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    if (!path) {
      throw new NotFoundException('Path template not found or not active');
    }

    // Default assigned user
    const assignedUserId = dto.assignedUserId || patient.assignedUserId;

    // Create follow-up plan
    const plan = await this.prisma.followupPlan.create({
      data: {
        patientId,
        orgId,
        name: dto.name || `${path.name} - 随访计划`,
        type: dto.type || 'POST_TREATMENT',
        frequencyDays: dto.frequencyDays,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        assignedUserId,
        pathId,
      },
      include: {
        patient: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true } },
        path: { select: { id: true, name: true, specialty: true } },
      },
    });

    this.logger.log(`Follow-up plan created from path: ${plan.id} for patient ${patientId}`, 'FollowupsService');

    // Generate follow-up records based on path steps
    if (path.steps.length > 0 && dto.frequencyDays) {
      await this.generateFollowupRecordsFromPath(plan, path.steps, dto.frequencyDays);
    }

    const recordCount = await this.prisma.followupRecord.count({
      where: { planId: plan.id },
    });

    return {
      ...plan,
      recordCount,
      completedCount: 0,
    };
  }

  private async generateFollowupRecordsFromPath(
    plan: { id: string; patientId: string; orgId: string; frequencyDays: number | null; startDate: Date; endDate: Date | null },
    steps: Array<{ id: string; stepOrder: number; estimatedDays: number | null; name: string }>,
    frequencyDays: number,
  ) {
    if (!plan.frequencyDays || plan.frequencyDays <= 0) return;

    const records: Array<{
      planId: string;
      patientId: string;
      orgId: string;
      scheduledAt: Date;
      status: 'PENDING';
      pathInstanceStepId?: string;
    }> = [];

    const startDate = new Date(plan.startDate);
    const endDate = plan.endDate
      ? new Date(plan.endDate)
      : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    let currentDate = new Date(startDate);
    let recordCount = 0;
    const maxRecords = 365;

    while (currentDate <= endDate && recordCount < maxRecords) {
      // Link to first pending step
      const linkedStep = steps.find(s => s.stepOrder === recordCount + 1);

      records.push({
        planId: plan.id,
        patientId: plan.patientId,
        orgId: plan.orgId,
        scheduledAt: new Date(currentDate),
        status: 'PENDING',
        pathInstanceStepId: linkedStep?.id,
      });

      currentDate = new Date(currentDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
      recordCount++;
    }

    if (records.length > 0) {
      await this.prisma.followupRecord.createMany({ data: records });
      this.logger.log(`Generated ${records.length} FollowupRecords from path for plan ${plan.id}`, 'FollowupsService');
    }
  }
}
