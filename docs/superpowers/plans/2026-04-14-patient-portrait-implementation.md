# Patient Portrait System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement patient portrait system with lifecycle management, behavior tags, RFM analysis, and AI-powered patient insights

**Architecture:**
- Phase 1: Extend Patient table with RFM, behavior stats, lifecycle, and AI score fields
- Phase 2: Create PatientTag, TagRule, ScoreHistory tables and basic auto-tagging
- Phase 3: Implement AI tagging integration (Clawith)
- Phase 4: Build score calculation engine (RFM, churn risk)
- Phase 5: HIS data sync via webhook

**Tech Stack:** NestJS, Prisma, PostgreSQL, Clawith AI Agent

---

## File Structure

```
backend/
├── prisma/
│   └── schema.prisma                    # Add new enums and fields to existing Patient, add new models
├── src/
│   ├── patients/
│   │   ├── dto/
│   │   │   ├── update-patient-stats.dto.ts    # NEW: DTO for updating patient stats
│   │   │   └── patient-profile.dto.ts         # NEW: Response DTO for patient profile
│   │   ├── patients.service.ts          # MODIFY: Add lifecycle, tag, score methods
│   │   └── patients.controller.ts      # MODIFY: Add new endpoints
│   ├── portrait/                       # NEW: New module for portrait system
│   │   ├── portrait.module.ts
│   │   ├── services/
│   │   │   ├── tagging.service.ts      # NEW: Rule engine + AI tagging
│   │   │   ├── lifecycle.service.ts    # NEW: Lifecycle stage management
│   │   │   ├── score-calculator.service.ts  # NEW: RFM and score calculations
│   │   │   └── ai-tagging.service.ts   # NEW: Clawith AI integration
│   │   ├── listeners/                   # NEW: Event listeners for real-time processing
│   │   │   └── patient-event.listener.ts
│   │   ├── schedulers/                  # NEW: Batch job schedulers
│   │   │   └── portrait-batch.scheduler.ts
│   │   └── interfaces/
│   │       └── portrait.interface.ts    # NEW: Type definitions
│   ├── tags/
│   │   ├── tags.module.ts               # NEW: Tag management module
│   │   ├── tags.controller.ts           # NEW
│   │   ├── tags.service.ts              # NEW
│   │   └── entities/
│   │       ├── patient-tag.entity.ts    # NEW
│   │       └── tag-rule.entity.ts       # NEW
│   └── integration/
│       └── webhook.service.ts           # MODIFY: Add HIS sync endpoint
```

---

## Task 1: Prisma Schema Extension - Phase 1

**Files:**
- Modify: `backend/prisma/schema.prisma:207-252`

- [ ] **Step 1: Add LifecycleStage enum and Tag enums to schema**

```prisma
// Add after PatientTier enum (line 272)

enum LifecycleStage {
  DEVELOPMENT
  PRE_TREATMENT
  TREATMENT
  MAINTENANCE
}

enum TagCategory {
  BEHAVIOR
  VALUE
  PREFERENCE
  STATUS
  CUSTOM
}

enum TagSource {
  AUTO
  MANUAL
  AI
}

enum TagStatus {
  ACTIVE
  PENDING
  EXPIRED
}

enum RuleStatus {
  ACTIVE
  INACTIVE
}
```

- [ ] **Step 2: Add fields to Patient model**

```prisma
// Add to Patient model after lastVisitAt field (line 224)

// RFM fields
lastOrderAt        DateTime?  @map("last_order_at")
orderCount         Int        @default(0) @map("order_count")
totalAmount        Decimal    @default(0) @db.Decimal(12,2) @map("total_amount")
avgAmount          Decimal    @default(0) @db.Decimal(12,2) @map("avg_amount")

// Behavior stats
totalVisits        Int        @default(0) @map("total_visits")
lastContactAt      DateTime?  @map("last_contact_at")
touchpointCount    Int        @default(0) @map("touchpoint_count")
avgSatisfaction    Decimal?   @map("avg_satisfaction")

// Lifecycle
lifecycleStage     LifecycleStage @default(DEVELOPMENT) @map("lifecycle_stage")
stageEnteredAt     DateTime   @default(now()) @map("stage_entered_at")
stageUpdatedAt     DateTime   @updatedAt @map("stage_updated_at")

// AI scores (0-100)
churnRiskScore     Decimal    @default(0) @map("churn_risk_score")
engagementScore    Decimal    @default(0) @map("engagement_score")
valueScore         Decimal    @default(0) @map("value_score")
aiRecommendation   String?    @map("ai_recommendation")

// Add relation
tags               PatientTag[]
```

- [ ] **Step 3: Add PatientTag model**

