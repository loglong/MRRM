# Requirements: MRRM - 医疗患者关系管理系统

**Defined:** 2026-03-25
**Core Value:** 帮助医疗机构通过标准化诊疗路径提升患者转化率，通过全触点记录优化患者体验，通过智能随访提高治疗完成率

## v1 Requirements

### 基础模块 (AUTH + CORE)

- [ ] **AUTH-01**: 用户可以使用邮箱/密码注册账号
- [ ] **AUTH-02**: 用户登录后会话跨浏览器刷新保持
- [ ] **AUTH-03**: 用户可以登出系统
- [ ] **AUTH-04**: 连续5次登录失败后账户锁定30分钟
- [ ] **AUTH-05**: 支持单点登录（SSO）
- [x] **AUTH-06**: 系统管理员可以创建、编辑、删除用户账号
- [x] **AUTH-07**: 系统支持基于角色的权限控制（RBAC）
- [x] **AUTH-08**: 权限可以分配到菜单级和按钮级
- [x] **AUTH-09**: 系统记录所有关键操作审计日志（操作人、时间、内容、IP地址）
- [x] **AUTH-10**: 审计日志保留至少1年

### 机构管理 (ORG)

- [x] **ORG-01**: 支持多机构/多门店管理
- [x] **ORG-02**: 每个机构有独立的数据空间（Row-Level Security隔离）
- [x] **ORG-03**: 机构管理员可以管理本机构内的用户和权限

### 患者档案 (PATIENT)

- [ ] **PATIENT-01**: 用户可以创建患者档案（姓名、性别、年龄、联系方式）
- [ ] **PATIENT-02**: 患者档案包含过敏史、既往史等医疗相关信息
- [ ] **PATIENT-03**: 用户可以查询患者档案（支持姓名、电话精准搜索）
- [ ] **PATIENT-04**: 用户可以编辑患者档案
- [ ] **PATIENT-05**: 患者档案支持患者画像分层（高价值/普通/流失风险）

### 需求管理 (DEMAND)

- [ ] **DEMAND-01**: 用户可以为患者创建医疗需求（需求类型、描述、优先级）
- [ ] **DEMAND-02**: 需求有标准状态流转（新建→跟进中→已成交→已完成→已关闭）
- [ ] **DEMAND-03**: 用户可以查看需求的处理历史记录
- [ ] **DEMAND-04**: 用户可以按患者、状态、日期范围筛选需求列表
- [ ] **DEMAND-05**: 每个需求关联到具体的患者档案

### 路径管理 (PATH)

- [x] **PATH-01**: 系统管理员可以配置技术路径模板（路径名称、步骤序列）
- [x] **PATH-02**: 每条路径步骤包含执行内容、执行周期、负责角色
- [x] **PATH-03**: 用户可以将路径模板分配给患者的需求
- [x] **PATH-04**: 系统追踪路径执行进度（已完成步骤、当前步骤、待执行步骤）
- [x] **PATH-05**: 路径执行超时或遗漏时系统产生提醒

### 触点管理 (TOUCHPOINT)

- [ ] **TOUCH-01**: 用户可以为患者记录服务触点（触点类型、时间、内容、满意度）
- [ ] **TOUCH-02**: 触点类型支持：电话、短信、微信、现场就诊、其他
- [ ] **TOUCH-03**: 用户可以按患者、时间范围、触点类型筛选触点列表
- [ ] **TOUCH-04**: 系统生成触点分析报表（触点数量、满意度趋势）
- [ ] **TOUCH-05**: 所有触点记录不可删除，仅作废标记

### 随访管理 (FOLLOWUP)

- [x] **FOLLOW-01**: 用户可以为患者制定随访计划（随访周期、随访内容、负责人员）
- [x] **FOLLOW-02**: 随访计划关联到具体的技术路径步骤
- [x] **FOLLOW-03**: 系统根据随访周期自动生成随访任务
- [x] **FOLLOW-04**: 用户可以执行随访任务并记录随访结果
- [x] **FOLLOW-05**: 未完成的随访任务产生提醒
- [x] **FOLLOW-06**: 随访完成率作为关键指标可查询

