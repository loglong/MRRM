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
exports.TouchpointsController = void 0;
const common_1 = require("@nestjs/common");
const touchpoints_service_1 = require("./touchpoints.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_touchpoint_dto_1 = require("./dto/create-touchpoint.dto");
const update_touchpoint_dto_1 = require("./dto/update-touchpoint.dto");
const touchpoint_filters_dto_1 = require("./dto/touchpoint-filters.dto");
let TouchpointsController = class TouchpointsController {
    constructor(touchpointsService) {
        this.touchpointsService = touchpointsService;
    }
    async create(body, req) {
        const parsed = create_touchpoint_dto_1.CreateTouchpointSchema.parse(body);
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.touchpointsService.create(parsed, orgId, req.user?.id);
    }
    async findAll(query, req) {
        const filters = touchpoint_filters_dto_1.TouchpointFiltersSchema.parse(query);
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.touchpointsService.findAll(orgId, filters);
    }
    async getAnalytics(startDate, endDate, granularity, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.touchpointsService.getAnalytics(orgId, startDate, endDate, granularity || 'day');
    }
    async findById(id, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.touchpointsService.findById(id, orgId);
    }
    async update(id, body, req) {
        const parsed = update_touchpoint_dto_1.UpdateTouchpointSchema.parse(body);
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.touchpointsService.update(id, parsed, orgId);
    }
    async void(id, body, req) {
        const orgId = req.user?.orgId || req.user?.user?.orgId;
        return this.touchpointsService.void(id, body.reason, orgId);
    }
};
exports.TouchpointsController = TouchpointsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TouchpointsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TouchpointsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('granularity')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TouchpointsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TouchpointsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TouchpointsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/void'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TouchpointsController.prototype, "void", null);
exports.TouchpointsController = TouchpointsController = __decorate([
    (0, common_1.Controller)('touchpoints'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [touchpoints_service_1.TouchpointsService])
], TouchpointsController);
//# sourceMappingURL=touchpoints.controller.js.map