```prisma
// Add after Patient model (around line 252)

model PatientTag {
  id          String      @id @default(uuid())
  patientId   String      @map("patient_id")
  tagCode     String      @map("tag_code")
  tagName     String      @map("tag_name")
  category    TagCategory

  source      TagSource   // AUTO | MANUAL | AI
  generatedBy String?     @map("generated_by")
  confidence  Decimal?    @default(1)

  status      TagStatus   @default(ACTIVE)       // ACTIVE | PENDING | EXPIRED
  expiredAt   DateTime?   @map("expired_at")
  createdAt   DateTime    @default(now()) @map("created_at")

  patient     Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@unique([patientId, tagCode])
  @@index([patientId, category])
  @@index([status, expiredAt])
  @@map("patient_tags")
}
```

- [ ] **Step 4: Add TagRule model**

```prisma
model TagRule {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique
  category    TagCategory
  condition   Json     // Rule condition in JSON format
  priority    Int      @default(0)
  status      RuleStatus @default(ACTIVE)
  autoGenerate Boolean @default(true) @map("auto_generate")
  expireDays  Int?     @map("expire_days")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([status, priority])
  @@map("tag_rules")
}
```

- [ ] **Step 5: Add ScoreHistory model**

```prisma
model ScoreHistory {
  id          String    @id @default(uuid())
  patientId   String    @map("patient_id")
  scoreType   String    @map("score_type")  // churn_risk | engagement | value
  oldValue    Decimal?  @map("old_value")
  newValue    Decimal   @map("new_value")
  reason      String?
  calculatedBy String    @map("calculated_by")  // system | ai
  createdAt   DateTime  @default(now()) @map("created_at")

  @@index([patientId, scoreType, createdAt])
  @@map("score_history")
}
```

- [ ] **Step 6: Generate Prisma client**

Run: `cd backend && npx prisma generate`
Expected: Generated new client with updated schema

- [ ] **Step 7: Run migration**

Run: `cd backend && npx prisma migrate dev --name add_patient_portrait_fields`
Expected: Migration applied successfully

- [ ] **Step 8: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "feat: add patient portrait fields to schema

- LifecycleStage, TagCategory, TagSource, TagStatus, RuleStatus enums
- Patient: lastOrderAt, orderCount, totalAmount, avgAmount, totalVisits,
  lastContactAt, touchpointCount, avgSatisfaction, lifecycleStage,
  stageEnteredAt, stageUpdatedAt, churnRiskScore, engagementScore,
  valueScore, aiRecommendation
- PatientTag, TagRule, ScoreHistory models

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Create TagRule Seed Data

**Files:**
- Create: `backend/prisma/seed-tag-rules.ts`

- [ ] **Step 1: Create seed file with predefined tag rules**

