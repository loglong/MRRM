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
exports.PatientDemandsController = exports.DemandsController = void 0;
const common_1 = require("@nestjs/common");
const demands_service_1 = require("./demands.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DemandsController = class DemandsController {
    constructor(demandsService) {
        this.demandsService = demandsService;
    }
    async create(createDemandDto, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        const userId = req.user?.sub || req.user?.user?.sub;
        return this.demandsService.create(createDemandDto, orgId, userId);
    }
    async findAll(req, page = '1', limit = '20', status, type, priority, patientId) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        const filters = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            status,
            type,
            priority,
            patientId,
        };
        return this.demandsService.findAll(orgId, filters);
    }
    async getStats(req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.demandsService.getDemandStats(orgId);
    }
    async findOne(id, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.demandsService.findById(id, orgId);
    }
    async update(id, updateDemandDto, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.demandsService.update(id, orgId, updateDemandDto);
    }
    async changeStatus(id, changeStatusDto, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        const userId = req.user?.sub || req.user?.user?.sub;
        return this.demandsService.changeStatus(id, orgId, userId, changeStatusDto);
    }
    async getStatusHistory(id, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.demandsService.getStatusHistory(id, orgId);
    }
};
exports.DemandsController = DemandsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DemandsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('type')),
    __param(5, (0, common_1.Query)('priority')),
    __param(6, (0, common_1.Query)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DemandsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DemandsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DemandsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DemandsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DemandsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DemandsController.prototype, "getStatusHistory", null);
exports.DemandsController = DemandsController = __decorate([
    (0, common_1.Controller)('demands'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [demands_service_1.DemandsService])
], DemandsController);
let PatientDemandsController = class PatientDemandsController {
    constructor(demandsService) {
        this.demandsService = demandsService;
    }
    async getPatientDemands(patientId, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.demandsService.getPatientDemands(patientId, orgId);
    }
};
exports.PatientDemandsController = PatientDemandsController;
__decorate([
    (0, common_1.Get)(':patientId/demands'),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientDemandsController.prototype, "getPatientDemands", null);
exports.PatientDemandsController = PatientDemandsController = __decorate([
    (0, common_1.Controller)('patients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [demands_service_1.DemandsService])
], PatientDemandsController);
//# sourceMappingURL=demands.controller.js.map