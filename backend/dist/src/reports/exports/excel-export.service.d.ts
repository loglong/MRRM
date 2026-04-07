import { KPIData, KPITrend, KpiFilters } from '../reports.service';
export declare class ExcelExportService {
    generateKPIReport(data: KPIData, trends: KPITrend[], filters: KpiFilters): Buffer;
}
