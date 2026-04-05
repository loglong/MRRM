import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';
import { CreatePathDtoType } from './dto/create-path.dto';
import { UpdatePathDtoType } from './dto/update-path.dto';
import { CreatePathStepDtoType } from './dto/create-path-step.dto';
import { AssignPathDtoType } from './dto/assign-path.dto';
import { CompleteStepDtoType, SkipStepDtoType } from './dto/complete-step.dto';

@Injectable()
export class PathsService {
  private logger = new Logger('PathsService');

  constructor(private prisma: PrismaService) {}

  // ========================================================================
  // Path Template CRUD
  // ========================================================================

  async create(data: CreatePathDtoType, orgId: string) {
    const path = await this.prisma.path.create({
      data: {
        ...data,
        orgId,
        status: data.status || 'DRAFT',
      },
    });
    this.logger.log(`Path template created: ${path.id} (${path.name})`, 'PathsService');
    return path;
  }

  async findAll(
    orgId: string,
    page = 1,
    limit = 20,
    filters?: { status?: string; search?: string },
  ) {
    const skip = (page - 1) * limit;
    const where: any = { orgId };

    if (filters?.status) {
      where.status = filters.status;
    } else {
      // Exclude archived templates by default
      where.status = { not: 'ARCHIVED' };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [paths, total] = await Promise.all([
      this.prisma.path.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { steps: true } },
        },
      }),
      this.prisma.path.count({ where }),
    ]);

    return {
      data: paths.map((p) => ({
        ...p,
        stepCount: p._count.steps,
        _count: undefined,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const path = await this.prisma.path.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
      },
    });

    if (!path) {
      throw new NotFoundException('Path template not found');
    }

    return path;
  }

  async update(id: string, data: UpdatePathDtoType) {
    await this.findById(id); // Verify exists

    const path = await this.prisma.path.update({
      where: { id },
      data,
    });

    this.logger.log(`Path template updated: ${path.id}`, 'PathsService');
    return path;
  }

  async delete(id: string) {
    await this.findById(id); // Verify exists

    // Soft delete - just mark as archived
    const path = await this.prisma.path.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    this.logger.log(`Path template archived: ${path.id}`, 'PathsService');
    return path;
  }

  async duplicate(id: string, orgId: string) {
    const original = await this.findById(id);

    const newPath = await this.prisma.path.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        orgId,
        status: 'DRAFT',
      },
    });

    // Duplicate all steps
    for (const step of original.steps) {
      await this.prisma.pathStep.create({
        data: {
          pathId: newPath.id,
          name: step.name,
          description: step.description,
          stepOrder: step.stepOrder,
          stepType: step.stepType,
          estimatedDays: step.estimatedDays,
          timeoutHours: step.timeoutHours,
          triggerAction: step.triggerAction,
          notificationTemplate: step.notificationTemplate,
        },
      });
    }

    this.logger.log(`Path template duplicated: ${id} -> ${newPath.id}`, 'PathsService');
    return this.findById(newPath.id);
  }

  // ========================================================================
  // Path Step Management
  // ========================================================================

  async addStep(pathId: string, data: CreatePathStepDtoType) {
    await this.findById(pathId); // Verify path exists

    const step = await this.prisma.pathStep.create({
      data: {
        pathId,
        ...data,
        stepType: data.stepType || 'TASK',
      },
    });

    this.logger.log(`Step added to path ${pathId}: ${step.id}`, 'PathsService');
    return step;
  }

  async updateStep(pathId: string, stepId: string, data: Partial<CreatePathStepDtoType>) {
    // Verify step exists and belongs to path
    const step = await this.prisma.pathStep.findFirst({
      where: { id: stepId, pathId },
    });

    if (!step) {
      throw new NotFoundException('Step not found');
    }

    const updated = await this.prisma.pathStep.update({
      where: { id: stepId },
      data,
    });

    this.logger.log(`Step updated: ${stepId}`, 'PathsService');
    return updated;
  }

  async deleteStep(pathId: string, stepId: string) {
    const step = await this.prisma.pathStep.findFirst({
      where: { id: stepId, pathId },
    });

    if (!step) {
      throw new NotFoundException('Step not found');
    }

    await this.prisma.pathStep.delete({ where: { id: stepId } });
    this.logger.log(`Step deleted: ${stepId}`, 'PathsService');
    return step;
  }

  // ========================================================================
  // Path Instance (Assignment to Patient)
  // ========================================================================

  async assignToPatient(pathId: string, data: AssignPathDtoType, orgId: string) {
    // Verify path template exists and is ACTIVE
    const pathTemplate = await this.prisma.path.findUnique({
      where: { id: pathId },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });

    if (!pathTemplate) {
      throw new NotFoundException('Path template not found');
    }

    if (pathTemplate.status !== 'ACTIVE') {
      throw new BadRequestException('Path template must be ACTIVE to assign');
    }

    if (pathTemplate.steps.length === 0) {
      throw new BadRequestException('Path template has no steps');
    }

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: data.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify demand exists and belongs to patient
    const demand = await this.prisma.demand.findUnique({
      where: { id: data.demandId },
    });

    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    if (demand.patientId !== data.patientId) {
      throw new BadRequestException('Demand does not belong to patient');
    }

    const startDate = data.startDate ? new Date(data.startDate) : new Date();

    // Calculate cumulative due dates
    let cumulativeDays = 0;
    const instanceSteps = pathTemplate.steps.map((step, index) => {
      cumulativeDays += step.estimatedDays || 7;
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + cumulativeDays);

      return {
        stepId: step.id,
        stepOrder: step.stepOrder,
        status: (index === 0 ? 'IN_PROGRESS' : 'PENDING') as 'IN_PROGRESS' | 'PENDING',
        dueDate,
      };
    });

    // Create path instance with steps
    const instance = await this.prisma.pathInstance.create({
      data: {
        pathId,
        patientId: data.patientId,
        demandId: data.demandId,
        orgId,
        status: 'IN_PROGRESS',
        currentStep: 1,
        steps: {
          createMany: { data: instanceSteps },
        },
      },
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
      },
    });

    this.logger.log(
      `Path assigned to patient: instance=${instance.id}, path=${pathId}, patient=${data.patientId}`,
      'PathsService',
    );

    return instance;
  }

  async getInstance(id: string) {
    const instance = await this.prisma.pathInstance.findUnique({
      where: { id },
      include: {
        path: true,
        patient: { select: { id: true, name: true } },
        steps: { orderBy: { stepOrder: 'asc' } },
      },
    });

    if (!instance) {
      throw new NotFoundException('Path instance not found');
    }

    return instance;
  }

  async getPatientInstances(patientId: string) {
    return this.prisma.pathInstance.findMany({
      where: { patientId },
      include: {
        path: { select: { id: true, name: true } },
        steps: { orderBy: { stepOrder: 'asc' } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getDemandInstances(demandId: string) {
    return this.prisma.pathInstance.findMany({
      where: { demandId },
      include: {
        path: { select: { id: true, name: true } },
        steps: { orderBy: { stepOrder: 'asc' } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getInstances(
    orgId: string,
    page = 1,
    limit = 20,
    filters?: { patientId?: string; demandId?: string; status?: string },
  ) {
    const skip = (page - 1) * limit;
    const where: any = { orgId };

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.demandId) {
      where.demandId = filters.demandId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const [instances, total] = await Promise.all([
      this.prisma.pathInstance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          path: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
        },
      }),
      this.prisma.pathInstance.count({ where }),
    ]);

    return {
      data: instances,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async completeStep(instanceId: string, stepId: string, data: CompleteStepDtoType) {
    const instance = await this.prisma.pathInstance.findUnique({
      where: { id: instanceId },
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
      },
    });

    if (!instance) {
      throw new NotFoundException('Path instance not found');
    }

    if (instance.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Path instance is not in progress');
    }

    const step = instance.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new NotFoundException('Step not found in this instance');
    }

    if (step.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Step is not in progress');
    }

    // Mark step as completed
    await this.prisma.pathInstanceStep.update({
      where: { id: step.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        notes: data.notes,
      },
    });

    // Find and advance to next step
    const currentIndex = instance.steps.findIndex((s) => s.id === step.id);
    const nextStep = instance.steps.find(
      (s, idx) => idx > currentIndex && s.status === 'PENDING',
    );

    if (nextStep) {
      const now = new Date();
      // Check if next step is already overdue
      const nextStatus = nextStep.dueDate < now ? 'OVERDUE' : 'IN_PROGRESS';
      await this.prisma.pathInstanceStep.update({
        where: { id: nextStep.id },
        data: { status: nextStatus },
      });

      await this.prisma.pathInstance.update({
        where: { id: instanceId },
        data: { currentStep: nextStep.stepOrder },
      });
    } else {
      // All steps completed
      await this.prisma.pathInstance.update({
        where: { id: instanceId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    this.logger.log(`Step completed: instance=${instanceId}, step=${stepId}`, 'PathsService');
    return this.getInstance(instanceId);
  }

  async skipStep(instanceId: string, stepId: string, data: SkipStepDtoType) {
    const instance = await this.prisma.pathInstance.findUnique({
      where: { id: instanceId },
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
      },
    });

    if (!instance) {
      throw new NotFoundException('Path instance not found');
    }

    if (instance.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Path instance is not in progress');
    }

    const step = instance.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new NotFoundException('Step not found in this instance');
    }

    if (step.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Step is not in progress');
    }

    // Mark step as skipped
    await this.prisma.pathInstanceStep.update({
      where: { id: step.id },
      data: {
        status: 'SKIPPED',
        completedAt: new Date(),
        notes: data.reason,
      },
    });

    // Find and advance to next step
    const currentIndex = instance.steps.findIndex((s) => s.id === step.id);
    const nextStep = instance.steps.find(
      (s, idx) => idx > currentIndex && s.status === 'PENDING',
    );

    if (nextStep) {
      const now = new Date();
      const nextStatus = nextStep.dueDate < now ? 'OVERDUE' : 'IN_PROGRESS';
      await this.prisma.pathInstanceStep.update({
        where: { id: nextStep.id },
        data: { status: nextStatus },
      });

      await this.prisma.pathInstance.update({
        where: { id: instanceId },
        data: { currentStep: nextStep.stepOrder },
      });
    } else {
      await this.prisma.pathInstance.update({
        where: { id: instanceId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    this.logger.log(`Step skipped: instance=${instanceId}, step=${stepId}`, 'PathsService');
    return this.getInstance(instanceId);
  }

  async cancelInstance(id: string) {
    const instance = await this.prisma.pathInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      throw new NotFoundException('Path instance not found');
    }

    const updated = await this.prisma.pathInstance.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Path instance cancelled: ${id}`, 'PathsService');
    return updated;
  }

  // ========================================================================
  // Overdue Detection (for cron job)
  // ========================================================================

  async detectOverdueSteps() {
    const now = new Date();

    // Find all pending/in_progress steps that are past due
    const overdueSteps = await this.prisma.pathInstanceStep.findMany({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: now },
        instance: { status: 'IN_PROGRESS' },
      },
      include: {
        instance: { include: { path: true } },
        step: true,
      },
    });

    if (overdueSteps.length === 0) {
      return { updated: 0 };
    }

    // Update each overdue step and create notifications
    for (const step of overdueSteps) {
      await this.prisma.pathInstanceStep.update({
        where: { id: step.id },
        data: { status: 'OVERDUE' },
      });

      // Find user responsible for this step (via step's triggerAction or path owner)
      // For now, we'll use a simplified approach - notify the assigned user or org admin
      const patient = await this.prisma.patient.findUnique({
        where: { id: step.instance.patientId },
        include: { assignedUser: true },
      });

      if (patient?.assignedUser) {
        await this.prisma.notification.create({
          data: {
            userId: patient.assignedUser.id,
            title: 'Path Step Overdue',
            message: `Step "${step.step.name}" in path "${step.instance.path?.name || 'Unknown'}" is overdue for patient ${patient.name}`,
            type: 'PATH_OVERDUE',
            link: `/path-instances/${step.instance.id}`,
            orgId: step.instance.orgId,
          },
        });
      }

      this.logger.warn(
        `Overdue step detected: ${step.id} (instance=${step.instanceId})`,
        'PathsService',
      );
    }

    return { updated: overdueSteps.length };
  }
}
