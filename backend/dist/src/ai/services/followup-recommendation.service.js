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
exports.FollowupRecommendationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const logger_1 = require("../../common/logger");
let FollowupRecommendationService = class FollowupRecommendationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_1.Logger('FollowupRecommendationService');
    }
    async getRecommendation(patientId, orgId) {
        this.logger.log(`Getting followup recommendation for patient ${patientId}`);
        const patient = await this.prisma.patient.findFirst({
            where: { id: patientId, orgId, deletedAt: null },
        });
        if (!patient) {
            this.logger.warn(`Patient ${patientId} not found`);
            return null;
        }
        const demands = await this.prisma.demand.findMany({
            where: { patientId, orgId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        const touchpoints = await this.prisma.touchpoint.findMany({
            where: { patientId, orgId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const patientInfo = {
            id: patient.id,
            name: patient.name,
            age: this.calculateAge(patient.birthDate),
            birthDate: patient.birthDate,
            allergyHistory: patient.allergyHistory,
            pastHistory: patient.pastHistory,
            tier: patient.tier,
        };
        const demandInfos = demands.map(d => ({
            id: d.id,
            type: d.type,
            title: d.title,
            status: d.status,
        }));
        const touchpointInfos = touchpoints.map(t => ({
            id: t.id,
            type: t.type,
            followupDate: t.followupDate,
            outcome: t.outcome,
            sentiment: t.sentiment || null,
        }));
        const recommendedContent = this.generateContent(patientInfo, demandInfos);
        const optimalTime = this.calculateOptimalTime(patientInfo, touchpointInfos);
        const seasonalAdjustment = this.getSeasonalAdjustment();
        const confidence = this.calculateConfidence(patientInfo, demandInfos);
        const reasons = this.generateReasons(patientInfo, demandInfos, seasonalAdjustment);
        return {
            recommendedContent,
            optimalTime,
            seasonalAdjustment,
            confidence,
            reasons,
        };
    }
    calculateAge(birthDate) {
        if (!birthDate)
            return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    generateContent(patient, demands) {
        const contents = [];
        if (patient.age > 0 && patient.age < 30) {
            contents.push('保持口腔卫生，定期检查，预防龋齿');
            contents.push('建议每半年进行一次口腔检查');
        }
        else if (patient.age >= 30 && patient.age < 50) {
            contents.push('注意牙周健康，建议每半年洗牙');
            contents.push('定期检查牙龈出血、牙结石等问题');
        }
        else if (patient.age >= 50) {
            contents.push('定期复查，预防牙周疾病');
            contents.push('注意牙齿敏感、牙龈萎缩等问题');
        }
        else {
            contents.push('建议每半年进行一次口腔检查');
        }
        const treatmentTypes = demands.map(d => d.type);
        if (treatmentTypes.includes('IMPLANT')) {
            const implantDemand = demands.find(d => d.type === 'IMPLANT');
            contents.push('种植牙复查：建议术后6个月进行X光检查');
            if (implantDemand) {
                contents.push(`针对您的种植牙需求（${implantDemand.title}），请按时复查`);
            }
        }
        if (treatmentTypes.includes('ORTHODONTICS')) {
            contents.push('正畸复查：按时更换保持器，遵医嘱调整');
            contents.push('注意口腔卫生，避免矫正器损坏');
        }
        if (treatmentTypes.includes('WHITENING')) {
            contents.push('美白治疗后注意：短期内避免染色食物和饮料');
            contents.push('使用美白牙膏维护效果');
        }
        if (treatmentTypes.includes('PERIODONTAL')) {
            contents.push('牙周治疗后请按时复诊，监测牙周恢复情况');
            contents.push('加强口腔清洁，使用牙线或漱口水');
        }
        if (treatmentTypes.includes('RESTORATION')) {
            contents.push('修复治疗后注意：避免咬硬物');
            contents.push('如有不适及时就诊');
        }
        if (patient.allergyHistory) {
            contents.push(`注意过敏史：${patient.allergyHistory}，治疗前请告知医生`);
        }
        if (patient.pastHistory) {
            contents.push(`既往史提醒：${patient.pastHistory}`);
        }
        if (patient.tier === 'HIGH_VALUE') {
            contents.push('作为我们的高价值患者，我们将为您提供专属随访服务');
        }
        return [...new Set(contents)];
    }
    calculateOptimalTime(patient, touchpoints) {
        if (touchpoints.length === 0) {
            return '10:00-11:00';
        }
        const hourStats = {};
        for (const tp of touchpoints) {
            if (tp.followupDate) {
                const hour = new Date(tp.followupDate).getHours();
                if (!hourStats[hour]) {
                    hourStats[hour] = { total: 0, responded: 0 };
                }
                hourStats[hour].total++;
                if (tp.outcome) {
                    hourStats[hour].responded++;
                }
            }
        }
        let bestHour = 10;
        let bestRate = 0;
        for (const [hour, stats] of Object.entries(hourStats)) {
            if (stats.total >= 2) {
                const rate = stats.responded / stats.total;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestHour = parseInt(hour);
                }
            }
        }
        return `${bestHour.toString().padStart(2, '0')}:00-${(bestHour + 1).toString().padStart(2, '0')}:00`;
    }
    getSeasonalAdjustment() {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();
        if (month === 0 && day >= 1 && day <= 3) {
            return { festival: '元旦', topic: '新年新气象，口腔健康从齿开始' };
        }
        if (month === 1 && day >= 14 && day <= 16) {
            return { festival: '春节', topic: '春节期间注意口腔卫生，健康过大年' };
        }
        if (month === 3 && day >= 1 && day <= 5) {
            return { festival: '清明节', topic: '清明养生，口腔健康' };
        }
        if (month === 4 && day >= 1 && day <= 5) {
            return { festival: '劳动节', topic: '劳动最光荣，健康好生活' };
        }
        if (month === 8 && day >= 10 && day <= 12) {
            return { festival: '教师节', topic: '感恩教师，健康口腔' };
        }
        if (month === 9 && day >= 1 && day <= 8) {
            return { festival: '国庆节', topic: '国庆假期，注意口腔健康' };
        }
        if (month >= 2 && month <= 4) {
            return { topic: '春季养生，养龈护齿' };
        }
        if (month >= 5 && month <= 7) {
            return { topic: '夏季清爽口腔护理指南' };
        }
        if (month >= 8 && month <= 10) {
            return { topic: '秋季进补，口腔先行' };
        }
        return { topic: '冬季暖心护齿指南' };
    }
    calculateConfidence(patient, demands) {
        let confidence = 0.5;
        if (demands.length > 0)
            confidence += 0.1;
        if (demands.length >= 3)
            confidence += 0.1;
        if (patient.birthDate)
            confidence += 0.1;
        if (patient.allergyHistory)
            confidence += 0.05;
        if (patient.pastHistory)
            confidence += 0.05;
        return Math.min(confidence, 0.95);
    }
    generateReasons(patient, demands, seasonal) {
        const reasons = [];
        if (demands.length > 0) {
            reasons.push(`您有 ${demands.length} 条治疗历史，基于此为您推荐`);
        }
        if (patient.age > 0) {
            const ageGroup = patient.age < 30 ? '青年' : patient.age < 50 ? '中年' : '中老年';
            reasons.push(`针对${ageGroup}患者的口腔护理特点`);
        }
        reasons.push(seasonal.topic);
        return reasons;
    }
};
exports.FollowupRecommendationService = FollowupRecommendationService;
exports.FollowupRecommendationService = FollowupRecommendationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FollowupRecommendationService);
//# sourceMappingURL=followup-recommendation.service.js.map