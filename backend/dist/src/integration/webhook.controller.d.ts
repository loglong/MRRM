import { WebhookService } from './webhook.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
export declare class WebhookController {
    private readonly webhookService;
    constructor(webhookService: WebhookService);
    receiveEvent(payload: WebhookPayloadDto): Promise<{
        received: boolean;
    }>;
    getConfig(): {
        availableEventTypes: string[];
        registeredWebhooks: Record<string, string[]>;
    };
}
