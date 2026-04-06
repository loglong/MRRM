import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../common/prisma/prisma.module';
import { BirthdayReminderService } from './services/birthday-reminder.service';
import { FollowupReminderService } from './services/followup-reminder.service';
import { MarketingAutomationService } from './services/marketing-automation.service';
import { AutomationScheduler } from './scheduler/automation.scheduler';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AiModule,
  ],
  providers: [
    BirthdayReminderService,
    FollowupReminderService,
    MarketingAutomationService,
    AutomationScheduler,
  ],
  exports: [
    BirthdayReminderService,
    FollowupReminderService,
    MarketingAutomationService,
  ],
})
export class AutomationModule {}
