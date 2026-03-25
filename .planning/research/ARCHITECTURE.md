# Architecture Patterns: Medical Patient Relationship Management System (MRRM)

**Domain:** Healthcare CRM / Patient Management System
**Project:** MRRM - 医疗患者关系管理系统
**Researched:** 2026-03-25
**Confidence:** MEDIUM (based on established architecture patterns applied to domain context)

---

## Recommended Architecture

### Overall Architecture Style: N-Tier with Domain-Driven Design Modules

The MRRM system follows an **N-tier architecture** with **closed layer architecture** (requests flow through adjacent layers only). This aligns with the healthcare industry's need for clear boundaries, audit trails, and regulatory compliance.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Chrome    │  │    Edge     │  │   Safari    │  │  Firefox    │    │
│  │    90+      │  │    90+      │  │    14+      │  │    88+      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION TIER (React)                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Ant Design Component Library                  │   │
│  ├─────────┬─────────┬─────────┬─────────┬─────────┬────────┬──────┤   │
│  │  用户    │  权限    │  机构    │  需求    │  路径    │  触点   │ 随访  │   │
│  │  管理    │  管理    │  管理    │  管理    │  管理    │  管理   │ 管理  │   │
│  ├─────────┴─────────┴─────────┴─────────┴─────────┴────────┴──────┤   │
│  │                    患者旅程中心  │  体验管理中心  │  健康管理中心   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ RESTful API
┌─────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS Logic Tier (API Gateway)                 │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                     API Gateway / BFF Layer                      │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │ Auth     │ │ User     │ │ Patient  │ │ Demand   │           │     │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │ Path     │ │ Touch-   │ │ Followup │ │ Report   │           │     │
│  │  │ Service  │ │ point Svc│ │ Service  │ │ Service  │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA ACCESS TIER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │ PostgreSQL   │  │ Redis Cache  │  │ File Storage │                   │
│  │ (Primary DB) │  │ (Sessions &   │  │ (Documents,  │                   │
│  │              │  │  Query Cache) │  │  Images)    │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### Layer Responsibilities

| Layer | Responsibility | Can Call | Cannot Call |
|-------|---------------|----------|-------------|
| **Client/Presentation** | UI rendering, user input handling, local state | API Gateway | Business Logic, Data Access |
| **API Gateway/BFF** | Request routing, auth validation, response aggregation | Business Services | Client, Database directly |
| **Business Services** | Domain logic, business rules, workflow orchestration | Data Access Layer | Client, API Gateway |
| **Data Access Layer** | Database operations, query optimization | PostgreSQL | Business Services, API Gateway |

### Module Boundaries (Domain-Driven Design)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Core Domain Modules                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   权限模块   │  │   用户模块   │  │   机构模块   │             │
│  │ (Auth)      │  │ (User)      │  │ (Org)       │             │
│  │             │  │             │  │             │             │
│  │ - 角色管理   │  │ - 用户CRUD  │  │ - 机构管理   │             │
│  │ - 权限配置   │  │ - 认证      │  │ - 门店管理   │             │
│  │ - 资源授权   │  │ - 密码策略   │  │ - 租户隔离   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                     需求模块 (Demand)                      │     │
│  │  - 需求创建   - 状态流转   - 需求查询   - 需求统计        │     │
│  └─────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                     路径模块 (Path)                       │     │
│  │  - 技术路径配置   - 路径执行追踪   - 路径版本管理         │     │
│  └─────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                    触点模块 (Touchpoint)                  │     │
│  │  - 触点记录     - 触点分析     - 触点报表                │     │
│  └─────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                   随访模块 (Followup)                     │     │
│  │  - 随访计划     - 随访执行     - 随访追踪                │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     Center Modules (Cross-Cutting)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                  患者旅程中心 (Patient Journey)            │     │
│  │  - 患者全生命周期视图   - 旅程阶段分析   - 转化追踪       │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                  体验管理中心 (Experience Mgmt)          │     │
│  │  - 满意度调查     - 反馈管理     - 体验指标              │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                  健康管理中心 (Health Mgmt)               │     │
│  │  - 健康档案     - 健康指标追踪   - 健康提醒               │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Service-to-Service Communication

```
User Service ──────► Auth Service (validate token)
                       │
                       ▼
Demand Service ──────► Path Service (get treatment path)
                       │
                       ▼
Touchpoint Service ──► Demand Service (link to demand)
                       │
                       ▼
Followup Service ────► Patient Service (get patient info)
                       │
                       ▼
Report Service ──────► All Services (aggregate data)
```

**Key Principle:** Services communicate via **synchronous REST** for user-facing operations. **Asynchronous messaging** (via message queue) for cross-service notifications and audit logging.

---

## Data Flow