```typescript
import { PrismaClient, TagCategory, RuleStatus } from '@prisma/client';

const prisma = new PrismaClient();

const tagRules = [
  {
    name: '30天未到诊',
    code: 'inactive_30d',
    category: TagCategory.BEHAVIOR,
    condition: {
      and: [
        { field: 'lastVisitAt', operator: 'lt', value: 'now-30d' },
        { field: 'lifecycleStage', operator: 'in', value: ['TREATMENT', 'MAINTENANCE'] }
      ]
    },
    priority: 1,
    autoGenerate: true,
    expireDays: 30,
    status: RuleStatus.ACTIVE
  },
  {
    name: '90天未到诊',
    code: 'inactive_90d',
    category: TagCategory.BEHAVIOR,
    condition: {
      and: [
        { field: 'lastVisitAt', operator: 'lt', value: 'now-90d' },
        { field: 'lifecycleStage', operator: 'in', value: ['TREATMENT', 'MAINTENANCE'] }
      ]
    },
    priority: 1,
    autoGenerate: true,
    expireDays: 90,
    status: RuleStatus.ACTIVE
  },
  {
    name: '高频到诊',
    code: 'high_frequency',
    category: TagCategory.BEHAVIOR,
    condition: {
      and: [
        { field: 'totalVisits', operator: 'gte', value: 5 },
        { field: 'lastVisitAt', operator: 'lt', value: 'now-7d' }
      ]
    },
    priority: 2,
    autoGenerate: true,
    status: RuleStatus.ACTIVE
  },
  {
    name: '高价值',
    code: 'high_value',
    category: TagCategory.VALUE,
    condition: {
      or: [
        { field: 'totalAmount', operator: 'gte', value: 10000 },
        { and: [
          { field: 'totalAmount', operator: 'gte', value: 5000 },
          { field: 'orderCount', operator: 'gte', value: 3 }
        ]}
      ]
    },
    priority: 1,
    autoGenerate: true,
    status: RuleStatus.ACTIVE
  },
  {
    name: 'VIP客户',
    code: 'vip',
    category: TagCategory.VALUE,
    condition: { field: 'totalAmount', operator: 'gte', value: 50000 },
    priority: 1,
    autoGenerate: true,
    status: RuleStatus.ACTIVE
  },
  {
    name: '新患者',
    code: 'new_patient',
    category: TagCategory.STATUS,
    condition: { field: 'totalVisits', operator: 'eq', value: 0 },
    priority: 1,
    autoGenerate: true,
    status: RuleStatus.ACTIVE
  },
  {
    name: '复诊患者',
    code: 'returning',
    category: TagCategory.STATUS,
    condition: { field: 'totalVisits', operator: 'gt', value: 0 },
    priority: 2,
    autoGenerate: true,
    status: RuleStatus.ACTIVE
  }
];

async function main() {
  for (const rule of tagRules) {
    await prisma.tagRule.upsert({
      where: { code: rule.code },
      update: rule,
      create: rule
    });
    console.log(`Seeded tag rule: ${rule.name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Add seed script to package.json**

Modify: `backend/package.json` - add to scripts:
```json
"seed:tag-rules": "ts-node prisma/seed-tag-rules.ts"
```

- [ ] **Step 3: Run seed**

Run: `cd backend && npm run seed:tag-rules`
Expected: Seeded 7 tag rules

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seed-tag-rules.ts backend/package.json
git commit -m "feat: add tag rules seed data

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Create Portrait Module Structure

**Files:**
- Create: `backend/src/portrait/portrait.module.ts`
- Create: `backend/src/portrait/portrait.interfaces.ts`
- Create: `backend/src/portrait/services/lifecycle.service.ts`
- Create: `backend/src/portrait/services/tagging.service.ts`
- Create: `backend/src/portrait/services/score-calculator.service.ts`
- Create: `backend/src/portrait/services/ai-tagging.service.ts`
- Create: `backend/src/portrait/listeners/patient-event.listener.ts`

- [ ] **Step 1: Create portrait.interfaces.ts**

```typescript
import { LifecycleStage, TagCategory, TagSource, TagStatus } from '@prisma/client';

export interface PatientPortrait {
  patientId: string;
  lifecycle: {
    stage: LifecycleStage;
    enteredAt: Date;
    updatedAt: Date;
  };
  rfm: {
    lastOrderAt: Date | null;
    orderCount: number;
    totalAmount: number;
    avgAmount: number;
  };
  stats: {
    totalVisits: number;
    lastContactAt: Date | null;
    touchpointCount: number;
    avgSatisfaction: number | null;
  };
  scores: {
    churnRisk: number;
    engagement: number;
    value: number;
  };
  aiRecommendation: string | null;
}

export interface TagCondition {
  and?: TagCondition[];
  or?: TagCondition[];
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';
  value: any;
}

export interface TagSuggestion {
  tagCode: string;
  tagName: string;
  source: TagSource;
  confidence: number;
  reason: string;
}

export enum PortraitEvent {
  VISIT_COMPLETED = 'VISIT_COMPLETED',
  TOUCHPOINT_CREATED = 'TOUCHPOINT_CREATED',
  DEMAND_STATUS_CHANGED = 'DEMAND_STATUS_CHANGED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PATIENT_CREATED = 'PATIENT_CREATED'
}
```

- [ ] **Step 2: Create lifecycle.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LifecycleStage } from '@prisma/client';

@Injectable()
export class LifecycleService {
  constructor(private prisma: PrismaService) {}

