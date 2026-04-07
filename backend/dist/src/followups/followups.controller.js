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
exports.FollowupsController = void 0;
const common_1 = require("@nestjs/common");
const followups_service_1 = require("./followups.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_followup_plan_dto_1 = require("./dto/create-followup-plan.dto");
const create_followup_record_dto_1 = require("./dto/create-followup-record.dto");
const execute_followup_dto_1 = require("./dto/execute-followup.dto");
const followup_filters_dto_1 = require("./dto/followup-filters.dto");
let FollowupsController = class FollowupsController {
    constructor(followupsService) {
        this.followupsService = followupsService;
    }
    async createPlan(body, req) {
        const parsed = create_followup_plan_dto_1.CreateFollowupPlanSchema.parse(body);
        const orgId = req.user?.orgId;
        const userId = req.user?.sub;
        return this.followupsService.createPlan(parsed, orgId, userId);
    }
    async findPlans(query, req) {
        const filters = followup_filters_dto_1.FollowupPlanFiltersSchema.parse(query);
        const orgId = req.user?.orgId;
        return this.followupsService.findPlans(orgId, filters);
    }
    async findPlanById(id, req) {
        const orgId = req.user?.orgId;
        return this.followupsService.findPlanById(id, orgId);
    }
    async pausePlan(id, req) {
        const orgId = req.user?.orgId;
        return this.followupsService.pausePlan(id, orgId);
    }
    async resumePlan(id, req) {
        const orgId = req.user?.orgId;
        return this.followupsService.resumePlan(id, orgId);
    }
    async createRecord(body, req) {
        const parsed = create_followup_record_dto_1.CreateFollowupRecordSchema.parse(body);
        const orgId = req.user?.orgId;
        return this.followupsService.generateFollowupRecords(parsed, parsed.pathInstanceStepId);
    }
    async findRecords(query, req) {
        const filters = followup_filters_dto_1.FollowupRecordFiltersSchema.parse(query);
        const orgId = req.user?.orgId;
        return this.followupsService.findRecords(orgId, filters);
    }
    async executeRecord(id, body, req) {
        const parsed = execute_followup_dto_1.ExecuteFollowupSchema.parse(body);
        const orgId = req.user?.orgId;
        const userId = req.user?.sub;
        return this.followupsService.executeRecord(id, parsed, userId, orgId);
    }
    async getCompletionRate(query, req) {
        const orgId = req.user?.orgId;
        return this.followupsService.getCompletionRate(orgId, query);
    }
};
exports.FollowupsController = FollowupsController;
__decorate([
    (0, common_1.Post)('followup-plans'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('followup-plans'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "findPlans", null);
__decorate([
    (0, common_1.Get)('followup-plans/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "findPlanById", null);
__decorate([
    (0, common_1.Put)('followup-plans/:id/pause'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "pausePlan", null);
__decorate([
    (0, common_1.Put)('followup-plans/:id/resume'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "resumePlan", null);
__decorate([
    (0, common_1.Post)('followup-records'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Get)('followup-records'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "findRecords", null);
__decorate([
    (0, common_1.Put)('followup-records/:id/execute'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "executeRecord", null);
__decorate([
    (0, common_1.Get)('followup-records/analytics'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FollowupsController.prototype, "getCompletionRate", null);
exports.FollowupsController = FollowupsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [followups_service_1.FollowupsService])
], FollowupsController);
//# sourceMappingURL=followups.controller.js.map