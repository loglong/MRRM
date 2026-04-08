# MRRM × Clawith 数字员工融合设计

## 概述

本设计旨在将 MRRM（医疗患者关系管理系统）的患者管理能力封装为标准 RESTful API Skill，供 Clawith 数字员工平台调用。实现 MRRM 与 Clawith 的深度融合，让 AI 员工能够自主操作患者管理全流程。

## 背景

- **MRRM**：医疗患者关系管理系统，已实现患者管理、随访管理、触点记录等核心功能
- **Clawith 数字员工**：智能 AI Agent 平台，支持数字营销、智能客服、虚拟员工等能力
- **融合目标**：MRRM 提供患者数据与操作能力，Clawith AI 员工提供智能决策与自动化执行

## 核心设计原则

1. **API First** - 独立 AI 接口层，与现有 API 解耦
2. **安全优先** - 白名单模式，最小权限暴露
3. **可观测** - 完整操作日志，便于审计追踪
4. **可扩展** - 模块化设计，便于后续扩展新接口

## 架构设计

### 调用架构

```
Clawith 数字员工
       │
       ▼ (API Key Auth)
┌─────────────────┐
│  AI API Gateway │
│  (权限校验/限流) │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ AI Patient Skill │
│ /api/v1/ai/*    │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Existing MRRM   │
│  Patient Module  │
└─────────────────┘
```

### 安全架构

```
API Key (独立密钥，绑定orgId)
       │
       ▼
┌─────────────────┐
│ Permission Config│ ← 白名单配置
│ ai_permissions.yml│
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ Audit Logging   │ ← 操作记录
└─────────────────┘
```

### 多租户隔离

每个 API Key 绑定到特定机构（orgId），通过 `x-org-id` 请求头传递。所有 AI 接口：
- 校验请求中的 `x-org-id` 与 API Key 绑定的 orgId 一致
- 仅返回该机构下的患者数据
- 跨机构数据隔离保证

## 接口设计

### 1. 患者搜索

```
GET /api/v1/ai/patients/search
```

**请求头**
| 头信息 | 必填 | 说明 |
|--------|------|------|
| x-org-id | 是 | 机构ID，用于多租户隔离 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 否 | 关键词搜索（支持姓名、手机号模糊匹配） |
| tier | string | 否 | 患者等级筛选（HIGH_VALUE, REGULAR, LOST_RISK） |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |

**响应格式**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "name": "张三",
        "phone": "138****8888",
        "tier": "HIGH_VALUE",
        "lastVisit": "2026-04-01",
        "pendingDemands": 2,
        "tags": ["VIP", "种植牙意向"]
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "cursor": "optional-cursor-for-next-page"
    }
  },
  "meta": {
    "model": "MRRM-Patient-Skill-v1",
    "timestamp": "2026-04-08T12:00:00Z"
  }
}
```

### 2. 患者详情

```
GET /api/v1/ai/patients/:id
```

**请求头**
| 头信息 | 必填 | 说明 |
|--------|------|------|
| x-org-id | 是 | 机构ID，用于多租户隔离 |

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 患者ID |

**响应格式**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "张三",
    "gender": "男",
    "age": 45,
    "phone": "138****8888",
    "tier": "HIGH_VALUE",
    "medicalInfo": {
      "allergy": "无",
      "medicalHistory": "高血压病史",
      "lastVisit": "2026-04-01"
    },
    "summary": {
      "totalDemands": 5,
      "completedDemands": 3,
      "pendingDemands": 2,
      "totalTouchpoints": 12,
      "lastFollowup": "2026-03-28"
    }
  },
  "meta": {
    "model": "MRRM-Patient-Skill-v1",
    "timestamp": "2026-04-08T12:00:00Z"
  }
}
```

**说明**：手机号默认脱敏显示（138****8888格式），如需完整号码需更高权限。

### 3. 创建触点记录

```
POST /api/v1/ai/patients/:id/touchpoints
```

**请求头**
| 头信息 | 必填 | 说明 |
|--------|------|------|
| x-org-id | 是 | 机构ID，用于多租户隔离 |

**请求体**
```json
{
  "type": "VISIT",
  "title": "术后回访",
  "content": "患者反映咀嚼时有轻微不适",
  "channel": "OFFLINE"
}
```

**枚举值说明**
| 字段 | 可选值 |
|------|--------|
| type | VISIT, CALL, MESSAGE, EMAIL, WECHAT, VIDEO, SMS, OTHER |
| channel | OFFLINE, ONLINE, MOBILE, PHONE |

**响应格式**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientId": "patient-uuid",
    "type": "VISIT",
    "title": "术后回访",
    "createdAt": "2026-04-08T12:00:00Z"
  },
  "meta": {
    "model": "MRRM-Patient-Skill-v1",
    "timestamp": "2026-04-08T12:00:00Z"
  }
}
```

### 4. 创建随访任务

```
POST /api/v1/ai/patients/:id/followups
```

**请求头**
| 头信息 | 必填 | 说明 |
|--------|------|------|
| x-org-id | 是 | 机构ID，用于多租户隔离 |

**请求体**
```json
{
  "type": "POST_TREATMENT",
  "title": "术后一周回访",
  "content": "询问恢复情况，叮嘱注意事项",
  "plannedAt": "2026-04-15T10:00:00Z"
}
```

**枚举值说明**
| 字段 | 可选值 |
|------|--------|
| type | ROUTINE, POST_TREATMENT, PRE_APPOINTMENT, CUSTOM |

**响应格式**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientId": "patient-uuid",
    "type": "POST_TREATMENT",
    "title": "术后一周回访",
    "status": "ACTIVE",
    "plannedAt": "2026-04-15T10:00:00Z"
  },
  "meta": {
    "model": "MRRM-Patient-Skill-v1",
    "timestamp": "2026-04-08T12:00:00Z"
  }
}
```