  async checkAndAdvanceLifecycle(patientId: string): Promise<LifecycleStage | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        demands: { orderBy: { createdAt: 'desc' }, take: 1 },
        pathInstances: { where: { status: 'IN_PROGRESS' }, take: 1 }
      }
    });

    if (!patient) return null;

    const currentStage = patient.lifecycleStage;
    let newStage: LifecycleStage | null = null;

    // Check upgrade rules
    if (currentStage === 'DEVELOPMENT') {
      const hasTreatmentDemand = patient.demands.some(
        d => d.type === 'TREATMENT' && ['IN_PROGRESS', 'FULFILLED'].includes(d.status)
      );
      if (hasTreatmentDemand) newStage = 'PRE_TREATMENT';
    }

    if (currentStage === 'PRE_TREATMENT') {
      const hasActivePath = patient.pathInstances.length > 0;
      if (hasActivePath && patient.preTreatmentStartDate) newStage = 'TREATMENT';
    }

    if (currentStage === 'TREATMENT') {
      if (patient.treatmentEndDate) {
        const daysSinceEnd = (Date.now() - patient.treatmentEndDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceEnd >= 90) newStage = 'MAINTENANCE';
      }
    }

    // Check downgrade rules
    if (newStage === null && currentStage !== 'DEVELOPMENT') {
      const lastContactDays = patient.lastContactAt
        ? (Date.now() - patient.lastContactAt.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      if (lastContactDays > 60) {
        const cancelledDemand = patient.demands.some(d => ['CANCELLED', 'LOST'].includes(d.status));
        if (cancelledDemand) newStage = 'DEVELOPMENT';
      }
    }

    if (newStage && newStage !== currentStage) {
      await this.prisma.patient.update({
        where: { id: patientId },
        data: {
          lifecycleStage: newStage,
          stageEnteredAt: new Date(),
          stageUpdatedAt: new Date()
        }
      });
      return newStage;
    }

    return null;
  }

  async getLifecycleStage(patientId: string): Promise<LifecycleStage> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { lifecycleStage: true }
    });
    return patient?.lifecycleStage || 'DEVELOPMENT';
  }
}
```

- [ ] **Step 3: Create tagging.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TagCategory, TagSource, TagStatus, TagRule } from '@prisma/client';
import { TagCondition, TagSuggestion } from '../portrait.interfaces';

@Injectable()
export class TaggingService {
  constructor(private prisma: PrismaService) {}

  async evaluateCondition(condition: TagCondition, patient: any): Promise<boolean> {
    if (condition.and) {
      return condition.and.every(c => this.evaluateCondition(c, patient));
    }
    if (condition.or) {
      return condition.or.some(c => this.evaluateCondition(c, patient));
    }

    const { field, operator, value } = condition;
    let fieldValue = patient[field];

    // Handle date comparisons
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
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient) return [];

    const rules = await this.prisma.tagRule.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { priority: 'desc' }
    });

    const matchedTags: TagSuggestion[] = [];

    for (const rule of rules) {
      const condition = rule.condition as unknown as TagCondition;
      if (this.evaluateCondition(condition, patient)) {
        // Check if tag already exists
        const existingTag = await this.prisma.patientTag.findUnique({
          where: { patientId_tagCode: { patientId, tagCode: rule.code } }
        });

        if (!existingTag || existingTag.status === 'EXPIRED') {
          matchedTags.push({
            tagCode: rule.code,
            tagName: rule.name,
            source: TagSource.AUTO,
            confidence: 1.0,
            reason: `Rule "${rule.name}" matched`
          });

          // Create or reactivate tag
          await this.prisma.patientTag.upsert({
            where: {
              patientId_tagCode: { patientId, tagCode: rule.code }
            },
            update: {
              status: TagStatus.ACTIVE,
              expiredAt: rule.expireDays
                ? new Date(Date.now() + rule.expireDays * 24 * 60 * 60 * 1000)
                : null
            },
            create: {
              patientId,
              tagCode: rule.code,
              tagName: rule.name,
              category: rule.category,
              source: TagSource.AUTO,
              generatedBy: 'system',
              confidence: 1.0,
              status: TagStatus.ACTIVE,
              expiredAt: rule.expireDays
                ? new Date(Date.now() + rule.expireDays * 24 * 60 * 60 * 1000)
                : null
            }
          });
        }
      }
    }

    return matchedTags;
  }

  async addManualTag(patientId: string, tagCode: string, tagName: string, category: TagCategory) {
    return this.prisma.patientTag.upsert({
      where: { patientId_tagCode: { patientId, tagCode } },
      update: { status: TagStatus.ACTIVE, source: TagSource.MANUAL },
      create: {
        patientId,
        tagCode,
        tagName,
        category,
        source: TagSource.MANUAL,
        generatedBy: 'user',
        status: TagStatus.ACTIVE
      }
    });
  }

  async confirmAiTag(tagId: string) {
    return this.prisma.patientTag.update({
      where: { id: tagId },
      data: { status: TagStatus.ACTIVE }
    });
  }

  async expireOldTags() {
    const now = new Date();
    return this.prisma.patientTag.updateMany({
      where: {
        status: TagStatus.ACTIVE,
        expiredAt: { lt: now }
      },
      data: { status: TagStatus.EXPIRED }
    });
  }
}
```

