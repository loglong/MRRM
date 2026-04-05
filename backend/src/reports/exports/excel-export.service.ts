import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { KPIData, KPITrend, KpiFilters } from '../reports.service';

@Injectable()
export class ExcelExportService {
  generateKPIReport(data: KPIData, trends: KPITrend[], filters: KpiFilters): Buffer {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
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

    // Trends sheet
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
}
