# Roadmap: MRRM - 医疗患者关系管理系统

## Overview

帮助医疗机构通过标准化诊疗路径提升患者转化率，通过全触点记录优化患者体验，通过智能随访提高治疗完成率的医疗患者关系管理系统。系统从基础架构（认证、权限、机构管理）开始，逐步构建核心患者业务对象（患者档案、需求管理、路径管理），再扩展到患者参与运营（触点管理、随访管理），最后实现分析洞察（患者旅程中心、报表中心、体验管理中心）和系统集成（健康管理、系统对接）。

## Phases

- [x] **Phase 1: Foundation** - 认证、权限、机构管理、审计日志基础设施 (3/8 plans)
- [ ] **Phase 2: Core Patient Objects** - 患者档案、需求管理、路径管理
- [ ] **Phase 3: Patient Engagement Operations** - 触点管理、随访管理
- [ ] **Phase 4: Analytics and Journey** - 患者旅程中心、报表中心、体验管理中心
- [ ] **Phase 5: Health and Integration** - 健康管理中心、系统集成

## Phase Details

### Phase 1: Foundation
**Goal**: 建立多租户基础设施，用户可以使用系统，管理机构、用户和权限，所有操作可审计
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10, ORG-01, ORG-02, ORG-03 (13 requirements)
**Success Criteria** (what must be TRUE):
  1. 用户可以使用邮箱/密码注册账号并登录系统
  2. 用户登录后会话跨浏览器刷新保持
  3. 连续5次登录失败后账户锁定30分钟
  4. 系统支持单点登录（SSO）
  5. 系统管理员可以创建、编辑、删除用户账号
  6. 系统支持基于角色的权限控制（RBAC），权限可以分配到菜单级和按钮级
  7. 系统记录所有关键操作审计日志（操作人、时间、内容、IP地址），审计日志保留至少1年
  8. 支持多机构/多门店管理，每个机构有独立的数据空间（Row-Level Security隔离）
  9. 机构管理员可以管理本机构内的用户和权限
**Plans**: 8 plans (01-08)

### Phase 2: Core Patient Objects
**Goal**: 用户可以管理患者档案、创建医疗需求、配置和执行技术路径
**Depends on**: Phase 1
**Requirements**: PATIENT-01, PATIENT-02, PATIENT-03, PATIENT-04, PATIENT-05, DEMAND-01, DEMAND-02, DEMAND-03, DEMAND-04, DEMAND-05, PATH-01, PATH-02, PATH-03, PATH-04, PATH-05 (15 requirements)
**Success Criteria** (what must be TRUE):
  1. 用户可以创建患者档案（包含姓名、性别、年龄、联系方式、过敏史、既往史等医疗信息）
  2. 用户可以查询和编辑患者档案，支持姓名、电话精准搜索，患者可以分层（高价值/普通/流失风险）
  3. 用户可以为患者创建医疗需求（需求类型、描述、优先级），需求关联到具体的患者档案
  4. 需求有标准状态流转（新建→跟进中→已成交→已完成→已关闭），用户可以查看处理历史并按条件筛选
  5. 系统管理员可以配置技术路径模板（路径名称、步骤序列、每步执行内容、执行周期、负责角色）
  6. 用户可以将路径模板分配给患者的需求，系统追踪路径执行进度（已完成、当前、待执行步骤）
  7. 路径执行超时或遗漏时系统产生提醒
**Plans**: 8 plans (01-08)

