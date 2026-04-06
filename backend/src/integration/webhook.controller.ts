import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhookSignatureGuard } from './webhook-signature.guard';
import { WebhookService } from './webhook.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('events')
  @UseGuards(WebhookSignatureGuard)
  @ApiOperation({
    summary: 'Receive webhook event',
    description: 'Generic webhook receiver endpoint for external systems to push events. Requires valid HMAC-SHA256 signature.',
  })
  async receiveEvent(@Body() payload: WebhookPayloadDto) {
    await this.webhookService.dispatch(payload);
    return { received: true };
  }

  @Get('config')
  @ApiOperation({
    summary: 'Get webhook configuration',
    description: 'Returns available event types and current webhook URL registrations.',
  })
  getConfig() {
    const eventTypes = this.webhookService.getAvailableEventTypes();
    const webhookConfigs: Record<string, string[]> = {};

    for (const eventType of eventTypes) {
      webhookConfigs[eventType] = this.webhookService.getWebhookUrls(eventType);
    }

    return {
      availableEventTypes: eventTypes,
      registeredWebhooks: webhookConfigs,
    };
  }
}
