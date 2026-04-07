export interface JourneyEvent {
    id: string;
    type: JourneyEventType;
    title: string;
    subType?: string;
    sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    status?: string;
    occurredAt: Date;
    metadata?: Record<string, any>;
}
export type JourneyEventType = 'TOUCHPOINT' | 'DEMAND' | 'PATH_START' | 'PATH_STEP' | 'PATH_END' | 'FOLLOWUP' | 'MILESTONE';
export interface JourneyResponse {
    events: JourneyEvent[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
