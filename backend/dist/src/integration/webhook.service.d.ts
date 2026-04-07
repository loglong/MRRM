import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
export declare class WebhookService implements OnModuleInit {
    private configService;
    private readonly logger;
    private readonly INTEGRATION_EXCHANGE;
    private readonly MAX_BUFFER_SIZE;
    private connection;
    private channel;
    private isConnected;
    private buffer;
    private webhookUrls;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private connectIntegrationExchange;
    private scheduleReconnect;
    private flushBuffer;
    private publishToExchange;
    dispatch(payload: WebhookPayloadDto): Promise<void>;
    getIntegrationExchange(): string;
    getAvailableEventTypes(): string[];
    getWebhookUrls(eventType: string): string[];
}
