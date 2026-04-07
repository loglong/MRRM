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
exports.PathSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const paths_service_1 = require("./paths.service");
const logger_1 = require("../common/logger");
let PathSchedulerService = class PathSchedulerService {
    constructor(pathsService) {
        this.pathsService = pathsService;
        this.logger = new logger_1.Logger('PathSchedulerService');
    }
    async handleOverdueDetection() {
        this.logger.log('Running overdue step detection...', 'PathSchedulerService');
        try {
            const result = await this.pathsService.detectOverdueSteps();
            this.logger.log(`Overdue detection complete: ${result.updated} steps marked as overdue`, 'PathSchedulerService');
        }
        catch (error) {
            this.logger.error(`Overdue detection failed: ${error.message}`, error.stack, 'PathSchedulerService');
        }
    }
};
exports.PathSchedulerService = PathSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PathSchedulerService.prototype, "handleOverdueDetection", null);
exports.PathSchedulerService = PathSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [paths_service_1.PathsService])
], PathSchedulerService);
//# sourceMappingURL=path-scheduler.service.js.map