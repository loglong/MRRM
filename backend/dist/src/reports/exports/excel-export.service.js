"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExportService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
let ExcelExportService = class ExcelExportService {
    generateKPIReport(data, trends, filters) {
        const workbook = XLSX.utils.book_new();
        const summaryData = [
            ['Key Performance Indicators Report'],
            ['Generated', new Date().toISOString()],
            [''],
            ['Period', `${filters.startDate?.toISOString() || 'All time'} to ${filters.endDate?.toISOString() || 'Now'}`],
            [''],
            ['Summary'],
            ['New Patients', data.newPatients],
            ['Demand Conversion Rate', `${data.conversionRate}%`],
            ['Followup Completion Rate', `${data.followupCompletionRate}%`],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        if (trends && trends.length > 0) {
            const trendHeader = ['Date', 'New Patients', 'Conversion Rate (%)', 'Followup Completion Rate (%)'];
            const trendRows = trends.map((t) => [
                t.date,
                t.newPatients,
                t.conversionRate,
                t.followupCompletionRate,
            ]);
            const trendSheet = XLSX.utils.aoa_to_sheet([trendHeader, ...trendRows]);
            XLSX.utils.book_append_sheet(workbook, trendSheet, 'Trends');
        }
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
};
exports.ExcelExportService = ExcelExportService;
exports.ExcelExportService = ExcelExportService = __decorate([
    (0, common_1.Injectable)()
], ExcelExportService);
//# sourceMappingURL=excel-export.service.js.map