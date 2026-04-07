export declare class IntegrationConfigDto {
    hisBaseUrl?: string;
    hisApiKey?: string;
    crmBaseUrl?: string;
    crmApiKey?: string;
    crmSyncDirection?: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
    biBaseUrl?: string;
    biApiKey?: string;
    biPushInterval?: string;
}
