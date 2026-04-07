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
exports.ChurnPredictionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const patient_risk_entity_1 = require("../entities/patient-risk.entity");
let ChurnPredictionService = class ChurnPredictionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateRiskScore(patientId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            include: { assignedUser: { select: { name: true } } },
        });
        if (!patient) {
            return null;
        }
        const factors = [];
        let totalScore = 0;
        let totalWeight = 0;
        const lastVisitFactor = await this.getLastVisitFactor(patientId);
        if (lastVisitFactor) {
            factors.push(lastVisitFactor);
            totalScore += lastVisitFactor.value * lastVisitFactor.weight;
            totalWeight += lastVisitFactor.weight;
        }
        const satisfactionFactor = await this.getSatisfactionTrend(patientId);
        if (satisfactionFactor) {
            factors.push(satisfactionFactor);
            totalScore += satisfactionFactor.value * satisfactionFactor.weight;
            totalWeight += satisfactionFactor.weight;
        }
        const touchpointFactor = await this.getTouchpointTrend(patientId);
        if (touchpointFactor) {
            factors.push(touchpointFactor);
            totalScore += touchpointFactor.value * touchpointFactor.weight;
            totalWeight += touchpointFactor.weight;
        }
        const pathMissedFactor = await this.getPathMissedSteps(patientId);
        if (pathMissedFactor) {
            factors.push(pathMissedFactor);
            totalScore += pathMissedFactor.value * pathMissedFactor.weight;
            totalWeight += pathMissedFactor.weight;
        }
        const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
        const riskLevel = this.getRiskLevel(finalScore);
        return {
            patientId,
            patientName: patient.name,
            score: finalScore,
            riskLevel,
            factors,
            lastUpdated: new Date(),
        };
    }
    async getHighRiskPatients(threshold = 70) {
        const patients = await this.prisma.patient.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });
        const riskScores = await Promise.all(patients.map(p => this.calculateRiskScore(p.id)));
        return riskScores
            .filter((r) => r !== null && r.score >= threshold)
            .sort((a, b) => b.score - a.score);
    }
    getRiskLevel(score) {
        if (score >= 70)
            return patient_risk_entity_1.ChurnRiskLevel.HIGH;
        if (score >= 40)
            return patient_risk_entity_1.ChurnRiskLevel.MEDIUM;
        return patient_risk_entity_1.ChurnRiskLevel.LOW;
    }
    async getLastVisitDays(patientId) {
        const lastTouchpoint = await this.prisma.touchpoint.findFirst({
            where: { patientId, voidedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (lastTouchpoint) {
            return this.daysDifference(new Date(), lastTouchpoint.createdAt);
        }
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            select: { createdAt: true },
        });
        if (!patient)
            return 999;
        return this.daysDifference(new Date(), patient.createdAt);
    }
    async getLastVisitFactor(patientId) {
        const days = await this.getLastVisitDays(patientId);
        let value = 0;
        let description = '';
        if (days > 90) {
            value = 100;
            description = `超过90天未就诊（${days}天）`;
        }
        else if (days > 60) {
            value = 60;
            description = `超过60天未就诊（${days}天）`;
        }
        else if (days > 30) {
            value = 30;
            description = `超过30天未就诊（${days}天）`;
        }
        else {
            value = 0;
            description = `最近就诊在${days}天内`;
        }
        return {
            type: patient_risk_entity_1.RiskFactorType.LAST_VISIT_DAYS,
            value,
            weight: 0.4,
            description,
        };
    }
    async getSatisfactionTrend(patientId) {
        const recentTouchpoints = await this.prisma.touchpoint.findMany({
            where: { patientId, voidedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { sentiment: true },
        });
        const sentimentMap = {
            'POSITIVE': 3,
            'NEUTRAL': 2,
            'NEGATIVE': 1,
        };
        const scores = recentTouchpoints
            .map(t => t.sentiment ? sentimentMap[t.sentiment] : null)
            .filter((s) => s !== null);
        if (scores.length < 2) {
            return null;
        }
        const latest = scores[0];
        const previous = scores[1];
        const drop = previous - latest;
        let value = 0;
        if (drop >= 2)
            value = 100;
        else if (drop >= 1)
            value = 50;
        return {
            type: patient_risk_entity_1.RiskFactorType.SATISFACTION_DROP,
            value,
            weight: 0.3,
            description: drop > 0 ? `满意度下降${drop}分` : '满意度稳定',
        };
    }
    async getTouchpointTrend(patientId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const [recentCount, olderCount] = await Promise.all([
            this.prisma.touchpoint.count({
                where: {
                    patientId,
                    voidedAt: null,
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
            this.prisma.touchpoint.count({
                where: {
                    patientId,
                    voidedAt: null,
                    createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                },
            }),
        ]);
        let value = 0;
        if (olderCount > 0 && recentCount < olderCount * 0.5) {
            value = 100;
        }
        else if (olderCount > 0 && recentCount < olderCount) {
            value = 50;
        }
        return {
            type: patient_risk_entity_1.RiskFactorType.TOUCHPOINT_DECLINE,
            value,
            weight: 0.2,
            description: recentCount < olderCount
                ? `触点频率下降（近30天${recentCount}次 vs 前30天${olderCount}次）`
                : '触点频率正常',
        };
    }
    async getPathMissedSteps(patientId) {
        const overdueSteps = await this.prisma.pathInstanceStep.count({
            where: {
                instance: { patientId },
                status: 'OVERDUE',
            },
        });
        const totalSteps = await this.prisma.pathInstanceStep.count({
            where: {
                instance: { patientId },
            },
        });
        if (totalSteps === 0) {
            return null;
        }
        const missedRatio = overdueSteps / totalSteps;
        const value = Math.round(missedRatio * 100);
        return {
            type: patient_risk_entity_1.RiskFactorType.PATH_MISSED,
            value,
            weight: 0.1,
            description: overdueSteps > 0
                ? `路径步骤遗漏（${overdueSteps}/${totalSteps}步骤逾期）`
                : '路径执行正常',
        };
    }
    daysDifference(date1, date2) {
        const diffTime = Math.abs(date1.getTime() - date2.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};
exports.ChurnPredictionService = ChurnPredictionService;
exports.ChurnPredictionService = ChurnPredictionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChurnPredictionService);
//# sourceMappingURL=churn-prediction.service.js.map