### 患者旅程中心 (JOURNEY)

- [x] **JOURNEY-01**: 用户可以查看单个患者的完整旅程视图（从首次触达到治疗结束）
- [x] **JOURNEY-02**: 旅程视图展示：触点历史、需求流转、路径执行、随访记录
- [x] **JOURNEY-03**: 用户可以按时间轴浏览患者的关键事件

### 体验管理中心 (EXPERIENCE)

- [x] **EXPER-01**: 系统汇总患者满意度数据（来自触点记录的满意度评分）
- [x] **EXPER-02**: 用户可以查看满意度趋势报表（按门店、按时间段）
- [x] **EXPER-03**: 用户可以识别体验下滑的患者（满意度下降预警）
- [x] **EXPER-04**: 体验报告支持导出

### 健康管理中心 (HEALTH)

- [ ] **HEALTH-01**: 用户可以查看患者的健康档案汇总（既往史、过敏史、检查结果）
- [ ] **HEALTH-02**: 健康档案支持时间轴展示
- [ ] **HEALTH-03**: 用户可以设置健康提醒（复查提醒、用药提醒）

### 报表中心 (REPORT)

- [x] **REPORT-01**: 关键业务指标看板（新增患者数、需求转化率、随访完成率）
- [x] **REPORT-02**: 用户可以按机构、按时间筛选报表数据
- [x] **REPORT-03**: 报表支持导出（Excel格式）

### 系统集成 (INTEGRATION)

- [x] **INTEG-01**: 系统提供RESTful API接口
- [x] **INTEG-02**: 支持Webhook回调机制
- [x] **INTEG-03**: 支持与HIS系统对接（读取患者基础信息）
- [x] **INTEG-04**: 支持与CRM系统对接（同步患者数据）
- [x] **INTEG-05**: 支持与BI系统对接（推送业务数据）

## v2 Requirements

### 移动端

- **MOBILE-01**: 移动端Web适配（响应式设计）
- **MOBILE-02**: 微信小程序支持

### 智能化

- **AI-01**: 基于患者画像的个性化随访内容推荐
- **AI-02**: 患者流失风险预警
- **AI-03**: 需求转化预测

### 高级功能

- **ADV-01**: 支持HIS系统写入（回写检查结果）
- **ADV-02**: 营销自动化（患者生日提醒、复诊提醒）
- **ADV-03**: 第三方支付集成

## Out of Scope

| Feature | Reason |
|---------|--------|
| 移动端APP | Web端优先，移动端后续迭代 |
| 微信小程序 | 单独规划 |
| 实时聊天 | 非核心功能，增加复杂度 |
| AI智能推荐（v1） | 数据积累后作为差异化功能，v1聚焦基础能力 |
| 营销自动化 | 属于v2高级功能 |
| 第三方支付 | 非核心支付场景 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 ~ AUTH-10 | Phase 1 - Foundation | Pending |
| ORG-01 ~ ORG-03 | Phase 1 - Foundation | Pending |
| PATIENT-01 ~ PATIENT-05 | Phase 2 - Core Patient Objects | Pending |
| DEMAND-01 ~ DEMAND-05 | Phase 2 - Core Patient Objects | Pending |
| PATH-01 ~ PATH-05 | Phase 2 - Core Patient Objects | Pending |
| TOUCH-01 ~ TOUCH-05 | Phase 3 - Patient Engagement Operations | Pending |
| FOLLOW-01 ~ FOLLOW-06 | Phase 3 - Patient Engagement Operations | Pending |
| JOURNEY-01 ~ JOURNEY-03 | Phase 4 - Analytics and Journey | Completed |
| REPORT-01 ~ REPORT-03 | Phase 4 - Analytics and Journey | Completed |
| EXPER-01 ~ EXPER-04 | Phase 4 - Analytics and Journey | Completed |
| HEALTH-01 ~ HEALTH-03 | Phase 5 - Health and Integration | Pending |
| INTEG-01 ~ INTEG-05 | Phase 5 - Health and Integration | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