- [ ] **Step 4: Create score-calculator.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ScoreCalculatorService {
  constructor(private prisma: PrismaService) {}

  async recalculateRfm(patientId: string): Promise<void> {
    // Get all payments/orders for patient
    const payments = await this.prisma.demand.findMany({
      where: { patientId, actualAmount: { not: null } },
      select: { actualAmount: true, closedAt: true }
    });

    if (payments.length === 0) return;

    const totalAmount = payments.reduce((sum, p) => sum + (p.actualAmount || 0), 0);
    const lastOrderAt = payments
      .filter(p => p.closedAt)
      .sort((a, b) => b.closedAt!.getTime() - a.closedAt!.getTime())[0]?.closedAt;

    await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        orderCount: payments.length,
        totalAmount,
        avgAmount: totalAmount / payments.length,
        lastOrderAt
      }
    });
  }

  async recalculateChurnRisk(patientId: string): Promise<number> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) return 0;

    let score = 0;

    // Days since last visit
    if (patient.lastVisitAt) {
      const daysSinceVisit = (Date.now() - patient.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceVisit > 90) score += 50;
      else if (daysSinceVisit > 60) score += 30;
      else if (daysSinceVisit > 30) score += 10;
    }

    // Days since last contact
    if (patient.lastContactAt) {
      const daysSinceContact = (Date.now() - patient.lastContactAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceContact > 60) score += 30;
      else if (daysSinceContact > 30) score += 15;
    }

    // Lifecycle stage risk
    if (patient.lifecycleStage === 'MAINTENANCE') score += 10;
    if (patient.lifecycleStage === 'DEVELOPMENT') score += 5;

    // Engagement score inverse
    score += Math.max(0, 20 - (patient.engagementScore || 0) / 5);

    score = Math.min(100, Math.max(0, score));

    if (score !== patient.churnRiskScore) {
      await this.prisma.scoreHistory.create({
        data: {
          patientId,
          scoreType: 'churn_risk',
          oldValue: patient.churnRiskScore,
          newValue: score,
          reason: 'Scheduled recalculation',
          calculatedBy: 'system'
        }
      });

      await this.prisma.patient.update({
        where: { id: patientId },
        data: { churnRiskScore: score }
      });
    }

    return score;
  }

  async recalculateEngagement(patientId: string): Promise<number> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) return 0;

    let score = 0;

    // Visit frequency (max 30 points)
    score += Math.min(30, (patient.totalVisits || 0) * 3);

    // Recency (max 40 points)
    if (patient.lastContactAt) {
      const daysSinceContact = (Date.now() - patient.lastContactAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceContact <= 7) score += 40;
      else if (daysSinceContact <= 30) score += 30;
      else if (daysSinceContact <= 60) score += 20;
      else if (daysSinceContact <= 90) score += 10;
    }

    // Satisfaction (max 30 points)
    if (patient.avgSatisfaction) {
      score += (patient.avgSatisfaction / 10) * 30;
    }

    score = Math.min(100, Math.max(0, score));

    await this.prisma.patient.update({
      where: { id: patientId },
      data: { engagementScore: score }
    });

    return score;
  }

  async recalculateValue(patientId: string): Promise<number> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) return 0;

    let score = 0;

    // Total amount (max 40 points)
    const amount = patient.totalAmount || 0;
    if (amount >= 50000) score += 40;
    else if (amount >= 20000) score += 30;
    else if (amount >= 10000) score += 20;
    else if (amount >= 5000) score += 10;

    // Order count (max 30 points)
    const count = patient.orderCount || 0;
    if (count >= 10) score += 30;
    else if (count >= 5) score += 20;
    else if (count >= 3) score += 10;

    // Average amount (max 30 points)
    const avg = patient.avgAmount || 0;
    if (avg >= 5000) score += 30;
    else if (avg >= 2000) score += 20;
    else if (avg >= 1000) score += 10;

    score = Math.min(100, Math.max(0, score));

    await this.prisma.patient.update({
      where: { id: patientId },
      data: { valueScore: score }
    });

    return score;
  }
}
```

- [ ] **Step 5: Create ai-tagging.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LlmService } from '../../ai/services/llm.service';
import { TagSource, TagStatus } from '@prisma/client';
import { TagSuggestion } from '../portrait.interfaces';

@Injectable()
export class AiTaggingService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService
  ) {}

  async analyzePatient(patientId: string): Promise<TagSuggestion[]> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        tags: { where: { status: 'ACTIVE' } },
        touchpoints: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    if (!patient) return [];

    const prompt = `
你是医疗 CRM 的患者分析专家。根据患者画像数据，分析并生成标签建议。

患者数据：
- 生命周期阶段: ${patient.lifecycleStage}
- 最近到诊: ${patient.lastVisitAt?.toISOString() || '无'}
- 累计到诊: ${patient.totalVisits}次
- 累计消费: ¥${patient.totalAmount || 0}
- 当前标签: ${patient.tags.map(t => t.tagName).join(', ') || '无'}
- 最近触点: ${patient.touchpoints.map(t => t.title).join(', ') || '无'}

分析要求：
1. 识别流失风险信号
2. 发现价值提升机会
3. 捕捉行为模式
4. 避免重复已有标签

