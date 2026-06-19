MRRM - 医疗患者关系管理系统
Medical Patient Relationship Management System
MRRM 是一款面向医疗机构的多租户患者关系管理平台，涵盖患者档案管理、需求追踪、路径执行、触点管理、随访计划、健康档案及 AI 驱动的患者洞察能力。
技术栈
层级	技术
前端	React 19 + Ant Design 5 + React Router 7 + TanStack Query + Recharts + i18next
后端	NestJS + Prisma ORM + PostgreSQL + Redis + RabbitMQ
认证	JWT + Passport (Local/JWT/SSO) + RBAC
AI	Model Context Protocol (MCP) Server + Clawith AI 集成
部署	Docker Compose (开发) + Kubernetes / Helm (生产)
CLI	OpenClaw Shell (mrrm-mcp)
项目结构

MRRM/
├── backend/           # NestJS 后端
│   ├── src/
│   │   ├── ai/mcp/     # MCP Server 实现
│   │   ├── cli/        # OpenClaw CLI (shell / import)
│   │   └── ...
│   ├── prisma/         # 数据模型 & 迁移
│   └── dist/           # 编译产物 (bin: mrrm-mcp, mrrm-mcp-http)
├── frontend/           # React 前端 (Vite)
├── helm/mrrm/          # Kubernetes Helm Charts
├── k8s/                # K8s 配置文件
├── docs/superpowers/   # 系统增强设计文档
│   └── specs/          # 患者画像等详细规格
└── .planning/          # 需求、路线图、执行状态
核心功能
已完成 (Phase 1–6)
多租户隔离 — 机构级 Row-Level Security，数据完全隔离
身份认证与权限 — JWT 会话、账户锁定、SSO 支持、菜单 / 按钮级 RBAC
审计日志 — 全操作可追溯，保留至少 1 年
患者档案 — 基础档案 + 过敏史 / 既往史等医疗信息
需求管理 — 状态流转 (新建→跟进中→已成交→已完成→已关闭)
路径执行 — 路径模板 → 分配患者 → 执行追踪 → 超时提醒
触点管理 — 电话 / 短信 / 微信 / 现场等多类型，不可删除只作废
随访计划 — 关联路径步骤，自动生成任务，完成率可查
患者旅程 — 时间轴展示触点、需求、路径、随访全记录
体验管理 — 满意度汇总与趋势，异常下滑预警，支持导出
健康档案 — 既往史 / 过敏史 / 检查结果汇总 + 时间轴
报表中心 — 关键指标看板 (新增患者数、需求转化率、随访完成率)，按机构 / 时间筛选，支持 Excel 导出
系统集成 — RESTful API + Webhook + HIS/CRM/BI 对接适配器 (fire-and-forget 模式)
移动端适配 — 响应式 Web，移动端可用
AI 流失预警 — 规则模型 (最后就诊距今天数 40% + 满意度下降 30% + 触点下降 20% + 路径遗漏 10%)
营销自动化 — 生日提醒 (7 天窗口) + 复诊提醒 (种植 180d / 正畸 30d 等周期)
进行中 (Phase 7 / 分支 feat/openclaw-cli)
患者画像系统 — 生命周期阶段管理 + 自动 / 手动标签 + AI 置信度打标
生命周期阶段: DEVELOPMENT → PRE_TREATMENT → TREATMENT → MAINTENANCE
标签引擎：自动标签 (inactivity_30d, high_value 等) + AI 建议 + 人工确认
实时管道：就诊完成 → 更新统计 → 重算满意度 → 阶段推进检查 → AI 规则
定时批处理：每天凌晨 2 点执行全局标签检查
快速开始
前置条件
Node.js 18+
Docker & Docker Compose
PostgreSQL 15+, Redis 7+, RabbitMQ 3.12+
启动开发环境

# 后端
cd backend
cp .env .env.local  # 配置数据库/Redis/RabbitMQ 连接
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev

# 前端 (另一个终端)
cd frontend
npm install
npm run dev
使用 MCP CLI

cd backend
npx ts-node src/cli/openclaw.ts shell          # 交互式 Shell
npx ts-node src/cli/openclaw.ts import <file>   # 批量导入
API & MCP Server
后端暴露两个可执行入口:

mrrm-mcp        # MCP Server (stdio 模式，供 AI Agent 调用)
mrrm-mcp-http   # MCP Server (HTTP 模式)
开发路线图
Phase	内容	状态
1	基础设施 (认证 / 权限 / 多租户 / 审计)	✅ 完成
2	核心对象 (患者 / 需求 / 路径)	✅ 完成
3	患者运营 (触点 / 随访)	✅ 完成
4	分析与旅程	🔄 进行中
5	健康档案与系统集成	✅ 完成
6	移动端 + AI 智能	✅ 完成
7	患者画像 + AI 增强	🔄 进行中
完整需求清单见 .planning/REQUIREMENTS.md。
许可证
MIT
