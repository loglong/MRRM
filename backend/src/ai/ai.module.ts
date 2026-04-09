import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiController } from './ai.controller';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService } from './services/followup-recommendation.service';
import { LlmService } from './services/llm.service';
import { MiniMaxProvider } from './services/llm.service';
import { LlmCache } from './services/llm.service';
import { AiAuditInterceptor } from './interceptors/ai-audit.interceptor';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AiController],
  providers: [
    ChurnPredictionService,
    FollowupRecommendationService,
    LlmService,
    MiniMaxProvider,
    LlmCache,
    AiAuditInterceptor,
  ],
  exports: [ChurnPredictionService, FollowupRecommendationService, LlmService],
})
export class AiModule {}
