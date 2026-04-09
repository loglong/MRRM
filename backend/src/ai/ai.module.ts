import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiController } from './ai.controller';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService } from './services/followup-recommendation.service';
import { LlmService } from './services/llm.service';
import { MiniMaxProvider } from './services/llm.service';
import { LlmCache } from './services/llm.service';
import { PatientSkillService } from './services/patient-skill.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AiAuditInterceptor } from './interceptors/ai-audit.interceptor';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minute
      limit: 100,  // 100 requests per minute
    }]),
  ],
  controllers: [AiController],
  providers: [
    ChurnPredictionService,
    FollowupRecommendationService,
    LlmService,
    MiniMaxProvider,
    LlmCache,
    PatientSkillService,
    ApiKeyGuard,
    AiAuditInterceptor,
  ],
  exports: [
    ChurnPredictionService,
    FollowupRecommendationService,
    LlmService,
    PatientSkillService,
  ],
})
export class AiModule {}
