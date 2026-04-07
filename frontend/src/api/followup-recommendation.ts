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
  get: (patientId: string, orgId?: string): Promise<FollowupRecommendation> => {
    const headers: Record<string, string> = {};
    if (orgId) {
      headers['x-org-id'] = orgId;
    }
    return api.get(`/ai/followup-recommendations/${patientId}`, { headers }).then(res => res.data);
  },
};