输出格式（JSON）：
{
  "suggestions": [
    {
      "tagCode": "xxx",
      "tagName": "xxx",
      "confidence": 0.85,
      "reason": "因为..."
    }
  ]
}
`;

    try {
      const result = await this.llmService.generate([
        { role: 'user', content: prompt }
      ]);

      const parsed = JSON.parse(result);
      const suggestions: TagSuggestion[] = parsed.suggestions || [];

      // Create pending tags for AI suggestions
      for (const suggestion of suggestions) {
        if (suggestion.confidence >= 0.8) {
          await this.createAiTag(patientId, suggestion, TagStatus.ACTIVE);
        } else if (suggestion.confidence >= 0.5) {
          await this.createAiTag(patientId, suggestion, TagStatus.PENDING);
        }
      }

      return suggestions;
    } catch (error) {
      console.error('AI tagging failed:', error);
      return [];
    }
  }

  private async createAiTag(patientId: string, suggestion: TagSuggestion, status: TagStatus) {
    await this.prisma.patientTag.upsert({
      where: {
        patientId_tagCode: { patientId, tagCode: suggestion.tagCode }
      },
      update: { status },
      create: {
        patientId,
        tagCode: suggestion.tagCode,
        tagName: suggestion.tagName,
        category: 'BEHAVIOR',
        source: TagSource.AI,
        generatedBy: 'ai',
        confidence: suggestion.confidence,
        status,
        expiredAt: status === 'ACTIVE'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null
      }
    });
  }
}
```

- [ ] **Step 6: Create patient-event.listener.ts**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LifecycleService } from '../services/lifecycle.service';
import { TaggingService } from '../services/tagging.service';
import { ScoreCalculatorService } from '../services/score-calculator.service';
import { PortraitEvent } from '../portrait.interfaces';

@Injectable()
export class PatientEventListener implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private lifecycleService: LifecycleService,
    private taggingService: TaggingService,
    private scoreCalculator: ScoreCalculatorService
  ) {}

  onModuleInit() {
    // Subscribe to Prisma events or use webhook-style triggers
    this.setupTouchpointTrigger();
  }

  private setupTouchpointTrigger() {
    // This would be called from touchpoints.service after creating a touchpoint
  }

  async onVisitCompleted(patientId: string) {
    // Update stats
    await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        totalVisits: { increment: 1 },
        lastVisitAt: new Date(),
        lastContactAt: new Date()
      }
    });

    // Recalculate scores
    await this.scoreCalculator.recalculateEngagement(patientId);
    await this.scoreCalculator.recalculateValue(patientId);

    // Check lifecycle
    await this.lifecycleService.checkAndAdvanceLifecycle(patientId);

    // Run auto-tagging
    await this.taggingService.processRules(patientId);
  }

  async onTouchpointCreated(patientId: string) {
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { lastContactAt: new Date() }
    });

    await this.scoreCalculator.recalculateChurnRisk(patientId);
    await this.taggingService.processRules(patientId);
  }

  async onPaymentCompleted(patientId: string, amount: number) {
    await this.scoreCalculator.recalculateRfm(patientId);
    await this.scoreCalculator.recalculateValue(patientId);
    await this.taggingService.processRules(patientId);
  }

  async onPatientCreated(patientId: string) {
    // Run initial tagging for new patient
    await this.taggingService.processRules(patientId);
  }
}
```

- [ ] **Step 7: Create portrait.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LifecycleService } from './services/lifecycle.service';
import { TaggingService } from './services/tagging.service';
import { ScoreCalculatorService } from './services/score-calculator.service';
import { AiTaggingService } from './services/ai-tagging.service';
import { PatientEventListener } from './listeners/patient-event.listener';
import { LlmService } from '../ai/services/llm.service';

@Module({
  providers: [
    PrismaService,
    LifecycleService,
    TaggingService,
    ScoreCalculatorService,
    AiTaggingService,
    PatientEventListener
  ],
  exports: [
    LifecycleService,
    TaggingService,
    ScoreCalculatorService,
    AiTaggingService,
    PatientEventListener
  ]
})
export class PortraitModule {}
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/portrait/
git commit -m "feat: add portrait module with lifecycle, tagging, and scoring services

- LifecycleService: manages patient lifecycle stage transitions
- TaggingService: rule-based auto-tagging with TagRule evaluation
- ScoreCalculatorService: RFM, churn risk, engagement, value calculations
- AiTaggingService: AI-powered tag suggestions via Clawith
- PatientEventListener: handles real-time events

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Add Patient Profile API

**Files:**
- Modify: `backend/src/patients/patients.controller.ts`
- Create: `backend/src/patients/dto/patient-profile.dto.ts`
- Create: `backend/src/patients/dto/update-patient-stats.dto.ts`

- [ ] **Step 1: Create DTOs**

```typescript
// patient-profile.dto.ts
export class PatientProfileResponseDto {
  id: string;
  name: string;
  phone: string;
  lifecycle: {
    stage: string;
    enteredAt: Date;
    updatedAt: Date;
  };
  rfm: {
    lastOrderAt: Date | null;
    orderCount: number;
    totalAmount: number;
    avgAmount: number;
  };
  stats: {
    totalVisits: number;
    lastContactAt: Date | null;
    touchpointCount: number;
    avgSatisfaction: number | null;
  };
  scores: {
    churnRisk: number;
    engagement: number;
    value: number;
  };
  tags: Array<{
    code: string;
    name: string;
    category: string;
    source: string;
    confidence: number | null;
    status: string;
  }>;
  aiRecommendation: string | null;
}
```

- [ ] **Step 2: Update patients.controller.ts - add new endpoints**

Add to `PatientsController`:

```typescript
@Get(':id/profile')
async getPatientProfile(@Param('id') id: string): Promise<PatientProfileResponseDto> {
  const patient = await this.patientsService.getPatientPortrait(id);
  return patient;
}

