export declare class SatisfactionFiltersDto {
    startDate?: string;
    endDate?: string;
    granularity?: 'day' | 'week' | 'month';
    orgIds?: string;
}
export declare class DeclineFiltersDto {
    lookbackWeeks?: number;
    declineThreshold?: number;
}
export declare class ExportExperienceDto extends SatisfactionFiltersDto {
}
