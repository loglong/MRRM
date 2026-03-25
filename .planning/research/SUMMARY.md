# Project Research Summary

**Project:** MRRM - 医疗患者关系管理系统 (Medical Patient Relationship Management)
**Domain:** Healthcare CRM / Medical Patient Management System
**Researched:** 2026-03-25
**Confidence:** MEDIUM

## Executive Summary

MRRM is a medical CRM system designed for dental/oral healthcare institutions, focused on helping clinics improve patient conversion rates through standardized treatment pathways, optimize patient experience via full-touchpoint recording, and increase treatment completion rates through intelligent follow-up management. The system serves multi-tenant healthcare organizations requiring HIPAA-aligned data security, multi-location support, and deep patient journey tracking.

Experts build medical CRMs differently from standard CRMs by treating patient data as medical records rather than customer profiles, implementing strict multi-tenant isolation at the database level, and embedding clinical workflow logic (treatment pathways, follow-up protocols) into core functionality. The recommended technology stack prioritizes type safety, JSON-native data handling, and healthcare compliance-ready components: React 19 with Ant Design for the frontend, Node.js 24 LTS with NestJS for the backend, PostgreSQL 18 with Row-Level Security for multi-tenant isolation, and Prisma v7 for type-safe ORM.

Key risks include data model oversimplification that treats patients as customers rather than patients with medical histories, multi-tenant data isolation failures that could leak patient medical records between clinics, and follow-up systems that become decorative rather than integrated into clinical workflows. The architecture follows a dependency-driven 6-phase build order where foundational modules (Auth, User, Org) must precede patient-facing modules (Demand, Path, Followup), and analytics modules (Journey, Experience, Health Centers) must follow data accumulation.

## Key Findings

### Recommended Stack

**Core technologies:**
- **React 19.x + Ant Design 6.3.4** — Enterprise UI framework with comprehensive component library; project constraint confirmed
- **Node.js 24.14.1 LTS + NestJS** — TypeScript-first backend with modular architecture; JSON-native handling aligns with patient journey data structures
- **PostgreSQL 18.3** — Multi-tenant support via Row-Level Security (RLS) provides hardware-level tenant isolation critical for healthcare compliance
- **Prisma v7** — Type-safe ORM with migration system; works seamlessly with TypeScript and PostgreSQL
- **Redis 8.0** — Sub-millisecond caching for session management and query caching
- **TanStack Query v5** — Auto caching, background refetching for server state management
- **Zod 4.0** — TypeScript-first runtime validation replacing class-validator
- **Docker + Kubernetes 1.35** — Project constraints for containerization and orchestration

**Architecture pattern:** N-tier layered architecture with Domain-Driven Design modules, API Gateway pattern for request routing, and closed layer architecture (requests flow through adjacent layers only).

### Expected Features

**Must have (table stakes):**
- Patient records management — core entity; must support medical history, allergies, medications
- Demand/appointment management — patient acquisition funnel with status workflow
- Follow-up management — treatment completion rate保障; must integrate with treatment pathways
- Touchpoint recording — all patient interactions; must distinguish service touchpoints from clinical records
- Permission and user management — role-based access with tenant context
- Organization/tenant management — multi-clinic support with data isolation
- Audit logging — HIPAA-aligned operation traceability; immutable logs

**Should have (competitive):**
- Patient Journey Center — visualization of full patient lifecycle; primary differentiator
- Treatment Pathway Engine — standardized诊疗路径 configuration and execution tracking
- Touchpoint Analytics — data-driven patient experience optimization
- Multi-tenant Row-Level Security — PostgreSQL RLS for hardware-level data isolation

**Defer (v2+):**
- Experience Management Center — patient satisfaction tracking
- Health Management Center — long-term patient health records
- HIS system integration — complex; requires 2-3x buffer time
- BI system integration — depends on data accumulation
- AI intelligent recommendations — requires 1M+ patient data baseline

### Architecture Approach

