import { LoggerService as NestLoggerService } from '@nestjs/common';
export declare class Logger implements NestLoggerService {
    private context?;
    private moduleName?;
    private winston;
    constructor(context?: string);
    setContext(context: string): void;
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
}