@Get(':id/tags')
async getPatientTags(
  @Param('id') id: string,
  @Query('category') category?: string,
  @Query('status') status?: string
) {
  return this.patientsService.getPatientTags(id, category, status);
}

@Post(':id/tags')
async addPatientTag(
  @Param('id') id: string,
  @Body() body: { tagCode: string; tagName: string; category: string }
) {
  return this.patientsService.addManualTag(id, body.tagCode, body.tagName, body.category);
}

@Patch(':id/tags/:tagId')
async updateTagStatus(
  @Param('tagId') tagId: string,
  @Body() body: { status: string }
) {
  return this.patientsService.updateTagStatus(tagId, body.status);
}

@Post(':id/analyze')
async triggerAiAnalysis(@Param('id') id: string) {
  return this.patientsService.triggerAiAnalysis(id);
}
```

- [ ] **Step 3: Update patients.service.ts - add new methods**

Add to `PatientsService`:

```typescript
import { PortraitModule } from '../portrait/portrait.module';
import { LifecycleService, TaggingService, ScoreCalculatorService, AiTaggingService } from '../portrait/portrait.module';

async getPatientPortrait(patientId: string): Promise<PatientProfileResponseDto> {
  const patient = await this.prisma.patient.findUnique({
    where: { id: patientId },
    include: { tags: { where: { status: 'ACTIVE' } } }
  });

  return {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    lifecycle: {
      stage: patient.lifecycleStage,
      enteredAt: patient.stageEnteredAt,
      updatedAt: patient.stageUpdatedAt
    },
    rfm: {
      lastOrderAt: patient.lastOrderAt,
      orderCount: patient.orderCount,
      totalAmount: Number(patient.totalAmount),
      avgAmount: Number(patient.avgAmount)
    },
    stats: {
      totalVisits: patient.totalVisits,
      lastContactAt: patient.lastContactAt,
      touchpointCount: patient.touchpointCount,
      avgSatisfaction: patient.avgSatisfaction ? Number(patient.avgSatisfaction) : null
    },
    scores: {
      churnRisk: Number(patient.churnRiskScore),
      engagement: Number(patient.engagementScore),
      value: Number(patient.valueScore)
    },
    tags: patient.tags.map(t => ({
      code: t.tagCode,
      name: t.tagName,
      category: t.category,
      source: t.source,
      confidence: t.confidence ? Number(t.confidence) : null,
      status: t.status
    })),
    aiRecommendation: patient.aiRecommendation
  };
}

async getPatientTags(patientId: string, category?: string, status?: string) {
  const where: any = { patientId };
  if (category) where.category = category;
  if (status) where.status = status;

  return this.prisma.patientTag.findMany({ where });
}

async addManualTag(patientId: string, tagCode: string, tagName: string, category: string) {
  const taggingService = new TaggingService(this.prisma);
  return taggingService.addManualTag(patientId, tagCode, tagName, category as any);
}

async updateTagStatus(tagId: string, status: string) {
  return this.prisma.patientTag.update({
    where: { id: tagId },
    data: { status: status as any }
  });
}

