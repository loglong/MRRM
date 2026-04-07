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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignatureGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let WebhookSignatureGuard = class WebhookSignatureGuard {
    constructor(configService) {
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const signature = request.headers['x-webhook-signature'];
        const timestamp = request.headers['x-webhook-timestamp'];
        if (!signature || !timestamp) {
            throw new common_1.ForbiddenException('Missing webhook signature or timestamp headers');
        }
        const secret = this.configService.get('WEBHOOK_SECRET');
        if (!secret) {
            throw new common_1.ForbiddenException('Webhook secret not configured');
        }
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (parseInt(timestamp, 10) < fiveMinutesAgo) {
            throw new common_1.ForbiddenException('Webhook timestamp expired');
        }
        const payload = `${timestamp}.${JSON.stringify(request.body)}`;
        const expectedSig = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        const sigBuffer = Buffer.from(signature.replace('sha256=', ''), 'hex');
        const expectedBuffer = Buffer.from(expectedSig, 'hex');
        if (sigBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
            throw new common_1.ForbiddenException('Invalid webhook signature');
        }
        return true;
    }
};
exports.WebhookSignatureGuard = WebhookSignatureGuard;
exports.WebhookSignatureGuard = WebhookSignatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhookSignatureGuard);
//# sourceMappingURL=webhook-signature.guard.js.map