import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey) {
      // Fallback for development - use a default key (NOT for production)
      this.key = crypto.scryptSync('development-secret-key', 'salt', 32);
    } else {
      // ENCRYPTION_KEY should be 64 hex characters (32 bytes)
      this.key = Buffer.from(encryptionKey, 'hex');
    }
  }

  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    // Check if this is our encrypted format (iv:authTag:encryptedData)
    if (!encryptedText.includes(':')) {
      // Not our format, return as-is (might be plain text from tests)
      return encryptedText;
    }

    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        return encryptedText;
      }

      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      // If decryption fails, return as-is (might be unencrypted data)
      return encryptedText;
    }
  }
}
