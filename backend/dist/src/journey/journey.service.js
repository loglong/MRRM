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
exports.JourneyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let JourneyService = class JourneyService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('JourneyService');
    }
    async getPatientJourney(patientId, orgId, page = 1, limit = 50) {
        const patient = await this.prisma.patient.findFirst({
            where: { id: patientId, orgId, deletedAt: null },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const [touchpoints, demands, pathInstances, followupRecords, journeyMilestones] = await Promise.all([
            this.prisma.touchpoint.findMany({
                where: { patientId, orgId, voidedAt: null },
                select: {
                    id: true,
                    type: true,
                    channel: true,
                    title: true,
                    sentiment: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.demand.findMany({
                where: { patientId, orgId },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.pathInstance.findMany({
                where: { patientId, orgId },
                include: {
                    path: { select: { id: true, name: true } },
                    steps: {
                        orderBy: { stepOrder: 'asc' },
                        select: {
                            id: true,
                            stepOrder: true,
                            status: true,
                            dueDate: true,
                            completedAt: true,
                            step: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { startedAt: 'asc' },
            }),
            this.prisma.followupRecord.findMany({
                where: { patientId, orgId },
                select: {
                    id: true,
                    status: true,
                    scheduledAt: true,
                    completedAt: true,
                    plan: { select: { id: true, name: true } },
                },
                orderBy: { scheduledAt: 'asc' },
            }),
            this.prisma.journeyMilestone.findMany({
                where: { patientId, orgId },
                select: {
                    id: true,
                    milestone: true,
                    category: true,
                    description: true,
                    occurredAt: true,
                },
                orderBy: { occurredAt: 'asc' },
            }),
        ]);
        const events = [];
        touchpoints.forEach((tp) => {
            events.push({
                id: tp.id,
                type: 'TOUCHPOINT',
                title: tp.title,
                subType: tp.channel,
                sentiment: tp.sentiment || undefined,
                status: tp.type,
                occurredAt: tp.createdAt,
                metadata: { channel: tp.channel },
            });
        });
        demands.forEach((d) => {
            events.push({
                id: d.id,
                type: 'DEMAND',
                title: d.title,
                subType: d.type,
                status: d.status,
                occurredAt: d.createdAt,
                metadata: { demandType: d.type },
            });
        });
        pathInstances.forEach((pi) => {
            events.push({
                id: `${pi.id}-start`,
                type: 'PATH_START',
                title: `Started path: ${pi.path.name}`,
                subType: pi.path.name,
                status: pi.status,
                occurredAt: pi.startedAt,
                metadata: { pathId: pi.path.id, pathInstanceId: pi.id },
            });
            pi.steps.forEach((step) => {
                events.push({
                    id: step.id,
                    type: 'PATH_STEP',
                    title: step.step.name,
                    subType: `Step ${step.stepOrder}`,
                    status: step.status,
                    occurredAt: step.completedAt || step.dueDate,
                    metadata: {
                        stepId: step.step.id,
                        stepOrder: step.stepOrder,
                        pathInstanceId: pi.id,
                    },
                });
            });
            if (pi.completedAt) {
                events.push({
                    id: `${pi.id}-end`,
                    type: 'PATH_END',
                    title: `Completed path: ${pi.path.name}`,
                    subType: pi.path.name,
                    status: pi.status,
                    occurredAt: pi.completedAt,
                    metadata: { pathId: pi.path.id, pathInstanceId: pi.id },
                });
            }
        });
        followupRecords.forEach((fr) => {
            events.push({
                id: fr.id,
                type: 'FOLLOWUP',
                title: fr.plan.name,
                subType: fr.status,
                status: fr.status,
                occurredAt: fr.completedAt || fr.scheduledAt,
                metadata: { planId: fr.plan.id },
            });
        });
        journeyMilestones.forEach((jm) => {
            events.push({
                id: jm.id,
                type: 'MILESTONE',
                title: jm.milestone,
                subType: jm.category,
                status: jm.category,
                occurredAt: jm.occurredAt,
                metadata: { description: jm.description },
            });
        });
        events.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
        const total = events.length;
        const skip = (page - 1) * limit;
        const paginatedEvents = events.slice(skip, skip + limit);
        this.logger.log(`Retrieved ${total} events for patient ${patientId} (page ${page}, limit ${limit})`, 'JourneyService');
        return {
            events: paginatedEvents,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.JourneyService = JourneyService;
exports.JourneyService = JourneyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JourneyService);
//# sourceMappingURL=journey.service.js.map