### Primary Data Flow: Patient Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                     PATIENT LIFECYCLE FLOW                        │
└──────────────────────────────────────────────────────────────────┘

  [患者咨询]
       │
       ▼
  ┌─────────┐    创建需求    ┌─────────┐    配置路径    ┌─────────┐
  │ 患者档案 │ ───────────► │ 需求管理 │ ───────────► │ 路径管理 │
  └─────────┘               └─────────┘               └─────────┘
       ▲                         │                         │
       │                         │                         │
       │                         ▼                         │
       │                  ┌─────────────┐                   │
       │                  │  状态流转   │                   │
       │                  │ (待跟进/进行中/已完成)          │
       │                  └─────────────┘                   │
       │                         │                         │
       │                         ▼                         │
       │                  ┌─────────────┐                   │
       │                  │  触点记录   │ ◄──────────────────┘
       │                  └─────────────┘
       │                         │
       │                         ▼
       │                  ┌─────────────┐
       │                  │  随访计划   │
       │                  └─────────────┘
       │                         │
       │                         ▼
       │                  ┌─────────────┐
       └──────────────────│ 患者旅程中心 │
                          └─────────────┘
```

### Request/Response Data Flow

```
1. 用户操作 (浏览器)
        │
        ▼ HTTPS
2. API Gateway (认证、路由)
        │
        ▼
3. 业务服务 (Domain Logic)
        │
        ├──► 数据校验
        │
        ├──► 业务规则执行
        │
        ├──► 多租户数据过滤 (自动注入 tenant_id)
        │
        ▼
4. 数据访问层 (PostgreSQL)
        │
        ├──► Row-Level Security 执行
        │
        ├──► 查询优化
        │
        ▼
5. PostgreSQL 返回结果
        │
        ▼
6. 业务服务处理响应
        │
        ▼
7. API Gateway 返回
        │
        ▼
8. 前端更新UI
```

### Multi-Tenant Data Isolation Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  MULTI-TENANT ISOLATION FLOW                    │
└────────────────────────────────────────────────────────────────┘

  Request ──► API Gateway ──► Extract tenant_id
                                  │
                                  ▼
                            Auth Service
                            Validate + Extract
                            tenant context
                                  │
                                  ▼
                            Business Service
                            (tenant_id in context)
                                  │
                                  ▼
                            Data Access Layer
                            ┌─────────────────┐
                            │ WHERE tenant_id = ? │
                            │ (自动注入)         │
                            └─────────────────┘
                                  │
                                  ▼
                            PostgreSQL
                            (RLS Policies)
```

---

## Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BUILD ORDER / DEPENDENCIES                       │
│                                                                     │
│   PHASE 1 (Foundation)          PHASE 2 (Core Domain)                  │
│   ───────────────────          ────────────────────                    │
│   ┌───────────────┐            ┌───────────────┐                       │
│   │  Auth Module  │            │ Demand Module │                       │
│   │  (权限+认证)   │            │ (需求管理)     │                       │
│   └───────────────┘            └───────────────┘                       │
│           │                          │                                 │
│           ▼                          ▼                                 │
│   ┌───────────────┐            ┌───────────────┐                       │
│   │  User Module  │            │  Path Module   │                       │
│   │  (用户管理)    │            │  (路径管理)    │                       │
│   └───────────────┘            └───────────────┘                       │
│           │                          │                                 │
│           └──────────┬───────────────┘                                 │
│                      │                                                 │
│                      ▼                                                 │
│               ┌───────────────┐                                        │
│               │  Org Module   │                                        │
│               │  (机构管理)    │                                        │
│               └───────────────┘                                        │
│                                                                     │
│   PHASE 3 (Patient Engagement)    PHASE 4 (Analytics)                 │
│   ───────────────────────────      ──────────────────                  │
│   ┌───────────────┐                  ┌───────────────┐                │
│   │Touchpoint Module│               │ Report Module │                │
│   │  (触点管理)     │                │  (报表中心)    │                │
│   └───────────────┘                  └───────────────┘                │
│           │                                 ▲                         │
│           ▼                                 │                         │
│   ┌───────────────┐                  ┌───────────────┐                │
│   │Followup Module│                  │ Journey Center│               │
│   │  (随访管理)     │                  │ (患者旅程)    │                │
│   └───────────────┘                  └───────────────┘                │
│           │                                 ▲                         │
│           └──────────────┬──────────────────┘                         │
│                          │                                            │
│                          ▼                                            │
│                   ┌───────────────┐                                   │
│                   │Experience Ctr │                                   │
│                   │ (体验管理)    │                                   │
│                   └───────────────┘                                   │
│                                                                     │
│   PHASE 5 (Health Mgmt)                                              │
│   ─────────────────────                                              │
│   ┌───────────────┐                                                 │
│   │ Health Center │                                                 │
│   │ (健康管理)     │                                                 │
│   └───────────────┘                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dependency Rationale

| Phase | Modules | Dependencies Resolved | Build First Because |
|-------|---------|----------------------|---------------------|
| **Phase 1** | Auth, User, Org | No cross-module dependencies | Foundation - all other modules depend on authentication and organization context |
| **Phase 2** | Demand, Path | Auth (Phase 1) | Core business objects that drive patient workflow |
| **Phase 3** | Touchpoint, Followup | Demand, Path (Phase 2) | Operational modules that record patient interactions |
| **Phase 4** | Report, Journey Center | All above | Depends on data from operational modules |
| **Phase 5** | Experience Center | All above | Cross-cutting analytics |
| **Phase 6** | Health Center | All above | Depends on complete patient journey |

