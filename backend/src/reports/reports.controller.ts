import { Controller, Get, Query, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService, KpiFilters } from './reports.service';
import { ExcelExportService } from './exports/excel-export.service';
import { KpiFiltersDto, ExportKpiDto } from './dto/kpi-filters.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly excelExportService: ExcelExportService,
  ) {}

  @Get('kpis')
  async getKPIs(@Query() query: KpiFiltersDto, @Request() req: any) {
    const orgId = req.user?.orgId;
    const filters = this.parseFilters(query);
    return this.reportsService.getKPIs(orgId, filters);
  }

  @Get('kpis/trends')
  async getKPITrends(@Query() query: KpiFiltersDto, @Request() req: any) {
    const orgId = req.user?.orgId;
    const filters = this.parseFilters(query);
    return this.reportsService.getKPITrends(orgId, filters);
  }

  @Get('export/kpi')
  async exportKPI(
    @Query() query: ExportKpiDto,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
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

  private parseFilters(query: KpiFiltersDto): KpiFilters {
    return {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      orgIds: query.orgIds ? query.orgIds.split(',').map((s) => s.trim()) : undefined,
      granularity: query.granularity || 'day',
    };
  }
}
