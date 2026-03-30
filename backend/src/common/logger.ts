import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger implements NestLoggerService {
  private context?: string;
  private moduleName?: string;
  private winston: winston.Logger;

  constructor(context?: string) {
    this.context = context;
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'mrrm-backend' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const ctx = context || this.context || 'Logger';
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} [${level}] [${ctx}] ${message}${metaStr}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.winston.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.winston.error(message, { trace, context: context || this.context });
  }

  warn(message: string, context?: string) {
    this.winston.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.winston.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.winston.verbose(message, { context: context || this.context });
  }
}