async triggerAiAnalysis(patientId: string) {
  const aiTaggingService = new AiTaggingService(this.prisma, new LlmService());
  return aiTaggingService.analyzePatient(patientId);
}
```

- [ ] **Step 4: Run tests**

Run: `cd backend && npm run test -- --testPathPattern=patients`
Expected: All existing tests pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/patients/
git commit -m "feat: add patient profile API endpoints

- GET /patients/:id/profile - get full patient portrait
- GET /patients/:id/tags - get patient tags with filters
- POST /patients/:id/tags - add manual tag
- PATCH /patients/:id/tags/:tagId - update tag status
- POST /patients/:id/analyze - trigger AI analysis

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Create Batch Scheduler

**Files:**
- Create: `backend/src/portrait/schedulers/portrait-batch.scheduler.ts`

- [ ] **Step 1: Create scheduler**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScoreCalculatorService } from '../services/score-calculator.service';
import { TaggingService } from '../services/tagging.service';
import { LifecycleService } from '../services/lifecycle.service';

@Injectable()
export class PortraitBatchScheduler implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private scoreCalculator: ScoreCalculatorService,
    private taggingService: TaggingService,
    private lifecycleService: LifecycleService
  ) {}

  onModuleInit() {
    // Run daily batch at 2 AM
    this.scheduleDailyBatch();
    // Run hourly tag expiration check
    this.scheduleHourlyTagExpiration();
  }

  private async scheduleDailyBatch() {
    // Check if it's 2 AM
    const now = new Date();
    if (now.getHours() === 2 && now.getMinutes() === 0) {
      await this.runDailyBatch();
    }
    // Schedule next check in 1 minute
    setTimeout(() => this.scheduleDailyBatch(), 60000);
  }

  private async scheduleHourlyTagExpiration() {
    // Run tag expiration check every hour
    setInterval(async () => {
      await this.taggingService.expireOldTags();
    }, 60 * 60 * 1000);
  }

  async runDailyBatch() {
    console.log('Starting daily portrait batch job...');

    // Get all active patients
    const patients = await this.prisma.patient.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true }
    });

    for (const patient of patients) {
      try {
        // Recalculate all scores
        await this.scoreCalculator.recalculateRfm(patient.id);
        await this.scoreCalculator.recalculateChurnRisk(patient.id);
        await this.scoreCalculator.recalculateEngagement(patient.id);
        await this.scoreCalculator.recalculateValue(patient.id);

        // Check lifecycle
        await this.lifecycleService.checkAndAdvanceLifecycle(patient.id);

        // Run tagging rules
        await this.taggingService.processRules(patient.id);
      } catch (error) {
        console.error(`Failed to process patient ${patient.id}:`, error);
      }
    }

    console.log(`Daily batch completed for ${patients.length} patients`);
  }
}
```

- [ ] **Step 2: Update portrait.module.ts to include scheduler**

```typescript
@Module({
  providers: [
    PrismaService,
    LifecycleService,
    TaggingService,
    ScoreCalculatorService,
    AiTaggingService,
    PatientEventListener,
    PortraitBatchScheduler
  ],
  // ... exports unchanged
})
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/portrait/schedulers/
git commit -m "feat: add portrait batch scheduler for daily score recalculation

- Runs daily at 2 AM
- Recalculates RFM, churn risk, engagement, value for all patients
- Checks and advances lifecycle stages
- Runs auto-tagging rules
- Hourly tag expiration check

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: HIS Webhook Integration

**Files:**
- Modify: `backend/src/integration/webhook.service.ts`

- [ ] **Step 1: Add HIS sync endpoint**

Add to `WebhookService`:

```typescript
@Post('his/patient')
async syncHisPatient(@Body() data: {
  action: 'create' | 'update' | 'delete';
  patient: any;
  timestamp: string;
}) {
  const { action, patient } = data;

  if (action === 'delete') {
    await this.prisma.patient.update({
      where: { id: patient.id },
      data: { deletedAt: new Date() }
    });
    return { received: true, action: 'deleted' };
  }

  // Map HIS fields to MRRM
  const patientData = {
    id: patient.patient_id,
    name: patient.patient_name,
    phone: patient.mobile || patient.phone,
    gender: patient.gender ? patient.gender.toUpperCase() : null,
    birthDate: patient.birthday ? new Date(patient.birthday) : null,
    lastVisitAt: patient.last_visit_date ? new Date(patient.last_visit_date) : null,
    // RFM from HIS
    totalAmount: patient.consume_total ? BigInt(patient.consume_total) : BigInt(0),
    orderCount: patient.order_count || 0,
    lastOrderAt: patient.last_order_date ? new Date(patient.last_order_date) : null,
    // HIS tags
    tags: this.mapHisTags(patient)
  };

  if (action === 'create') {
    await this.prisma.patient.create({ data: patientData });
  } else {
    await this.prisma.patient.update({
      where: { id: patient.id },
      data: patientData
    });
  }

  return { received: true, action };
}

private mapHisTags(patient: any): string[] {
  const tags: string[] = [];
  if (patient.vip_flag === '1') tags.push('vip');
  if (patient.consume_level) tags.push(`level_${patient.consume_level}`);
  return tags;
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/integration/webhook.service.ts
git commit -m "feat: add HIS patient sync webhook

- POST /webhooks/his/patient for HIS data sync
- Maps HIS fields to MRRM patient model
- Handles create, update, delete actions
- Maps HIS tags (vip_flag, consume_level)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Complexity |
|------|-------------|------------|
| 1 | Prisma Schema Extension | Medium |
| 2 | Tag Rule Seed Data | Low |
| 3 | Portrait Module (Lifecycle, Tagging, Scoring, AI) | High |
| 4 | Patient Profile API | Medium |
| 5 | Batch Scheduler | Medium |
| 6 | HIS Webhook Integration | Low |

**Total: 6 tasks**

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-14-patient-portrait-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**