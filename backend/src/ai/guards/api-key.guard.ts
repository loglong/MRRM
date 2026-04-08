import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { loadAiConfig, AiPermissionConfig } from '../config/ai-config.loader';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private config: AiPermissionConfig;

  constructor() {
    this.config = loadAiConfig();
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('Missing API Key');
    }

    const keyConfig = this.config.ai_employee.keys.find(
      (k) => k.key === apiKey && k.enabled
    );

    if (!keyConfig) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // 校验 IP 白名单（如果配置了）
    if (keyConfig.ipWhitelist.length > 0) {
      const clientIp = this.getClientIp(request);
      if (!keyConfig.ipWhitelist.includes(clientIp)) {
        throw new ForbiddenException('IP not allowed');
      }
    }

    // 将 API Key 配置挂载到 request 上，供后续使用
    request['aiKeyConfig'] = keyConfig;
    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    // 支持从 Header 或 Query 提取
    return (
      request.headers['x-api-key'] as string ||
      request.query['api_key'] as string
    );
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.ip ||
      request.socket.remoteAddress ||
      ''
    );
  }
}