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
exports.PathsController = void 0;
const common_1 = require("@nestjs/common");
const paths_service_1 = require("./paths.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PathsController = class PathsController {
    constructor(pathsService) {
        this.pathsService = pathsService;
    }
    async create(data, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.pathsService.create(data, orgId);
    }
    async findAll(req, page = '1', limit = '20', status, search) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.pathsService.findAll(orgId, parseInt(page, 10), parseInt(limit, 10), {
            status,
            search,
        });
    }
    async findOne(id) {
        return this.pathsService.findById(id);
    }
    async update(id, data) {
        return this.pathsService.update(id, data);
    }
    async remove(id) {
        return this.pathsService.delete(id);
    }
    async duplicate(id, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.pathsService.duplicate(id, orgId);
    }
    async addStep(id, data) {
        return this.pathsService.addStep(id, data);
    }
    async updateStep(id, stepId, data) {
        return this.pathsService.updateStep(id, stepId, data);
    }
    async deleteStep(id, stepId) {
        return this.pathsService.deleteStep(id, stepId);
    }
    async assignToPatient(id, data, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.pathsService.assignToPatient(id, data, orgId);
    }
    async getInstances(req, page = '1', limit = '20', patientId, demandId, status) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.pathsService.getInstances(orgId, parseInt(page, 10), parseInt(limit, 10), {
            patientId,
            demandId,
            status,
        });
    }
    async getInstance(id) {
        return this.pathsService.getInstance(id);
    }
    async completeStep(id, stepId, data) {
        return this.pathsService.completeStep(id, stepId, data);
    }
    async skipStep(id, stepId, data) {
        return this.pathsService.skipStep(id, stepId, data);
    }
    async cancelInstance(id) {
        return this.pathsService.cancelInstance(id);
    }
    async getPatientInstances(patientId) {
        return this.pathsService.getPatientInstances(patientId);
    }
    async getDemandInstances(demandId) {
        return this.pathsService.getDemandInstances(demandId);
    }
};
exports.PathsController = PathsController;
__decorate([
    (0, common_1.Post)('path-templates'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('path-templates'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('path-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('path-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('path-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('path-templates/:id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Post)('path-templates/:id/steps'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "addStep", null);
__decorate([
    (0, common_1.Put)('path-templates/:id/steps/:stepId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "updateStep", null);
__decorate([
    (0, common_1.Delete)('path-templates/:id/steps/:stepId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "deleteStep", null);
__decorate([
    (0, common_1.Post)('path-templates/:id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "assignToPatient", null);
__decorate([
    (0, common_1.Get)('path-instances'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('patientId')),
    __param(4, (0, common_1.Query)('demandId')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "getInstances", null);
__decorate([
    (0, common_1.Get)('path-instances/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "getInstance", null);
__decorate([
    (0, common_1.Put)('path-instances/:id/steps/:stepId/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "completeStep", null);
__decorate([
    (0, common_1.Put)('path-instances/:id/steps/:stepId/skip'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "skipStep", null);
__decorate([
    (0, common_1.Put)('path-instances/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "cancelInstance", null);
__decorate([
    (0, common_1.Get)('patients/:patientId/path-instances'),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "getPatientInstances", null);
__decorate([
    (0, common_1.Get)('demands/:demandId/path-instances'),
    __param(0, (0, common_1.Param)('demandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PathsController.prototype, "getDemandInstances", null);
exports.PathsController = PathsController = __decorate([
    (0, common_1.Controller)(''),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [paths_service_1.PathsService])
], PathsController);
//# sourceMappingURL=paths.controller.js.map