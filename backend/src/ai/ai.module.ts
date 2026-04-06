import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiController } from './ai.controller';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService } from './services/followup-recommendation.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [ChurnPredictionService, FollowupRecommendationService],
  exports: [ChurnPredictionService, FollowupRecommendationService],
})
export class AiModule {}
