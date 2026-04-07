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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const excel_export_service_1 = require("./exports/excel-export.service");
const kpi_filters_dto_1 = require("./dto/kpi-filters.dto");
let ReportsController = class ReportsController {
    constructor(reportsService, excelExportService) {
        this.reportsService = reportsService;
        this.excelExportService = excelExportService;
    }
    async getKPIs(query, req) {
        const orgId = req.user?.orgId;
        const filters = this.parseFilters(query);
        return this.reportsService.getKPIs(orgId, filters);
    }
    async getKPITrends(query, req) {
        const orgId = req.user?.orgId;
        const filters = this.parseFilters(query);
        return this.reportsService.getKPITrends(orgId, filters);
    }
    async exportKPI(query, req, res) {
        const orgId = req.user?.orgId;
        const filters = this.parseFilters(query);
        const [data, trends] = await Promise.all([
            this.reportsService.getKPIs(orgId, filters),
            this.reportsService.getKPITrends(orgId, filters),
        ]);
        const buffer = this.excelExportService.generateKPIReport(data, trends, filters);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="kpi-report-${Date.now()}.xlsx"`,
        });
        return buffer;
    }
    parseFilters(query) {
        return {
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            orgIds: query.orgIds ? query.orgIds.split(',').map((s) => s.trim()) : undefined,
            granularity: query.granularity || 'day',
        };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('kpis'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kpi_filters_dto_1.KpiFiltersDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getKPIs", null);
__decorate([
    (0, common_1.Get)('kpis/trends'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kpi_filters_dto_1.KpiFiltersDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getKPITrends", null);
__decorate([
    (0, common_1.Get)('export/kpi'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kpi_filters_dto_1.ExportKpiDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportKPI", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        excel_export_service_1.ExcelExportService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map