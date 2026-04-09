import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService, FollowupRecommendation } from './services/followup-recommendation.service';
import { GetHighRiskPatientsDto } from './dto/churn-prediction.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly churnPredictionService: ChurnPredictionService,
    private readonly followupRecommendationService: FollowupRecommendationService,
  ) {}

  /**
   * Get risk score for a specific patient
   */
  @Get('churn-risk/:patientId')
  async getPatientRisk(@Param('patientId') patientId: string) {
    const riskScore = await this.churnPredictionService.calculateRiskScore(patientId);
    if (!riskScore) {
      return { error: 'Patient not found' };
    }
    return riskScore;
  }

  /**
   * Get all high risk patients (score >= threshold, default 70)
   */
  @Get('churn-risk/high-risk')
  async getHighRiskPatients(@Query() query: GetHighRiskPatientsDto) {
    return this.churnPredictionService.getHighRiskPatients(query.threshold);
  }

  /**
   * Get personalized followup recommendation for a patient
   */
  @Get('followup-recommendations/:patientId')
  async getFollowupRecommendation(
    @Param('patientId') patientId: string,
    @Req() req: Request,
  ): Promise<FollowupRecommendation | { error: string }> {
    const orgId = (req.headers['x-org-id'] as string) || 'default';
    const recommendation = await this.followupRecommendationService.getRecommendation(patientId, orgId);
    if (!recommendation) {
      return { error: 'Patient not found' };
    }
    return recommendation;
  }
}
