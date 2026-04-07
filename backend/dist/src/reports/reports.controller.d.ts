import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ExcelExportService } from './exports/excel-export.service';
import { KpiFiltersDto, ExportKpiDto } from './dto/kpi-filters.dto';
export declare class ReportsController {
    private readonly reportsService;
    private readonly excelExportService;
    constructor(reportsService: ReportsService, excelExportService: ExcelExportService);
    getKPIs(query: KpiFiltersDto, req: any): Promise<import("./reports.service").KPIData>;
    getKPITrends(query: KpiFiltersDto, req: any): Promise<import("./reports.service").KPITrend[]>;
    exportKPI(query: ExportKpiDto, req: any, res: Response): Promise<Buffer<ArrayBufferLike>>;
    private parseFilters;
}
