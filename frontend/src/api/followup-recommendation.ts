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
  // Use internal AI endpoint with JWT auth (no API key required)
  get: (patientId: string): Promise<FollowupRecommendation> => {
    return api.get(`/ai-internal/followup-recommendations/${patientId}`).then(res => res.data);
  },
};
