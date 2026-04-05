import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../common/prisma/prisma.module';
import { FollowupsService } from './followups.service';
import { FollowupSchedulerService } from './followup-scheduler.service';
import { FollowupsController } from './followups.controller';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  controllers: [FollowupsController],
  providers: [FollowupsService, FollowupSchedulerService],
  exports: [FollowupsService],
})
export class FollowupsModule {}
