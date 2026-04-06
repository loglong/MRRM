import api from './auth';

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

export const followupRecommendationApi = {
  get: (patientId: string): Promise<FollowupRecommendation> => {
    return api.get(`/ai/followup-recommendations/${patientId}`).then(res => res.data);
  },
};
