# MRRM 患者画像系统设计

> 日期: 2026-04-14
> 状态: 设计中
> 负责人: MRRM Team

## 1. 设计目标

构建新一代 CRM 患者画像系统，融合**生命周期管理** + **行为标签** + **RFM 分析** + **AI 智能**，实现患者全生命周期洞察。

## 2. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    数据源层                                  │
│   HIS/CRM          MRRM触点           第三方(微信/问卷)      │
└──────────┬────────────────┬────────────────┬──────────────┘
           │                │                │
           ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                 事件流 + 消息队列                            │
│           (实时事件)         (批量数据)                        │
└──────────┬────────────────┬────────────────┬──────────────┘
           │                │                │
           ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI 分析层                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 实时标签引擎 │  │ 分数计算引擎│  │ 阶段推进引擎│        │
│  │ (规则+AI)   │  │ (RFM/风险)  │  │ (生命周期)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────┬────────────────┬────────────────┬──────────────┘
           │                │                │
           ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    患者画像                                  │
│  Patient表 + Tag表 + Score表 + Lifecycle + BehaviorStats    │
└─────────────────────────────────────────────────────────────┘
```

## 3. 数据模型

### 3.1 Patient 表扩展

```prisma
model Patient {
  // ... 现有字段 ...

  // RFM 字段
  lastOrderAt        DateTime?   @map("last_order_at")
  orderCount         Int         @default(0) @map("order_count")
  totalAmount        Decimal     @default(0) @db.Decimal(12,2) @map("total_amount")
  avgAmount          Decimal     @default(0) @db.Decimal(12,2) @map("avg_amount")

  // 行为统计
  totalVisits        Int         @default(0) @map("total_visits")
  lastContactAt      DateTime?   @map("last_contact_at")
  touchpointCount    Int         @default(0) @map("touchpoint_count")
  avgSatisfaction    Decimal?    @map("avg_satisfaction")

  // 生命周期
  lifecycleStage     LifecycleStage @default(DEVELOPMENT) @map("lifecycle_stage")
  stageEnteredAt     DateTime      @default(now()) @map("stage_entered_at")
  stageUpdatedAt     DateTime      @updatedAt @map("stage_updated_at")

  // AI 分析分数 (0-100)
  churnRiskScore     Decimal      @default(0) @map("churn_risk_score")
  engagementScore    Decimal      @default(0) @map("engagement_score")
  valueScore         Decimal      @default(0) @map("value_score")
  aiRecommendation   String?     @map("ai_recommendation")

  // Relations
  tags               PatientTag[]
}

enum LifecycleStage {
  DEVELOPMENT   // 开发期 - 潜在需求阶段
  PRE_TREATMENT // 治疗前期 - 需求确认/方案制定
  TREATMENT     // 治疗期 - 执行治疗方案
  MAINTENANCE   // 维护期 - 治疗完成/长期维护
}
```

### 3.2 患者标签表

```prisma
model PatientTag {
  id          String      @id @default(uuid())
  patientId   String      @map("patient_id")
  tagCode     String      @map("tag_code")
  tagName     String      @map("tag_name")
  category    TagCategory

  source      TagSource   // AUTO | MANUAL | AI
  generatedBy String?     @map("generated_by")  // userId or AI
  confidence  Decimal?    @default(1)            // AI 生成时有

  status      TagStatus   @default(ACTIVE)       // ACTIVE | PENDING | EXPIRED
  expiredAt   DateTime?   @map("expired_at")
  createdAt   DateTime    @default(now()) @map("created_at")

  patient     Patient     @relation(fields: [patientId], references: [id])

  @@unique([patientId, tagCode])
  @@index([patientId, category])
  @@index([status, expiredAt])
  @@map("patient_tags")
}

enum TagCategory {
  BEHAVIOR       // 行为标签
  VALUE          // 价值标签
  PREFERENCE     // 偏好标签
  STATUS         // 状态标签
  CUSTOM         // 自定义标签
}

enum TagSource {
  AUTO     // 规则引擎自动
  MANUAL   // 员工手动
  AI       // AI 生成（需确认）
}