The system follows N-tier architecture with closed layer patterns and Domain-Driven Design module decomposition. The module dependency graph establishes a 6-phase build order: Phase 1 (Auth, User, Org) as foundation with no cross-module dependencies; Phase 2 (Demand, Path) as core business objects; Phase 3 (Touchpoint, Followup) as operational modules recording patient interactions; Phase 4 (Report, Journey Center) as analytics dependent on operational data; Phase 5 (Experience Center) as cross-cutting analytics; Phase 6 (Health Center) as the apex depending on complete patient journey data.

Multi-tenant isolation is implemented via schema-per-tenant pattern with PostgreSQL Row-Level Security policies. All data access passes through a Data Access Layer that automatically injects tenant_id, ensuring no cross-tenant data leakage. The API Gateway layer handles authentication validation, tenant context extraction, and request routing before business services execute domain logic.

### Critical Pitfalls

1. **Data model oversimplification** — Treating patients as customers而非 patients with medical histories leads to safety risks and compliance violations. Prevention: Design patient health records as core entity; consult medical experts during data model review.

2. **Multi-tenant data isolation breach** — Missing tenant_id in queries or cache key design allows cross-tenant data access. Prevention: Data access layer must强制 inject tenant_id; all queries must explicitly declare tenant context; cache keys must use tenant prefixes.

3. **Mixing touchpoints with clinical records** — Using generic CRM interaction models for medical records violates clinical data integrity. Prevention: Distinguish "service touchpoints" (appointments, satisfaction surveys) from "medical records" (diagnoses, prescriptions); use structured fields for clinical data.

4. **Follow-up becoming decorative** — Follow-up plans not integrated with treatment workflows result in low execution rates. Prevention: Follow-up must关联 specific treatment pathways; design one-click execution to reduce physician workload; integrate into daily work reminders.

5. **HIS integration complexity underestimation** — Assuming standard interfaces when real HIS integrations require custom development. Prevention: Allocate 2-3x buffer time; require interface specs in contracts; build Mock Server for parallel development; design degradation path.

## Implications for Roadmap

Based on research, the recommended phase structure follows the module dependency graph from ARCHITECTURE.md, incorporates MVP priorities from FEATURES.md, and mitigates critical pitfalls from PITFALLS.md.

### Phase 1: Foundation Modules
**Rationale:** No cross-module dependencies; all other modules depend on authentication and organization context. Critical to establish multi-tenant isolation patterns early to avoidPitfall 2.

**Delivers:** Authentication service, user management, organization/tenant management, role-based permissions, audit logging infrastructure

**Addresses:** User management (P0), permission management (P0), organization management (P0), audit logging (P0), multi-tenant isolation (P0)

**Avoids:** Pitfall 2 (data isolation breach) — establishing RLS patterns from day one

### Phase 2: Core Patient Business Objects
**Rationale:** Patient and demand modules form the core workflow; they depend on Phase 1 auth/org but not on each other. This is where medical CRM differs from generic CRM — must establish proper patient data model to avoid Pitfall 1.

**Delivers:** Patient records with medical history fields, demand management with status workflow engine, treatment pathway configuration (basic)

**Addresses:** Patient records (P0), demand management (P0), basic path management (P0)

**Avoids:** Pitfall 1 (data model oversimplification) — design patient health record as core entity with medical fields; Pitfall 3 (touchpoint/clinical mixing) — establish clear data model boundaries

### Phase 3: Patient Engagement Operations
**Rationale:** Touchpoint and follow-up modules record patient interactions; they depend on patient and demand from Phase 2. This is where follow-up execution must be designed to avoid becoming decorative (Pitfall 4).

**Delivers:** Touchpoint recording (service interactions only), follow-up planning linked to treatment pathways, follow-up execution with one-click action, follow-up tracking and completion rate analytics

**Addresses:** Touchpoint management (P0), follow-up management (P0), patient journey center basic view (P1)

**Avoids:** Pitfall 4 (follow-up decoration) — follow-up must integrate with treatment pathways and minimize physician friction

### Phase 4: Analytics and Patient Journey
**Rationale:** Reporting and patient journey center depend on operational data from Phase 3; cannot build meaningful analytics without patient interaction history.

**Delivers:** Basic touchpoint analytics, patient journey visualization, initial KPI dashboards

**Addresses:** Patient journey center (P1), touchpoint analytics (P1)

