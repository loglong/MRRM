import { Controller, Get, Query, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExperienceService } from './experience.service';
import { ExperienceExportService } from './exports/experience-export.service';
import { SatisfactionFiltersDto, DeclineFiltersDto, ExportExperienceDto } from './dto/satisfaction-filters.dto';

@Controller('experience')
export class ExperienceController {
  constructor(
    private readonly experienceService: ExperienceService,
    private readonly experienceExportService: ExperienceExportService,
  ) {}

  @Get('satisfaction')
  async getSatisfactionTrends(@Query() query: SatisfactionFiltersDto, @Request() req: any) {
    const orgId = req.user?.orgId;
    const filters = this.parseFilters(query);
    return this.experienceService.getSatisfactionTrends(orgId, filters);
  }

  @Get('declining')
  async getDecliningPatients(@Query() query: DeclineFiltersDto, @Request() req: any) {
    const orgId = req.user?.orgId;
    return this.experienceService.getDecliningPatients(
      orgId,
      query.lookbackWeeks || 4,
      query.declineThreshold ?? -20,
    );
  }

  @Get('export')
  async exportExperience(
    @Query() query: ExportExperienceDto,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
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

  private parseFilters(query: SatisfactionFiltersDto) {
    return {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      granularity: query.granularity || 'day',
      orgIds: query.orgIds ? query.orgIds.split(',').map((s) => s.trim()) : undefined,
    };
  }
}