---

## Database Schema Design (Multi-Tenant)

### Schema-per-Tenant Pattern (PostgreSQL)

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE: mrrm_db                          │
├─────────────────────────────────────────────────────────────────┤
│  Schema: public                                                  │
│  ├── app_config (全局配置)                                        │
│  ├── audit_logs (审计日志)                                       │
│  └── migrations (数据库迁移)                                     │
├─────────────────────────────────────────────────────────────────┤
│  Schema: tenant_{tenant_id}                                       │
│  ├── users (用户)                                                │
│  ├── roles (角色)                                                │
│  ├── permissions (权限)                                          │
│  ├── patients (患者)                                             │
│  ├── demands (需求)                                              │
│  ├── demand_status_history (需求状态历史)                          │
│  ├── treatment_paths (技术路径)                                  │
│  ├── path_executions (路径执行)                                   │
│  ├── touchpoints (触点)                                           │
│  ├── followups (随访)                                             │
│  ├── patient_journeys (患者旅程)                                   │
│  └── health_records (健康档案)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Row-Level Security (RLS) Policy

```sql
-- Enable RLS
ALTER TABLE tenant_{tenant_id}.patients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see data in their tenant
CREATE POLICY tenant_isolation ON tenant_{tenant_id}.patients
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## Integration Architecture

### External System Integration

```
┌──────────────────────────────────────────────────────────────────┐
│                       MRRM SYSTEM                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Integration Layer                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ CRM      │  │ HIS       │  │ BI       │  │ 微信/短信 │  │  │
│  │  │ Adapter  │  │ Adapter   │  │ Adapter  │  │ Adapter  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         ┌─────────┐    ┌─────────┐    ┌─────────┐
         │  CRM    │    │   HIS   │    │BI System│
         │ System  │    │ System  │    │         │
         └─────────┘    └─────────┘    └─────────┘
```

### Integration Patterns

| External System | Pattern | Data Flow |
|-----------------|---------|-----------|
| **CRM** | REST API polling / Webhook | Sync patient data, campaign results |
| **HIS** | Message Queue (async) | Treatment records, diagnosis data |
| **BI** | ETL / Data Export | Aggregated metrics, reports |
| **微信/短信** | Third-party SDK | Notifications, reminders |

---

## Scalability Boundaries

| Scale Level | 100 Users | 10K Users | 1M+ Patients |
|-------------|-----------|------------|----------------|
| **Architecture** | Single API instance | Load-balanced API cluster | Microservices split |
| **Database** | Single PostgreSQL | PostgreSQL + Read replicas | Schema-per-tenant + Sharding |
| **Caching** | None | Redis (sessions) | Redis (query cache + sessions) |
| **Storage** | Local filesystem | Object storage (S3-like) | CDN + Object storage |

---

## Sources

| Pattern | Source | Confidence |
|---------|--------|------------|
| N-tier architecture principles | [Microsoft Azure N-tier Architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier) | HIGH |
| PostgreSQL multi-tenant patterns | [PostgreSQL Schema Documentation](https://www.postgresql.org/docs/current/ddl-schemas.html) | HIGH |
| Basic web application architecture | [Azure Basic Web App Reference](https://learn.microsoft.com/en-us/azure/architecture/web-apps/app-service/architectures/basic-web-app) | HIGH |
| Healthcare CRM domain knowledge | MRRM PROJECT.md requirements analysis | MEDIUM |

---

## Appendix: Component Inventory

| Component | Type | Responsibility | Owns Data |
|-----------|------|----------------|------------|
| **API Gateway** | Infrastructure | Request routing, auth, rate limiting | No |
| **Auth Service** | Business Service | Authentication, authorization, token management | Users, Roles, Permissions |
| **User Service** | Business Service | User CRUD, profile management | Users |
| **Org Service** | Business Service | Organization, tenant management | Organizations, Tenants |
| **Demand Service** | Business Service | Patient demand lifecycle | Demands, Status History |
| **Path Service** | Business Service | Treatment path configuration and execution | Treatment Paths, Executions |
| **Touchpoint Service** | Business Service | Patient interaction recording | Touchpoints |
| **Followup Service** | Business Service | Followup scheduling and tracking | Followups |
| **Report Service** | Business Service | Analytics and reporting | Aggregated data |
| **Patient Journey Center** | Business Service | Patient lifecycle visualization | Journey snapshots |
| **Experience Center** | Business Service | Patient satisfaction management | Survey results |
| **Health Center** | Business Service | Patient health records | Health records |
| **Integration Layer** | Infrastructure | External system adapters | Adapter configs |
| **Audit Logger** | Infrastructure | Operation audit logging | Audit logs |
