"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_signature_guard_1 = require("./webhook-signature.guard");
const webhook_service_1 = require("./webhook.service");
const webhook_payload_dto_1 = require("./dto/webhook-payload.dto");
let WebhookController = class WebhookController {
    constructor(webhookService) {
        this.webhookService = webhookService;
    }
    async receiveEvent(payload) {
        await this.webhookService.dispatch(payload);
        return { received: true };
    }
    getConfig() {
        const eventTypes = this.webhookService.getAvailableEventTypes();
        const webhookConfigs = {};
        for (const eventType of eventTypes) {
            webhookConfigs[eventType] = this.webhookService.getWebhookUrls(eventType);
        }
        return {
            availableEventTypes: eventTypes,
            registeredWebhooks: webhookConfigs,
        };
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('events'),
    (0, common_1.UseGuards)(webhook_signature_guard_1.WebhookSignatureGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Receive webhook event',
        description: 'Generic webhook receiver endpoint for external systems to push events. Requires valid HMAC-SHA256 signature.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webhook_payload_dto_1.WebhookPayloadDto]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "receiveEvent", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get webhook configuration',
        description: 'Returns available event types and current webhook URL registrations.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WebhookController.prototype, "getConfig", null);
exports.WebhookController = WebhookController = __decorate([
    (0, swagger_1.ApiTags)('Webhook'),
    (0, common_1.Controller)('webhook'),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map