**Research Flag:** Analytics queries may expose N+1 problems at scale (100万+ patients); plan for query optimization during this phase

### Phase 5: Experience and Advanced Features
**Rationale:** Experience management is a differentiator but not table stakes; depends on full operational stack.

**Delivers:** Patient satisfaction surveys, experience metrics, feedback management

**Addresses:** Experience management center (P2), health management center (P2) — partial

### Phase 6: System Integration
**Rationale:** HIS/BI integration has highest risk of underestimation (Pitfall 5); should come after core system is stable and proven. Must allocate 2-3x buffer time.

**Delivers:** HIS system adapter, BI system adapter, message queue infrastructure for async integration

**Addresses:** HIS system integration (P2), BI system integration (P2)

**Research Flag:** HIS integration complexity requires dedicated research phase due to vendor variability and contract negotiation requirements

### Phase Ordering Rationale

1. **Foundation-first:** Auth, User, Org must precede all other modules; multi-tenant isolation patterns must be established early to avoid security debt
2. **Core patient data before engagement:** Patient records must be stable before recording interactions; medical data model quality determines system value
3. **Operational before analytics:** Touchpoint and follow-up must accumulate data before meaningful analytics can be built
4. **Differentiation last:** Experience and health centers depend on mature operational data; premature building yields low value
5. **Integration as separate track:** HIS/BI integration has unique risks and should not block core development

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (Core Patient Objects):** Patient data model review with medical experts; verify medical record field requirements against regulations
- **Phase 3 (Follow-up):** Follow-up channel strategy (phone/sms/WeChat); integration with physician workflow
- **Phase 6 (Integration):** HIS interface specifications; vendor contract requirements; mock server architecture

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Auth, permissions, tenant management are well-documented patterns
- **Phase 4 (Analytics):** Standard reporting patterns; only needs performance validation

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Most technologies verified via official documentation; NestJS version not directly verified; Prisma v7 based on ecosystem |
| Features | MEDIUM | Based on domain knowledge and PROJECT.md; WebSearch API unavailable for competitor validation |
| Architecture | MEDIUM | N-tier patterns verified; DDD module decomposition reasonable but healthcare-specific patterns need validation |
| Pitfalls | MEDIUM | Based on domain knowledge; unable to verify against implementation case studies |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Patient data model validation:** Need medical expert review of patient record fields; current research may oversimplify medical data requirements
- **Competitor product validation:** Unable to verify findings against 领健, 欢乐口腔 etc. due to search API unavailability
- **HIS integration specifics:** Interface requirements depend on target HIS vendors; needs early vendor engagement
- **Regulatory compliance details:** HIPAA alignment needs legal review; Chinese医疗 data regulations may have specific requirements
- **Follow-up channel strategy:** Primary follow-up channel (phone/sms/WeChat) affects system design; needs user research

## Sources

### Primary (HIGH confidence)
- React 19 release: https://react.dev/blog (October 2025)
- Ant Design 6.3.4: https://github.com/ant-design/ant-design/releases (March 2025)
- Node.js 24 LTS: https://nodejs.org/en/blog (v24.14.1)
- PostgreSQL 18.3: https://www.postgresql.org/docs/ (February 2026)
- Kubernetes 1.35: https://kubernetes.io/
- Microsoft N-tier Architecture: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier
- PostgreSQL Schema Documentation: https://www.postgresql.org/docs/current/ddl-schemas.html

### Secondary (MEDIUM confidence)
- NestJS framework: https://nestjs.com/
- Prisma v7: https://www.prisma.io/docs
- TanStack Query: https://tanstack.com/query/latest
- Zod 4.0: https://zod.dev/
- Redis 8.0: https://redis.io/
- RabbitMQ 4.2.5: https://www.rabbitmq.com/
- Auth0: https://auth0.com/docs/get-started

### Tertiary (LOW confidence — needs validation)
- Medical CRM feature landscape: Domain knowledge synthesis; recommend competitor analysis
- Healthcare CRM pitfalls: Domain knowledge; recommend validation with healthcare IT architects
- Patient journey patterns: General CRM knowledge applied to medical context; needs medical expert input

---

*Research completed: 2026-03-25*
*Ready for roadmap: yes*