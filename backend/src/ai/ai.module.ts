import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiController } from './ai.controller';
import { ChurnPredictionService } from './services/churn-prediction.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [ChurnPredictionService],
  exports: [ChurnPredictionService],
})
export class AiModule {}
