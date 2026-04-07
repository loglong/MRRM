import { Response } from 'express';
import { ExperienceService } from './experience.service';
import { ExperienceExportService } from './exports/experience-export.service';
import { SatisfactionFiltersDto, DeclineFiltersDto, ExportExperienceDto } from './dto/satisfaction-filters.dto';
export declare class ExperienceController {
    private readonly experienceService;
    private readonly experienceExportService;
    constructor(experienceService: ExperienceService, experienceExportService: ExperienceExportService);
    getSatisfactionTrends(query: SatisfactionFiltersDto, req: any): Promise<import("./experience.service").SatisfactionTrend[]>;
    getDecliningPatients(query: DeclineFiltersDto, req: any): Promise<import("./experience.service").DecliningPatient[]>;
    exportExperience(query: ExportExperienceDto, req: any, res: Response): Promise<Buffer<ArrayBufferLike>>;
    private parseFilters;
}
