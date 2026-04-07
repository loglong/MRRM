"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskFactorType = exports.ChurnRiskLevel = void 0;
var ChurnRiskLevel;
(function (ChurnRiskLevel) {
    ChurnRiskLevel["HIGH"] = "HIGH";
    ChurnRiskLevel["MEDIUM"] = "MEDIUM";
    ChurnRiskLevel["LOW"] = "LOW";
})(ChurnRiskLevel || (exports.ChurnRiskLevel = ChurnRiskLevel = {}));
var RiskFactorType;
(function (RiskFactorType) {
    RiskFactorType["LAST_VISIT_DAYS"] = "lastVisitDays";
    RiskFactorType["SATISFACTION_DROP"] = "satisfactionDrop";
    RiskFactorType["TOUCHPOINT_DECLINE"] = "touchpointDecline";
    RiskFactorType["PATH_MISSED"] = "pathMissed";
})(RiskFactorType || (exports.RiskFactorType = RiskFactorType = {}));
//# sourceMappingURL=patient-risk.entity.js.map