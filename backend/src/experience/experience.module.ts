import { Module } from '@nestjs/common';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';
import { ExperienceExportService } from './exports/experience-export.service';

@Module({
  controllers: [ExperienceController],
  providers: [ExperienceService, ExperienceExportService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