## 认证与权限

### API Key 管理

- API Key 独立生成，不与其他系统共用
- 存储于环境变量或密钥管理服务
- 支持多个 API Key（支持多个 AI 员工同时接入）

### 白名单权限配置

配置文件：`backend/src/ai/config/ai-permissions.yml`

```yaml
ai_employee:
  permissions:
    - endpoint: "/api/v1/ai/patients/search"
      methods: ["GET"]
      rate_limit: "100/min"
    - endpoint: "/api/v1/ai/patients/:id"
      methods: ["GET"]
      rate_limit: "200/min"
    - endpoint: "/api/v1/ai/patients/:id/touchpoints"
      methods: ["POST"]
      rate_limit: "50/min"
    - endpoint: "/api/v1/ai/patients/:id/followups"
      methods: ["POST"]
      rate_limit: "50/min"
```

### 权限校验流程

```
请求进入
   │
   ▼
校验 API Key ──── 无效 ──── 返回 401
   │
   ▼
获取 API Key 对应权限
   │
   ▼
匹配白名单 ──── 不匹配 ──── 返回 403
   │
   ▼
检查限流 ──── 超限 ──── 返回 429
   │
   ▼
执行业务逻辑
   │
   ▼
记录操作日志
   │
   ▼
返回结果
```

### 安全要求

| 安全措施 | 说明 |
|---------|------|
| TLS 1.2+ | 生产环境必须使用 HTTPS |
| API Key 轮换 | 建议每90天轮换一次 |
| IP 白名单 | 可选配置，限制 API Key 只能从指定 IP 调用 |
| 请求超时 | 统一超时时间：30秒 |
| 重试策略 | 客户端建议指数退避，最多重试3次 |

## 操作日志

**说明**：复用现有的 `AuditLog` 表，新增 `isAiCall` 字段标识是否为 AI 调用。

### 日志字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 日志ID |
| apiKeyId | string | 调用的API Key标识 |
| endpoint | string | 访问的接口 |
| method | string | HTTP方法 |
| requestBody | json | 请求体 |
| responseStatus | number | 响应状态码 |
| responseTime | number | 响应时间(ms) |
| ip | string | 调用方IP |
| isAiCall | boolean | 是否为AI调用（固定为true） |
| createdAt | datetime | 调用时间 |

### 日志存储

- 存储至现有 `AuditLog` 表（扩展 `isAiCall` 字段）
- 支持按时间范围、API Key、接口等条件查询
- 日志保留期限：90天

## 错误处理

### 错误码定义

| HTTP状态码 | 错误码 | 说明 |
|-----------|--------|------|
| 401 | UNAUTHORIZED | API Key 无效或已禁用 |
| 403 | FORBIDDEN | 接口不在白名单中 |
| 404 | NOT_FOUND | 患者不存在 |
| 429 | RATE_LIMITED | 请求频率超限 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "患者不存在",
    "details": "患者ID: xxx"
  },
  "meta": {
    "model": "MRRM-Patient-Skill-v1",
    "timestamp": "2026-04-08T12:00:00Z"
  }
}
```

### 客户端重试建议

| 错误类型 | 重试建议 |
|---------|---------|
| 429 Rate Limited | 等待后重试，建议指数退避 |
| 500 Internal Error | 最多重试3次，间隔2^n秒 |
| 5xx Server Error | 等待5秒后重试 |
| 4xx Client Error | 不重试，检查请求格式 |

## 实施计划

### Phase 1: 基础建设
- [ ] 创建 AI 模块目录结构
- [ ] 实现 API Key 管理服务
- [ ] 实现白名单权限校验中间件
- [ ] 实现操作日志服务

### Phase 2: 核心接口
- [ ] 实现患者搜索接口
- [ ] 实现患者详情接口
- [ ] 实现创建触点接口
- [ ] 实现创建随访接口

### Phase 3: 安全加固
- [ ] 完善限流机制
- [ ] 增强日志分析能力
- [ ] 添加健康检查接口 `GET /api/v1/ai/health`
- [ ] 添加回调Webhook接口 `POST /api/v1/ai/callbacks`

### Phase 4: 文档与测试
- [ ] 编写 API 文档
- [ ] 与 Clawith 平台对接测试
- [ ] 性能测试

## 技术选型

| 组件 | 技术 | 说明 |
|------|------|------|
| API Framework | NestJS | 复用现有架构 |
| ORM | Prisma | 复用现有架构 |
| Validation | class-validator | 请求校验 |
| Logging | Winston | 日志记录 |
| Rate Limit | @nestjs/throttler | 限流控制 |

## 后续扩展

1. **接口扩展**：覆盖需求管理、患者旅程、体验反馈等模块
2. **协议升级**：支持 Agent Protocol 标准协议
3. **智能增强**：基于 MRRM 数据训练专有模型
4. **多租户支持**：不同机构独立的 AI 员工权限配置
