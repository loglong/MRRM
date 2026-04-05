import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ExcelExportService } from './exports/excel-export.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ExcelExportService],
  exports: [ReportsService],
})
export class ReportsModule {}
