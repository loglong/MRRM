import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log incoming request
    this.logger.debug(`${method} ${originalUrl} - ${ip} - ${userAgent}`, 'LoggerMiddleware');

    // Log response on finish
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 400) {
        this.logger.warn(logMessage, 'LoggerMiddleware');
      } else {
        this.logger.debug(logMessage, 'LoggerMiddleware');
      }
    });

    next();
  }
}
