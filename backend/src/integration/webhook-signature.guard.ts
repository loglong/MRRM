import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-webhook-signature'] as string;
    const timestamp = request.headers['x-webhook-timestamp'] as string;

    if (!signature || !timestamp) {
      throw new ForbiddenException('Missing webhook signature or timestamp headers');
    }

    const secret = this.configService.get<string>('WEBHOOK_SECRET');
    if (!secret) {
      throw new ForbiddenException('Webhook secret not configured');
    }

    // Reject if timestamp older than 5 minutes (replay protection)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (parseInt(timestamp, 10) < fiveMinutesAgo) {
      throw new ForbiddenException('Webhook timestamp expired');
    }

    const payload = `${timestamp}.${JSON.stringify(request.body)}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(signature.replace('sha256=', ''), 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    return true;
  }
}
