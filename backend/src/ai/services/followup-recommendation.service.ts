import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Logger } from '../../common/logger';
import { LlmService } from './llm.service';

export interface FollowupRecommendation {
  recommendedContent: string[];
  optimalTime: string;
  seasonalAdjustment?: {
    festival?: string;
    topic: string;
  };
  confidence: number;
  reasons: string[];
}

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  birthDate: Date | null;
  allergyHistory: string | null;
  pastHistory: string | null;
  tier: string;
}

interface DemandInfo {
  id: string;
  type: string;
  title: string;
  status: string;
}

interface TouchpointInfo {
  id: string;
  type: string;
  followupDate: Date | null;
  outcome: string | null;
  sentiment: string | null;
}

@Injectable()
export class FollowupRecommendationService {
  private logger = new Logger('FollowupRecommendationService');

  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  async getRecommendation(patientId: string, orgId: string): Promise<FollowupRecommendation | null> {
    this.logger.log(`Getting followup recommendation for patient ${patientId}`);

    // Fetch patient info
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      this.logger.warn(`Patient ${patientId} not found`);
      return null;
    }

    // Fetch patient's demands (treatment history)
    const demands = await this.prisma.demand.findMany({
      where: { patientId, orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch recent touchpoints for response rate analysis
    const touchpoints = await this.prisma.touchpoint.findMany({
      where: { patientId, orgId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Build patient info
    const patientInfo: PatientInfo = {
      id: patient.id,
      name: patient.name,
      age: this.calculateAge(patient.birthDate),
      birthDate: patient.birthDate,
      allergyHistory: patient.allergyHistory,
      pastHistory: patient.pastHistory,
      tier: patient.tier,
    };

    const demandInfos: DemandInfo[] = demands.map(d => ({
      id: d.id,
      type: d.type,
      title: d.title,
      status: d.status,
    }));

    const touchpointInfos: TouchpointInfo[] = touchpoints.map(t => ({
      id: t.id,
      type: t.type,
      followupDate: t.followupDate,
      outcome: t.outcome,
      sentiment: t.sentiment || null,
    }));

    // Try LLM first, fallback to rules engine
    process.stderr.write(`[DEBUG] LLM isAvailable: ${this.llmService.isAvailable}\n`);
    if (this.llmService.isAvailable) {
      try {
        this.logger.debug(`Calling LLM for patient ${patientId}...`);
        const llmResult = await this.llmService.generateFollowupRecommendation({
          patientId: patient.id,
          patientName: patient.name,
          age: this.calculateAge(patient.birthDate),
          tier: patient.tier,
          allergyHistory: patient.allergyHistory,
          pastHistory: patient.pastHistory,
          demands: demandInfos,
          touchpoints: touchpointInfos,
        });

        if (llmResult) {
          this.logger.log(`LLM recommendation for patient ${patientId}: confidence=${llmResult.confidence}`);
          return llmResult;
        }
      } catch (err) {
        this.logger.warn(`LLM recommendation failed, falling back to rules: ${(err as Error).message}`);
      }
    }

    // Fallback: rules-based engine
    this.logger.log(`Using rules engine for patient ${patientId}`);
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

  private calculateAge(birthDate: Date | null): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private generateContent(patient: PatientInfo, demands: DemandInfo[]): string[] {
    const contents: string[] = [];

    // 1. 基于年龄段的建议
    if (patient.age > 0 && patient.age < 30) {
      contents.push('保持口腔卫生，定期检查，预防龋齿');
      contents.push('建议每半年进行一次口腔检查');
    } else if (patient.age >= 30 && patient.age < 50) {
      contents.push('注意牙周健康，建议每半年洗牙');
      contents.push('定期检查牙龈出血、牙结石等问题');
    } else if (patient.age >= 50) {
      contents.push('定期复查，预防牙周疾病');
      contents.push('注意牙齿敏感、牙龈萎缩等问题');
    } else {
      // Unknown age - general recommendation
      contents.push('建议每半年进行一次口腔检查');
    }

    // 2. 基于治疗类型
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

    // 3. 基于过敏史
    if (patient.allergyHistory) {
      contents.push(`注意过敏史：${patient.allergyHistory}，治疗前请告知医生`);
    }

    // 4. 基于既往史
    if (patient.pastHistory) {
      contents.push(`既往史提醒：${patient.pastHistory}`);
    }

    // 5. 基于患者等级
    if (patient.tier === 'HIGH_VALUE') {
      contents.push('作为我们的高价值患者，我们将为您提供专属随访服务');
    }

    return [...new Set(contents)]; // Remove duplicates
  }

  private calculateOptimalTime(patient: PatientInfo, touchpoints: TouchpointInfo[]): string {
    if (touchpoints.length === 0) {
      return '10:00-11:00'; // Default best time
    }

    // Analyze response rate by hour based on followupDate
    const hourStats: Record<number, { total: number; responded: number }> = {};

    for (const tp of touchpoints) {
      if (tp.followupDate) {
        const hour = new Date(tp.followupDate).getHours();
        if (!hourStats[hour]) {
          hourStats[hour] = { total: 0, responded: 0 };
        }
        hourStats[hour].total++;
        // If there's an outcome, it was responded
        if (tp.outcome) {
          hourStats[hour].responded++;
        }
      }
    }

    // Find best responding hour
    let bestHour = 10;
    let bestRate = 0;

    for (const [hour, stats] of Object.entries(hourStats)) {
      if (stats.total >= 2) { // Only consider hours with enough data
        const rate = stats.responded / stats.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestHour = parseInt(hour);
        }
      }
    }

    return `${bestHour.toString().padStart(2, '0')}:00-${(bestHour + 1).toString().padStart(2, '0')}:00`;
  }

  private getSeasonalAdjustment(): { festival?: string; topic: string } {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // 节日检测（简化版）
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

    // 季节性主题
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

  private calculateConfidence(patient: PatientInfo, demands: DemandInfo[]): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    if (demands.length > 0) confidence += 0.1;
    if (demands.length >= 3) confidence += 0.1;
    if (patient.birthDate) confidence += 0.1;
    if (patient.allergyHistory) confidence += 0.05;
    if (patient.pastHistory) confidence += 0.05;

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private generateReasons(
    patient: PatientInfo,
    demands: DemandInfo[],
    seasonal: { festival?: string; topic: string }
  ): string[] {
    const reasons: string[] = [];

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
}
