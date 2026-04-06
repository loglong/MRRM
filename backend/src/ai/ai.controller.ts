import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { GetHighRiskPatientsDto } from './dto/churn-prediction.dto';

@Controller('api/ai')
export class AiController {
  constructor(private readonly churnPredictionService: ChurnPredictionService) {}

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
}
