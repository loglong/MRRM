import { PrismaService } from '../../common/prisma/prisma.service';
export interface FollowupRecommendation {
    recommendedContent: string[];
    optimalTime: string;
    seasonalAdjustment?: {
        festival?: string;
        topic: string;
    };
    confidence: number;
    reasons: string[];
}
export declare class FollowupRecommendationService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    getRecommendation(patientId: string, orgId: string): Promise<FollowupRecommendation | null>;
    private calculateAge;
    private generateContent;
    private calculateOptimalTime;
    private getSeasonalAdjustment;
    private calculateConfidence;
    private generateReasons;
}
