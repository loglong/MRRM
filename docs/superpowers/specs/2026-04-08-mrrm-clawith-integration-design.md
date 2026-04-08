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
API Key (独立密钥)
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

## 接口设计

### 1. 患者搜索

```
GET /api/v1/ai/patients/search
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | string | 否 | 自然语言查询条件 |
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
        "lastVisit": "2026-04-01",
        "pendingDemands": 2,
        "tags": ["VIP", "种植牙意向"]
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20
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
    "phone": "13812348888",
    "email": "zhangsan@example.com",
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

### 3. 创建触点记录

```
POST /api/v1/ai/patients/:id/touchpoints
```

**请求体**
```json
{
  "type": "CONSULTATION",
  "title": "术后回访",
  "content": "患者反映咀嚼时有轻微不适",
  "channel": "PHONE"
}
```

**响应格式**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientId": "patient-uuid",
    "type": "CONSULTATION",
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

**请求体**
```json
{
  "type": "PHONE",
  "title": "术后一周回访",
  "content": "询问恢复情况，叮嘱注意事项",
  "plannedAt": "2026-04-15T10:00:00Z"
}
```

**响应格式**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientId": "patient-uuid",
    "type": "PHONE",
    "title": "术后一周回访",
    "status": "PENDING",
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

## 操作日志

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
| createdAt | datetime | 调用时间 |

### 日志存储

- 存储至 `ai_audit_logs` 表
- 支持按时间范围、API Key、接口等条件查询
- 日志保留期限：90天

## 错误处理

### 错误码定义

| 错误码 | 说明 |
|--------|------|
| 401 | API Key 无效或已禁用 |
| 403 | 接口不在白名单中 |
| 404 | 患者不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

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
- [ ] 添加健康检查接口

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
