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
exports.ExperienceController = void 0;
const common_1 = require("@nestjs/common");
const experience_service_1 = require("./experience.service");
const experience_export_service_1 = require("./exports/experience-export.service");
const satisfaction_filters_dto_1 = require("./dto/satisfaction-filters.dto");
let ExperienceController = class ExperienceController {
    constructor(experienceService, experienceExportService) {
        this.experienceService = experienceService;
        this.experienceExportService = experienceExportService;
    }
    async getSatisfactionTrends(query, req) {
        const orgId = req.user?.orgId;
        const filters = this.parseFilters(query);
        return this.experienceService.getSatisfactionTrends(orgId, filters);
    }
    async getDecliningPatients(query, req) {
        const orgId = req.user?.orgId;
        return this.experienceService.getDecliningPatients(orgId, query.lookbackWeeks || 4, query.declineThreshold ?? -20);
    }
    async exportExperience(query, req, res) {
        const orgId = req.user?.orgId;
        const filters = this.parseFilters(query);
        const [trends, declining] = await Promise.all([
            this.experienceService.getSatisfactionTrends(orgId, filters),
            this.experienceService.getDecliningPatients(orgId, 4, -20),
        ]);
        const buffer = this.experienceExportService.generateExperienceReport(trends, declining, {
            startDate: query.startDate || 'All time',
            endDate: query.endDate || 'Now',
        });
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="experience-report-${Date.now()}.xlsx"`,
        });
        return buffer;
    }
    parseFilters(query) {
        return {
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            granularity: query.granularity || 'day',
            orgIds: query.orgIds ? query.orgIds.split(',').map((s) => s.trim()) : undefined,
        };
    }
};
exports.ExperienceController = ExperienceController;
__decorate([
    (0, common_1.Get)('satisfaction'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [satisfaction_filters_dto_1.SatisfactionFiltersDto, Object]),
    __metadata("design:returntype", Promise)
], ExperienceController.prototype, "getSatisfactionTrends", null);
__decorate([
    (0, common_1.Get)('declining'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [satisfaction_filters_dto_1.DeclineFiltersDto, Object]),
    __metadata("design:returntype", Promise)
], ExperienceController.prototype, "getDecliningPatients", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [satisfaction_filters_dto_1.ExportExperienceDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ExperienceController.prototype, "exportExperience", null);
exports.ExperienceController = ExperienceController = __decorate([
    (0, common_1.Controller)('experience'),
    __metadata("design:paramtypes", [experience_service_1.ExperienceService,
        experience_export_service_1.ExperienceExportService])
], ExperienceController);
//# sourceMappingURL=experience.controller.js.map