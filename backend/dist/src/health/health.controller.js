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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const health_service_1 = require("./health.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    async getHealthArchive(patientId, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.healthService.getHealthArchive(orgId, patientId);
    }
    async getHealthTimeline(patientId, cursor, limit, req) {
        const orgId = req?.user?.orgId || req?.user?.user?.orgId;
        return this.healthService.getHealthTimeline(orgId, patientId, cursor, limit ? parseInt(limit, 10) : 20);
    }
    async createHealthRecord(patientId, createDto, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.healthService.createHealthRecord(orgId, patientId, createDto);
    }
    async getReminders(patientId, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.healthService.getReminders(orgId, patientId);
    }
    async createReminder(createDto, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.healthService.createReminder(orgId, createDto);
    }
    async completeReminder(id, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.healthService.completeReminder(id, orgId);
    }
    async deleteReminder(id, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.healthService.deleteReminder(id, orgId);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)('patients/:patientId/archive'),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealthArchive", null);
__decorate([
    (0, common_1.Get)('patients/:patientId/timeline'),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealthTimeline", null);
__decorate([
    (0, common_1.Post)('patients/:patientId/records'),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "createHealthRecord", null);
__decorate([
    (0, common_1.Get)('patients/:patientId/reminders'),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReminders", null);
__decorate([
    (0, common_1.Post)('reminders'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "createReminder", null);
__decorate([
    (0, common_1.Patch)('reminders/:id/complete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "completeReminder", null);
__decorate([
    (0, common_1.Delete)('reminders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "deleteReminder", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map