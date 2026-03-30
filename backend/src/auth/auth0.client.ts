import { Injectable } from '@nestjs/common';
import { Logger } from '../common/logger';

interface AuthingUser {
  id: string;
  email: string;
  name?: string;
  orgId?: string;
  phone?: string;
}

@Injectable()
export class Auth0Client {
  private logger = new Logger('Auth0Client');
  private baseUrl = 'https://oauth.authing.cn';
  private appId: string;
  private appSecret: string;

  constructor() {
    this.appId = process.env.AUTHING_APP_ID || '';
    this.appSecret = process.env.AUTHING_APP_SECRET || '';
    this.baseUrl = process.env.AUTHING_ENDPOINT || this.baseUrl;
  }

  async verifyToken(token: string): Promise<AuthingUser> {
    try {
      // In production, this would verify the token with Authing
      // For now, decode the JWT payload (Authing uses JWT for their tokens)
      const payload = this.decodeJWT(token);

      if (!payload) {
        throw new Error('Invalid token');
      }

      return {
        id: payload.sub || payload.id,
        email: payload.email,
        name: payload.name,
        orgId: payload.orgId || payload.namespace,
        phone: payload.phone,
      };
    } catch (error) {
      this.logger.error('Token verification failed', error instanceof Error ? error.stack : String(error), 'Auth0Client');
      throw new Error('Token verification failed');
    }
  }

  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  async getUserInfo(accessToken: string): Promise<AuthingUser> {
    // In production, call Authing API to get user info
    // POST https://oauth.authing.cn/oauth/authen
    this.logger.log('Fetching user info from Authing', 'Auth0Client');
    return {
      id: '',
      email: '',
    };
  }
}
