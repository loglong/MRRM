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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileController = void 0;
const common_1 = require("@nestjs/common");
const mobile_service_1 = require("./mobile.service");
const mobile_patient_dto_1 = require("./dto/mobile-patient.dto");
let MobileController = class MobileController {
    constructor(mobileService) {
        this.mobileService = mobileService;
    }
    async getPatients(dto, orgId) {
        return this.mobileService.getPatients(dto, orgId);
    }
    async getDemands(dto, orgId) {
        return this.mobileService.getDemands(dto, orgId);
    }
    async getRecentTouchpoints(orgId, limit) {
        return this.mobileService.getRecentTouchpoints(orgId, limit || 10);
    }
    async getPendingFollowups(orgId, limit) {
        return this.mobileService.getPendingFollowups(orgId, limit || 20);
    }
};
exports.MobileController = MobileController;
__decorate([
    (0, common_1.Get)('patients'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_patient_dto_1.MobilePatientListDto, String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getPatients", null);
__decorate([
    (0, common_1.Get)('demands'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_patient_dto_1.MobileDemandListDto, String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getDemands", null);
__decorate([
    (0, common_1.Get)('touchpoints/recent'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getRecentTouchpoints", null);
__decorate([
    (0, common_1.Get)('followups/pending'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getPendingFollowups", null);
exports.MobileController = MobileController = __decorate([
    (0, common_1.Controller)('api/mobile'),
    __metadata("design:paramtypes", [mobile_service_1.MobileService])
], MobileController);
//# sourceMappingURL=mobile.controller.js.map