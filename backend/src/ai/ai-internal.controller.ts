import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowupRecommendationService, FollowupRecommendation } from './services/followup-recommendation.service';

/**
 * Internal AI Controller for patient-facing AI features
 * Uses JWT authentication (for frontend users)
 * Contrast with AiController which uses API Key authentication (for external AI agents)
 */
@Controller('ai-internal')
@UseGuards(JwtAuthGuard)
export class AiInternalController {
  constructor(
    private readonly followupRecommendationService: FollowupRecommendationService,
  ) {}

  /**
   * Get AI followup recommendation for a patient
   * This endpoint is called from the authenticated frontend
   */
  @Get('followup-recommendations/:patientId')
  async getFollowupRecommendation(
    @Param('patientId') patientId: string,
    @Req() req: Request,
  ): Promise<FollowupRecommendation | { error: string }> {
    const orgId = (req as any).user?.orgId;

    if (!orgId) {
      return { error: 'Organization not found' };
    }

    const recommendation = await this.followupRecommendationService.getRecommendation(patientId, orgId);

    if (!recommendation) {
      return { error: 'Patient not found' };
    }

    return recommendation;
  }
}
