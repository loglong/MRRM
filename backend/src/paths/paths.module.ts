import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PathsService } from './paths.service';
import { PathsController } from './paths.controller';
import { PathSchedulerService } from './path-scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [PathsController],
  providers: [PathsService, PathSchedulerService],
  exports: [PathsService],
})
export class PathsModule {}