enum TagStatus {
  ACTIVE   // 生效中
  PENDING  // 待确认（AI建议）
  EXPIRED  // 已过期
}
```

### 3.3 标签规则表

```prisma
model TagRule {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique
  category    TagCategory
  condition   Json     // 规则条件
  priority    Int      @default(0)
  status      RuleStatus @default(ACTIVE)
  autoGenerate Boolean @default(true) @map("auto_generate")
  expireDays  Int?     @map("expire_days")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([status, priority])
  @@map("tag_rules")
}

enum RuleStatus {
  ACTIVE
  INACTIVE
}
```

### 3.4 分数历史表

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

## 4. 生命周期管理

### 4.1 阶段定义

| 阶段 | 说明 | 进入条件 | 退出条件 |
|------|------|----------|----------|
| DEVELOPMENT | 开发期 | 新建患者档案 | 需求确认开始治疗 |
| PRE_TREATMENT | 治疗前期 | 需求进入治疗方案 | 治疗开始 |
| TREATMENT | 治疗期 | 路径实例启动 | 治疗结束 + 90天 |
| MAINTENANCE | 维护期 | 治疗完成观察期结束 | 流失风险 |

### 4.2 推进规则

```typescript
const lifecycleRules = [
  {
    from: 'DEVELOPMENT',
    to: 'PRE_TREATMENT',
    conditions: [
      'demand.type == TREATMENT',
      'demand.status IN [IN_PROGRESS, FULFILLED]'
    ]
  },
  {
    from: 'PRE_TREATMENT',
    to: 'TREATMENT',
    conditions: [
      'pathInstance.status == IN_PROGRESS',
      'treatmentStartDate != null'
    ]
  },
  {
    from: 'TREATMENT',
    to: 'MAINTENANCE',
    conditions: [
      'treatmentEndDate != null',
      'treatmentEndDate < now - 90 days'
    ]
  }
];

const downgradeRules = [
  {
    from: 'PRE_TREATMENT',
    to: 'DEVELOPMENT',
    conditions: [
      'demand.status IN [CANCELLED, LOST]',
      'lastContactAt > 60 days ago'
    ]
  }
];
```

## 5. 标签体系

### 5.1 预定义标签

| 标签代码 | 名称 | 类别 | 来源 |
|----------|------|------|------|
| inactive_30d | 30天未到诊 | BEHAVIOR | AUTO |
| inactive_90d | 90天未到诊 | BEHAVIOR | AUTO |
| high_frequency | 高频到诊 | BEHAVIOR | AUTO |
| churn_risk | 流失风险 | BEHAVIOR | AUTO |
| reactivated | 重新激活 | BEHAVIOR | AUTO |
| vip | VIP客户 | VALUE | AUTO |
| high_value | 高价值 | VALUE | AUTO |
| potential | 潜力客户 | VALUE | AUTO |
| dormant | 休眠客户 | VALUE | AUTO |
| new_patient | 新患者 | STATUS | AUTO |
| returning | 复诊患者 | STATUS | AUTO |
| long_term | 长期患者 | STATUS | AUTO |
| wechat_prefer | 偏好微信 | PREFERENCE | AI |
| likely_churn | 可能流失 | BEHAVIOR | AI |

### 5.2 标签规则示例

```yaml
tag_rules:
  - name: "30天未到诊"
    code: "inactive_30d"
    category: BEHAVIOR
    priority: 1
    condition:
      and:
        - lastVisitAt < now - 30d
        - lifecycleStage IN [TREATMENT, MAINTENANCE]
    auto_generate: true
    expire_days: 30

  - name: "高价值"
    code: "high_value"
    category: VALUE
    priority: 1
    condition:
      or:
        - totalAmount >= 10000
        - (totalAmount >= 5000 AND orderCount >= 3)
    auto_generate: true
```

### 5.3 AI + 规则混合打标流程

```
触点/事件发生
    │
    ▼
规则引擎检查 ──── 命中规则 ────→ 自动打标签 (source: AUTO)
    │
    │ 未命中
    ▼
AI 分析 (Clawith数字员工)
    │
    ├── 置信度 >= 80% → 直接打标签 (source: AI)
    ├── 置信度 50-80% → 建议标签 → 员工确认 (status: PENDING)
    └── 置信度 < 50% → 不打标签
