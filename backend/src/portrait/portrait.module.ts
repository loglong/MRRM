import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { LifecycleService } from './services/lifecycle.service';
import { TaggingService } from './services/tagging.service';
import { ScoreCalculatorService } from './services/score-calculator.service';
import { AiTaggingService } from './services/ai-tagging.service';
import { PatientEventListener } from './listeners/patient-event.listener';
import { MiniMaxProvider } from '../ai/services/llm.service';

@Module({
  providers: [PrismaService, ConfigService, MiniMaxProvider, LifecycleService, TaggingService, ScoreCalculatorService, AiTaggingService, PatientEventListener],
  exports: [LifecycleService, TaggingService, ScoreCalculatorService, AiTaggingService, PatientEventListener]
})
export class PortraitModule {}