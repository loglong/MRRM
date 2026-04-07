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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_1 = require("../common/logger");
let HealthService = class HealthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('HealthService');
    }
    formatHealthRecord(record) {
        return {
            id: record.id,
            patientId: record.patientId,
            orgId: record.orgId,
            category: record.category,
            title: record.title,
            description: record.description,
            recordDate: record.recordDate.toISOString(),
            data: record.data,
            source: record.source,
            createdAt: record.createdAt.toISOString(),
        };
    }
    formatHealthReminder(reminder) {
        return {
            id: reminder.id,
            patientId: reminder.patientId,
            orgId: reminder.orgId,
            type: reminder.type,
            title: reminder.title,
            content: reminder.content,
            remindAt: reminder.remindAt.toISOString(),
            status: reminder.status,
            createdAt: reminder.createdAt.toISOString(),
            updatedAt: reminder.updatedAt.toISOString(),
        };
    }
    async getHealthArchive(orgId, patientId) {
        const records = await this.prisma.healthRecord.findMany({
            where: { orgId, patientId },
            orderBy: { recordDate: 'desc' },
        });
        const formatted = records.map((r) => this.formatHealthRecord(r));
        return {
            allergies: formatted.filter((r) => r.category === 'ALLERGY'),
            pastHistory: formatted.filter((r) => r.category === 'PAST_HISTORY'),
            examResults: formatted.filter((r) => r.category === 'EXAM_RESULT').slice(0, 10),
        };
    }
    async getHealthTimeline(orgId, patientId, cursor, limit = 20) {
        const where = { orgId, patientId };
        if (cursor) {
            const cursorRecord = await this.prisma.healthRecord.findUnique({
                where: { id: cursor },
            });
            if (cursorRecord) {
                where.recordDate = { lt: cursorRecord.recordDate };
            }
        }
        const records = await this.prisma.healthRecord.findMany({
            where,
            take: limit + 1,
            orderBy: { recordDate: 'desc' },
        });
        const hasMore = records.length > limit;
        const data = hasMore ? records.slice(0, limit) : records;
        const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : undefined;
        return {
            data: data.map((r) => this.formatHealthRecord(r)),
            nextCursor,
        };
    }
    async createHealthRecord(orgId, patientId, data) {
        const record = await this.prisma.healthRecord.create({
            data: {
                patientId,
                orgId,
                category: data.category,
                title: data.title,
                description: data.description,
                recordDate: new Date(data.recordDate),
                data: data.data,
                source: data.source || 'manual',
            },
        });
        this.logger.log(`Health record created: ${record.id} for patient ${record.patientId}`, 'HealthService');
        return this.formatHealthRecord(record);
    }
    async getReminders(orgId, patientId) {
        const reminders = await this.prisma.healthReminder.findMany({
            where: {
                orgId,
                patientId,
                remindAt: { gte: new Date() },
                status: 'PENDING',
            },
            orderBy: { remindAt: 'asc' },
        });
        return reminders.map((r) => this.formatHealthReminder(r));
    }
    async createReminder(orgId, data) {
        const reminder = await this.prisma.healthReminder.create({
            data: {
                patientId: data.patientId,
                orgId,
                type: data.type,
                title: data.title,
                content: data.content,
                remindAt: new Date(data.remindAt),
            },
        });
        this.logger.log(`Health reminder created: ${reminder.id} for patient ${reminder.patientId}`, 'HealthService');
        return this.formatHealthReminder(reminder);
    }
    async completeReminder(id, orgId) {
        const reminder = await this.prisma.healthReminder.findFirst({
            where: { id, orgId },
        });
        if (!reminder) {
            throw new common_1.NotFoundException('Reminder not found');
        }
        const updated = await this.prisma.healthReminder.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
        this.logger.log(`Health reminder completed: ${id}`, 'HealthService');
        return this.formatHealthReminder(updated);
    }
    async deleteReminder(id, orgId) {
        const reminder = await this.prisma.healthReminder.findFirst({
            where: { id, orgId, status: 'PENDING' },
        });
        if (!reminder) {
            throw new common_1.NotFoundException('Reminder not found or not cancellable');
        }
        await this.prisma.healthReminder.delete({
            where: { id },
        });
        this.logger.log(`Health reminder deleted: ${id}`, 'HealthService');
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthService);
//# sourceMappingURL=health.service.js.map