```

## 6. 数据处理

### 6.1 事件类型

```typescript
// 实时事件（触发即时分析）
enum RealtimeEvent {
  VISIT_COMPLETED       // 就诊完成
  TOUCHPOINT_CREATED     // 新触点创建
  DEMAND_STATUS_CHANGED  // 需求状态变化
  PAYMENT_COMPLETED      // 支付完成
}

// 批量事件（定时处理）
enum BatchEvent {
  PATIENT_SYNC         // HIS 患者同步
  RFM_RECALCULATE      // RFM 重算
  LIFECYCLE_ADVANCE    // 生命周期检查
  CHURN_RISK_SCAN      // 流失风险扫描
  TAG_EXPIRE_CHECK     // 标签过期检查
}
```

### 6.2 处理流水线

```yaml
# 实时处理
realtime_pipeline:
  - trigger: VISIT_COMPLETED
    actions:
      - update_stats: totalVisits += 1
      - recalculate: avgSatisfaction
      - check_lifecycle: 阶段推进检查
      - run_ai_rules: 生成标签建议

# 批量处理
batch_pipeline:
  - schedule: "0 2 * * *"  # 每天凌晨2点
    jobs:
      - sync_patients_from_his
      - recalculate_all_rfm
      - advance_lifecycle_stages
      - scan_churn_risk
      - expire_old_tags
```

## 7. API 接口

### 7.1 患者画像

```typescript
// 获取患者完整画像
GET /patients/:id/profile

// 获取患者标签
GET /patients/:id/tags
GET /patients/:id/tags?category=BEHAVIOR&status=ACTIVE

// 手动添加标签
POST /patients/:id/tags
{ tagCode: "vip", source: "MANUAL" }

// 确认/拒绝 AI 标签
PATCH /patients/:id/tags/:tagId
{ status: "ACTIVE" | "EXPIRED" }

// 获取待确认标签
GET /patients/:id/tags?status=PENDING
```

### 7.2 批量操作

```typescript
// 批量获取分数
POST /patients/scores/batch
{ patientIds: ["id1", "id2"] }

// 批量生成标签
POST /patients/tags/batch
{ action: "generate", filter: { lifecycleStage: "DEVELOPMENT" } }
```

### 7.3 AI 分析

```typescript
// 触发 AI 分析
POST /patients/:id/analyze
{ trigger: "touchpoint" | "visit" | "manual" }

// 获取 AI 推荐
GET /patients/:id/recommendations
```

### 7.4 管理接口

```typescript
// 标签规则
GET/POST/PATCH/DELETE /admin/tag-rules

// 生命周期规则
GET/POST /admin/lifecycle-rules

// 同步管理
POST /admin/sync/his
GET /admin/sync/status
```

### 7.5 Webhook (HIS 推送)

```typescript
// HIS 患者变更
POST /webhooks/his/patient
{ action: "create" | "update", patient: {...}, timestamp: "..." }
```

## 8. 标签应用场景

| 场景 | 触发条件 | 标签 | 后续动作 |
|------|----------|------|----------|
| 流失预警 | inactive_30d + churn_risk | 流失风险 | 发送提醒给员工 |
| VIP维护 | vip + high_value | VIP客户 | 自动进入高级随访计划 |
| 沉默唤醒 | inactive_90d + dormant | 休眠客户 | 触发唤醒营销 |
| 复购引导 | returning + lastVisitAt > 60d | 复诊提醒 | 发送预约邀请 |
| 新患者关怀 | new_patient | 新患者 | 发送欢迎短信 |

## 9. 实现优先级

1. **Phase 1**: Patient 表扩展 + 生命周期字段
2. **Phase 2**: PatientTag 表 + 基础自动标签规则
3. **Phase 3**: AI 打标集成 (Clawith)
4. **Phase 4**: 分数计算引擎 (RFM, 风险)
5. **Phase 5**: HIS 数据同步

## 10. 待确认事项

- [ ] AI 分析使用 Clawith 数字员工的具体实现方式
- [ ] HIS 数据同步频率和冲突处理策略
- [ ] 标签过期时间的默认配置