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
exports.ExportExperienceDto = exports.DeclineFiltersDto = exports.SatisfactionFiltersDto = void 0;
const class_validator_1 = require("class-validator");
class SatisfactionFiltersDto {
    constructor() {
        this.granularity = 'day';
    }
}
exports.SatisfactionFiltersDto = SatisfactionFiltersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SatisfactionFiltersDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SatisfactionFiltersDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['day', 'week', 'month']),
    __metadata("design:type", String)
], SatisfactionFiltersDto.prototype, "granularity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SatisfactionFiltersDto.prototype, "orgIds", void 0);
class DeclineFiltersDto {
    constructor() {
        this.lookbackWeeks = 4;
        this.declineThreshold = -20;
    }
}
exports.DeclineFiltersDto = DeclineFiltersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], DeclineFiltersDto.prototype, "lookbackWeeks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DeclineFiltersDto.prototype, "declineThreshold", void 0);
class ExportExperienceDto extends SatisfactionFiltersDto {
}
exports.ExportExperienceDto = ExportExperienceDto;
//# sourceMappingURL=satisfaction-filters.dto.js.map