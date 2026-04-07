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
exports.Logger = void 0;
const common_1 = require("@nestjs/common");
const winston = require("winston");
let Logger = class Logger {
    constructor(context) {
        this.context = context;
        this.winston = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.errors({ stack: true }), winston.format.json()),
            defaultMeta: { service: 'mrrm-backend' },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                        const ctx = context || this.context || 'Logger';
                        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                        return `${timestamp} [${level}] [${ctx}] ${message}${metaStr}`;
                    })),
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
    setContext(context) {
        this.context = context;
    }
    log(message, context) {
        this.winston.info(message, { context: context || this.context });
    }
    error(message, trace, context) {
        this.winston.error(message, { trace, context: context || this.context });
    }
    warn(message, context) {
        this.winston.warn(message, { context: context || this.context });
    }
    debug(message, context) {
        this.winston.debug(message, { context: context || this.context });
    }
    verbose(message, context) {
        this.winston.verbose(message, { context: context || this.context });
    }
};
exports.Logger = Logger;
exports.Logger = Logger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String])
], Logger);
//# sourceMappingURL=logger.js.map