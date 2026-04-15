import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MiniMaxProvider } from '../../ai/services/llm.service';
import { TagSource, TagStatus } from '@prisma/client';
import { TagSuggestion } from '../portrait.interfaces';

@Injectable()
export class AiTaggingService {
  constructor(private prisma: PrismaService, private llmProvider: MiniMaxProvider) {}

  async analyzePatient(patientId: string): Promise<TagSuggestion[]> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { patientTags: { where: { status: 'ACTIVE' } }, touchpoints: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });

    if (!patient) return [];

    const prompt = `你是医疗 CRM 的患者分析专家。根据患者画像数据，分析并生成标签建议。

患者数据：
- 生命周期阶段: ${patient.lifecycleStage}
- 最近到诊: ${patient.lastVisitAt?.toISOString() || '无'}
- 累计到诊: ${patient.totalVisits}次
- 累计消费: ¥${Number(patient.totalAmount || 0)}
- 当前标签: ${patient.patientTags.map(t => t.tagName).join(', ') || '无'}
- 最近触点: ${patient.touchpoints.map(t => t.title).join(', ') || '无'}

输出格式（JSON）：
{
  "suggestions": [
    { "tagCode": "xxx", "tagName": "xxx", "confidence": 0.85, "reason": "因为..." }
  ]
}`;

    try {
      const response = await this.llmProvider.generate(prompt);
      const parsed = JSON.parse(response.content);
      const suggestions: TagSuggestion[] = parsed.suggestions || [];

      for (const suggestion of suggestions) {
        const status = suggestion.confidence >= 0.8 ? TagStatus.ACTIVE : suggestion.confidence >= 0.5 ? TagStatus.PENDING : null;
        if (status) {
          await this.prisma.patientTag.upsert({
            where: { patientId_tagCode: { patientId, tagCode: suggestion.tagCode } },
            update: { status },
            create: {
              patientId, tagCode: suggestion.tagCode, tagName: suggestion.tagName, category: 'BEHAVIOR',
              source: TagSource.AI, generatedBy: 'ai', confidence: suggestion.confidence, status,
              expiredAt: status === 'ACTIVE' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
            }
          });
        }
      }
      return suggestions;
    } catch (error) {
      console.error('AI tagging failed:', error);
      return [];
    }
  }
}