import { Request } from 'express';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService, FollowupRecommendation } from './services/followup-recommendation.service';
import { GetHighRiskPatientsDto } from './dto/churn-prediction.dto';
export declare class AiController {
    private readonly churnPredictionService;
    private readonly followupRecommendationService;
    constructor(churnPredictionService: ChurnPredictionService, followupRecommendationService: FollowupRecommendationService);
    getPatientRisk(patientId: string): Promise<import("./entities/patient-risk.entity").PatientRiskScore | {
        error: string;
    }>;
    getHighRiskPatients(query: GetHighRiskPatientsDto): Promise<import("./entities/patient-risk.entity").PatientRiskScore[]>;
    getFollowupRecommendation(patientId: string, req: Request): Promise<FollowupRecommendation | {
        error: string;
    }>;
}
