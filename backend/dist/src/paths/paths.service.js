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
exports.PathsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let PathsService = class PathsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('PathsService');
    }
    async create(data, orgId) {
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
    async findAll(orgId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = { orgId };
        if (filters?.status) {
            where.status = filters.status;
        }
        else {
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
    async findById(id) {
        const path = await this.prisma.path.findUnique({
            where: { id },
            include: {
                steps: { orderBy: { stepOrder: 'asc' } },
            },
        });
        if (!path) {
            throw new common_1.NotFoundException('Path template not found');
        }
        return path;
    }
    async update(id, data) {
        await this.findById(id);
        const path = await this.prisma.path.update({
            where: { id },
            data,
        });
        this.logger.log(`Path template updated: ${path.id}`, 'PathsService');
        return path;
    }
    async delete(id) {
        await this.findById(id);
        const path = await this.prisma.path.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
        this.logger.log(`Path template archived: ${path.id}`, 'PathsService');
        return path;
    }
    async duplicate(id, orgId) {
        const original = await this.findById(id);
        const newPath = await this.prisma.path.create({
            data: {
                name: `${original.name} (Copy)`,
                description: original.description,
                orgId,
                status: 'DRAFT',
            },
        });
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
    async addStep(pathId, data) {
        await this.findById(pathId);
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
    async updateStep(pathId, stepId, data) {
        const step = await this.prisma.pathStep.findFirst({
            where: { id: stepId, pathId },
        });
        if (!step) {
            throw new common_1.NotFoundException('Step not found');
        }
        const updated = await this.prisma.pathStep.update({
            where: { id: stepId },
            data,
        });
        this.logger.log(`Step updated: ${stepId}`, 'PathsService');
        return updated;
    }
    async deleteStep(pathId, stepId) {
        const step = await this.prisma.pathStep.findFirst({
            where: { id: stepId, pathId },
        });
        if (!step) {
            throw new common_1.NotFoundException('Step not found');
        }
        await this.prisma.pathStep.delete({ where: { id: stepId } });
        this.logger.log(`Step deleted: ${stepId}`, 'PathsService');
        return step;
    }
    async assignToPatient(pathId, data, orgId) {
        const pathTemplate = await this.prisma.path.findUnique({
            where: { id: pathId },
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
        });
        if (!pathTemplate) {
            throw new common_1.NotFoundException('Path template not found');
        }
        if (pathTemplate.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Path template must be ACTIVE to assign');
        }
        if (pathTemplate.steps.length === 0) {
            throw new common_1.BadRequestException('Path template has no steps');
        }
        const patient = await this.prisma.patient.findUnique({
            where: { id: data.patientId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const demand = await this.prisma.demand.findUnique({
            where: { id: data.demandId },
        });
        if (!demand) {
            throw new common_1.NotFoundException('Demand not found');
        }
        if (demand.patientId !== data.patientId) {
            throw new common_1.BadRequestException('Demand does not belong to patient');
        }
        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        let cumulativeDays = 0;
        const instanceSteps = pathTemplate.steps.map((step, index) => {
            cumulativeDays += step.estimatedDays || 7;
            const dueDate = new Date(startDate);
            dueDate.setDate(dueDate.getDate() + cumulativeDays);
            return {
                stepId: step.id,
                stepOrder: step.stepOrder,
                status: (index === 0 ? 'IN_PROGRESS' : 'PENDING'),
                dueDate,
            };
        });
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
        this.logger.log(`Path assigned to patient: instance=${instance.id}, path=${pathId}, patient=${data.patientId}`, 'PathsService');
        return instance;
    }
    async getInstance(id) {
        const instance = await this.prisma.pathInstance.findUnique({
            where: { id },
            include: {
                path: true,
                patient: { select: { id: true, name: true } },
                steps: { orderBy: { stepOrder: 'asc' } },
            },
        });
        if (!instance) {
            throw new common_1.NotFoundException('Path instance not found');
        }
        return instance;
    }
    async getPatientInstances(patientId) {
        return this.prisma.pathInstance.findMany({
            where: { patientId },
            include: {
                path: { select: { id: true, name: true } },
                steps: { orderBy: { stepOrder: 'asc' } },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
    async getDemandInstances(demandId) {
        return this.prisma.pathInstance.findMany({
            where: { demandId },
            include: {
                path: { select: { id: true, name: true } },
                steps: { orderBy: { stepOrder: 'asc' } },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
    async getInstances(orgId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = { orgId };
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
    async completeStep(instanceId, stepId, data) {
        const instance = await this.prisma.pathInstance.findUnique({
            where: { id: instanceId },
            include: {
                steps: { orderBy: { stepOrder: 'asc' } },
            },
        });
        if (!instance) {
            throw new common_1.NotFoundException('Path instance not found');
        }
        if (instance.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Path instance is not in progress');
        }
        const step = instance.steps.find((s) => s.id === stepId);
        if (!step) {
            throw new common_1.NotFoundException('Step not found in this instance');
        }
        if (step.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Step is not in progress');
        }
        await this.prisma.pathInstanceStep.update({
            where: { id: step.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                notes: data.notes,
            },
        });
        const currentIndex = instance.steps.findIndex((s) => s.id === step.id);
        const nextStep = instance.steps.find((s, idx) => idx > currentIndex && s.status === 'PENDING');
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
        }
        else {
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
    async skipStep(instanceId, stepId, data) {
        const instance = await this.prisma.pathInstance.findUnique({
            where: { id: instanceId },
            include: {
                steps: { orderBy: { stepOrder: 'asc' } },
            },
        });
        if (!instance) {
            throw new common_1.NotFoundException('Path instance not found');
        }
        if (instance.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Path instance is not in progress');
        }
        const step = instance.steps.find((s) => s.id === stepId);
        if (!step) {
            throw new common_1.NotFoundException('Step not found in this instance');
        }
        if (step.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Step is not in progress');
        }
        await this.prisma.pathInstanceStep.update({
            where: { id: step.id },
            data: {
                status: 'SKIPPED',
                completedAt: new Date(),
                notes: data.reason,
            },
        });
        const currentIndex = instance.steps.findIndex((s) => s.id === step.id);
        const nextStep = instance.steps.find((s, idx) => idx > currentIndex && s.status === 'PENDING');
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
        }
        else {
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
    async cancelInstance(id) {
        const instance = await this.prisma.pathInstance.findUnique({
            where: { id },
        });
        if (!instance) {
            throw new common_1.NotFoundException('Path instance not found');
        }
        const updated = await this.prisma.pathInstance.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        this.logger.log(`Path instance cancelled: ${id}`, 'PathsService');
        return updated;
    }
    async detectOverdueSteps() {
        const now = new Date();
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
        for (const step of overdueSteps) {
            await this.prisma.pathInstanceStep.update({
                where: { id: step.id },
                data: { status: 'OVERDUE' },
            });
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
            this.logger.warn(`Overdue step detected: ${step.id} (instance=${step.instanceId})`, 'PathsService');
        }
        return { updated: overdueSteps.length };
    }
};
exports.PathsService = PathsService;
exports.PathsService = PathsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PathsService);
//# sourceMappingURL=paths.service.js.map