### Phase 3: Patient Engagement Operations
**Goal**: 用户可以记录患者触点交互，制定和执行随访计划
**Depends on**: Phase 2
**Requirements**: TOUCH-01, TOUCH-02, TOUCH-03, TOUCH-04, TOUCH-05, FOLLOW-01, FOLLOW-02, FOLLOW-03, FOLLOW-04, FOLLOW-05, FOLLOW-06 (11 requirements)
**Success Criteria** (what must be TRUE):
  1. 用户可以为患者记录服务触点（支持电话、短信、微信、现场就诊、其他类型），触点包含时间、内容、满意度
  2. 用户可以按患者、时间范围、触点类型筛选触点列表，所有触点记录不可删除，仅作废标记
  3. 系统生成触点分析报表（触点数量、满意度趋势）
  4. 用户可以为患者制定随访计划（随访周期、随访内容、负责人员），随访计划关联到具体的技术路径步骤
  5. 系统根据随访周期自动生成随访任务，用户可以执行随访任务并记录随访结果
  6. 未完成的随访任务产生提醒，随访完成率作为关键指标可查询
**Plans**: 8 plans (01-08)

### Phase 4: Analytics and Journey
**Goal**: 用户可以查看患者完整旅程视图和业务报表，分析患者体验
**Depends on**: Phase 3
**Requirements**: JOURNEY-01, JOURNEY-02, JOURNEY-03, REPORT-01, REPORT-02, REPORT-03, EXPER-01, EXPER-02, EXPER-03, EXPER-04 (10 requirements)
**Success Criteria** (what must be TRUE):
  1. 用户可以查看单个患者的完整旅程视图（从首次触达到治疗结束），展示触点历史、需求流转、路径执行、随访记录
  2. 用户可以按时间轴浏览患者的关键事件
  3. 系统提供关键业务指标看板（新增患者数、需求转化率、随访完成率），用户可以按机构、按时间筛选报表数据
  4. 报表支持导出（Excel格式）
  5. 系统汇总患者满意度数据（来自触点记录的满意度评分），用户可以查看满意度趋势报表（按门店、按时间段）
  6. 用户可以识别体验下滑的患者（满意度下降预警），体验报告支持导出
**Plans**: 8 plans (01-08)

### Phase 5: Health and Integration
**Goal**: 用户可以查看健康档案汇总，系统可以与外部系统对接
**Depends on**: Phase 4
**Requirements**: HEALTH-01, HEALTH-02, HEALTH-03, INTEG-01, INTEG-02, INTEG-03, INTEG-04, INTEG-05 (8 requirements)
**Success Criteria** (what must be TRUE):
  1. 用户可以查看患者的健康档案汇总（既往史、过敏史、检查结果），健康档案支持时间轴展示
  2. 用户可以设置健康提醒（复查提醒、用药提醒）
  3. 系统提供RESTful API接口，支持Webhook回调机制
  4. 系统支持与HIS系统对接（读取患者基础信息）
  5. 系统支持与CRM系统对接（同步患者数据）
  6. 系统支持与BI系统对接（推送业务数据）
**Plans**: 8 plans (01-08)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/8 plans (01-08) | In progress | 01-01, 01-02, 01-03 |
| 2. Core Patient Objects | 0/8 plans (01-08) | Not started | - |
| 3. Patient Engagement Operations | 0/8 plans (01-08) | Not started | - |
| 4. Analytics and Journey | 0/8 plans (01-08) | Not started | - |
| 5. Health and Integration | 0/8 plans (01-08) | Not started | - |

## Coverage

**Requirements mapped by phase:**

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1 - Foundation | AUTH-01~AUTH-10, ORG-01~ORG-03 | 13 |
| 2 - Core Patient Objects | PATIENT-01~PATIENT-05, DEMAND-01~DEMAND-05, PATH-01~PATH-05 | 15 |
| 3 - Patient Engagement Operations | TOUCH-01~TOUCH-05, FOLLOW-01~FOLLOW-06 | 11 |
| 4 - Analytics and Journey | JOURNEY-01~JOURNEY-03, REPORT-01~REPORT-03, EXPER-01~EXPER-04 | 10 |
| 5 - Health and Integration | HEALTH-01~HEALTH-03, INTEG-01~INTEG-05 | 8 |

**Total v1 requirements:** 57
**Mapped:** 57
**Unmapped:** 0
