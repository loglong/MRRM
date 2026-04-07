"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceExportService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
let ExperienceExportService = class ExperienceExportService {
    generateExperienceReport(trends, declining, filters) {
        const workbook = XLSX.utils.book_new();
        const trendsData = [
            ['Satisfaction Trends Report'],
            ['Generated', new Date().toISOString()],
            ['Period', `${filters.startDate} to ${filters.endDate}`],
            [''],
            ['Date', 'Satisfaction Score', 'Positive', 'Neutral', 'Negative', 'Total'],
            ...trends.map((t) => [t.period, t.score, t.positive, t.neutral, t.negative, t.total]),
        ];
        const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
        XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Trends');
        if (declining && declining.length > 0) {
            const declineData = [
                ['Patients with Declining Satisfaction'],
                [''],
                ['Patient Name', 'Current Score', 'Previous Score', 'Decline'],
                ...declining.map((p) => [p.patientName, p.currentScore, p.previousScore, p.decline]),
            ];
            const declineSheet = XLSX.utils.aoa_to_sheet(declineData);
            XLSX.utils.book_append_sheet(workbook, declineSheet, 'Declining Patients');
        }
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
};
exports.ExperienceExportService = ExperienceExportService;
exports.ExperienceExportService = ExperienceExportService = __decorate([
    (0, common_1.Injectable)()
], ExperienceExportService);
//# sourceMappingURL=experience-export.service.js.map