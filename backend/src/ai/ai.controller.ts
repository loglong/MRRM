import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AiAuditInterceptor } from './interceptors/ai-audit.interceptor';
import { PatientSkillService } from './services/patient-skill.service';
import { PatientSearchDto } from './dto/patient-search.dto';
import { CreateTouchpointDto } from './dto/create-touchpoint.dto';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { successResponse, errorResponse } from './interfaces/ai-response.interface';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService, FollowupRecommendation } from './services/followup-recommendation.service';
import { GetHighRiskPatientsDto } from './dto/churn-prediction.dto';

@Controller('ai')
@UseGuards(ApiKeyGuard)
@UseInterceptors(AiAuditInterceptor)
export class AiController {
  constructor(
    private readonly patientSkillService: PatientSkillService,
    private readonly churnPredictionService: ChurnPredictionService,
    private readonly followupRecommendationService: FollowupRecommendationService,
  ) {}

  // 健康检查
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return successResponse({ status: 'ok' });
  }

  // 患者搜索
  @Get('patients/search')
  @UseGuards(ThrottlerGuard)
  async searchPatients(@Query() dto: PatientSearchDto, @Req() req: Request) {
    try {
      const orgId = req['aiKeyConfig']?.orgId;
      if (!orgId) {
        return errorResponse('INVALID_ORG', 'Organization not found');
      }
      const result = await this.patientSkillService.searchPatients(orgId, dto);
      return successResponse(result);
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error.name : 'SEARCH_ERROR',
        error instanceof Error ? error.message : 'Search failed'
      );
    }
  }

  // 患者详情
  @Get('patients/:id')
  @UseGuards(ThrottlerGuard)
  async getPatientDetail(@Param('id') id: string, @Req() req: Request) {
    try {
      const orgId = req['aiKeyConfig']?.orgId;
      if (!orgId) {
        return errorResponse('INVALID_ORG', 'Organization not found');
      }
      const result = await this.patientSkillService.getPatientDetail(orgId, id);
      return successResponse(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        return errorResponse('PATIENT_NOT_FOUND', '患者不存在', id);
      }
      return errorResponse(
        error instanceof Error ? error.name : 'DETAIL_ERROR',
        error instanceof Error ? error.message : 'Get detail failed'
      );
    }
  }

  // 创建触点
  @Post('patients/:id/touchpoints')
  @UseGuards(ThrottlerGuard)
  async createTouchpoint(
    @Param('id') id: string,
    @Body() dto: CreateTouchpointDto,
    @Req() req: Request,
  ) {
    try {
      const orgId = req['aiKeyConfig']?.orgId;
      if (!orgId) {
        return errorResponse('INVALID_ORG', 'Organization not found');
      }
      const result = await this.patientSkillService.createTouchpoint(orgId, id, dto);
      return successResponse(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        return errorResponse('PATIENT_NOT_FOUND', '患者不存在', id);
      }
      return errorResponse(
        error instanceof Error ? error.name : 'TOUCHPOINT_ERROR',
        error instanceof Error ? error.message : 'Create touchpoint failed'
      );
    }
  }

  // 创建随访
  @Post('patients/:id/followups')
  @UseGuards(ThrottlerGuard)
  async createFollowup(
    @Param('id') id: string,
    @Body() dto: CreateFollowupDto,
    @Req() req: Request,
  ) {
    try {
      const orgId = req['aiKeyConfig']?.orgId;
      if (!orgId) {
        return errorResponse('INVALID_ORG', 'Organization not found');
      }
      const result = await this.patientSkillService.createFollowup(orgId, id, dto);
      return successResponse(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        return errorResponse('PATIENT_NOT_FOUND', '患者不存在', id);
      }
      return errorResponse(
        error instanceof Error ? error.name : 'FOLLOWUP_ERROR',
        error instanceof Error ? error.message : 'Create followup failed'
      );
    }
  }

  // 流失风险评估（保留原有端点）
  @Get('churn-risk/:patientId')
  async getPatientRisk(@Param('patientId') patientId: string) {
    const riskScore = await this.churnPredictionService.calculateRiskScore(patientId);
    if (!riskScore) {
      return { error: 'Patient not found' };
    }
    return riskScore;
  }

  @Get('churn-risk/high-risk')
  async getHighRiskPatients(@Query() query: GetHighRiskPatientsDto) {
    return this.churnPredictionService.getHighRiskPatients(query.threshold);
  }

  // 随访推荐（保留原有端点）
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
