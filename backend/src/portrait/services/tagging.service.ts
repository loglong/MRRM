import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TagCategory, TagSource, TagStatus } from '@prisma/client';
import { TagCondition, TagSuggestion } from '../portrait.interfaces';

@Injectable()
export class TaggingService {
  constructor(private prisma: PrismaService) {}

  async evaluateCondition(condition: TagCondition, patient: any): Promise<boolean> {
    if (condition.and) return condition.and.every(c => this.evaluateCondition(c, patient));
    if (condition.or) return condition.or.some(c => this.evaluateCondition(c, patient));

    const { field, operator, value } = condition;
    let fieldValue = patient[field];

    if (typeof value === 'string' && value.startsWith('now-')) {
      const days = parseInt(value.replace('now-', '').replace('d', ''));
      fieldValue = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    switch (operator) {
      case 'eq': return fieldValue === value;
      case 'ne': return fieldValue !== value;
      case 'gt': return fieldValue > value;
      case 'gte': return fieldValue >= value;
      case 'lt': return fieldValue < value;
      case 'lte': return fieldValue <= value;
      case 'in': return value.includes(fieldValue);
      case 'notIn': return !value.includes(fieldValue);
      default: return false;
    }
  }

  async processRules(patientId: string): Promise<TagSuggestion[]> {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return [];

    const rules = await this.prisma.tagRule.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { priority: 'desc' }
    });

    const matchedTags: TagSuggestion[] = [];

    for (const rule of rules) {
      const condition = rule.condition as unknown as TagCondition;
      if (await this.evaluateCondition(condition, patient)) {
        await this.prisma.patientTag.upsert({
          where: { patientId_tagCode: { patientId, tagCode: rule.code } },
          update: { status: TagStatus.ACTIVE, expiredAt: rule.expireDays ? new Date(Date.now() + rule.expireDays * 24 * 60 * 60 * 1000) : null },
          create: {
            patientId, tagCode: rule.code, tagName: rule.name, category: rule.category,
            source: TagSource.AUTO, generatedBy: 'system', confidence: 1.0,
            status: TagStatus.ACTIVE,
            expiredAt: rule.expireDays ? new Date(Date.now() + rule.expireDays * 24 * 60 * 60 * 1000) : null
          }
        });
        matchedTags.push({ tagCode: rule.code, tagName: rule.name, source: TagSource.AUTO, confidence: 1.0, reason: `Rule "${rule.name}" matched` });
      }
    }

    return matchedTags;
  }

  async addManualTag(patientId: string, tagCode: string, tagName: string, category: TagCategory) {
    return this.prisma.patientTag.upsert({
      where: { patientId_tagCode: { patientId, tagCode } },
      update: { status: TagStatus.ACTIVE, source: TagSource.MANUAL },
      create: { patientId, tagCode, tagName, category, source: TagSource.MANUAL, generatedBy: 'user', status: TagStatus.ACTIVE }
    });
  }

  async expireOldTags() {
    const now = new Date();
    return this.prisma.patientTag.updateMany({
      where: { status: TagStatus.ACTIVE, expiredAt: { lt: now } },
      data: { status: TagStatus.EXPIRED }
    });
  }
}