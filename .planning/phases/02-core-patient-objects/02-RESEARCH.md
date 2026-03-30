# Phase 02: Core Patient Objects - Research

**Researched:** 2026-03-30
**Domain:** Patient management, demand lifecycle, technical path execution
**Confidence:** HIGH (sources: existing codebase analysis, verified schema, confirmed plan structure)

## Summary

Phase 02 implements three core business objects on top of the Phase 01 foundation. The Patient module is already fully implemented (backend CRUD + frontend UI). The Demands and Paths modules require net-new backend services and frontend pages. The schema already defines `Patient`, `Demand`, `Path`, and `PathStep` models, but needs additional tables for status history and instance tracking. The main complexity lies in the demand status state machine and the path instance step execution flow.

**Primary recommendation:** Follow the existing three-wave plan structure (02-01 Patient complete, 02-02 Path template + instance + follow-up triggering, 02-03 Demand CRUD + status flow + history). The Demand status schema uses different enum values than the plan specifies -- align to the schema's existing `DemandStatus` enums (OPEN/IN_PROGRESS/PENDING/FULFILLED/CANCELLED/LOST) rather than the plan's (NEW/IN_PROGRESS/CONVERTED/COMPLETED/CLOSED) to avoid schema migrations.

---

## User Constraints (from CONTEXT.md)

*No CONTEXT.md exists for this phase -- no locked decisions, discretion areas, or deferred ideas to copy.*

---

## Standard Stack

### Core (Verified from existing codebase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| NestJS | 11.1.17 | Backend framework | Modular, dependency-injection, TypeScript-first |
| Prisma ORM | 7.6.0 | Database ORM | Type-safe, migration system, schema-first |
| Zod | 4.3.6 | Runtime validation | TypeScript-first schema validation |
| React 19 | 19.x | Frontend UI | Project constraint, market leader |
| Ant Design 5 | 6.x | Component library | Project constraint, enterprise components |
| i18next | Latest | Internationalization | Project constraint, react-i18next pattern |
| JWT (jsonwebtoken) | Latest | Auth tokens | Phase 01 established pattern |

**Installation (if adding new packages):**
```bash
# Backend - no new packages needed, all established
# Frontend - no new packages needed, all established
```

**Version verification:** NestJS 11.1.17, Prisma 7.6.0, Zod 4.3.6 confirmed via npm view on 2026-03-30.

### Phase 02 Module Inventory

| Module | Backend Status | Frontend Status | Notes |
|--------|---------------|----------------|-------|
| Patient | Fully implemented | Fully implemented | Module, service, controller, DTOs, pages all exist |
| Demand | **Missing** -- needs module | **Missing** -- needs full implementation | Placeholder DemandsPage.tsx exists (empty stub) |
| Path | **Missing** -- needs module | **Missing** -- needs full implementation | Placeholder PathsPage.tsx exists (empty stub) |
| PathInstance | **Missing** -- needs table + service | **Missing** | Tracks assigned path execution per patient/demand |
| DemandStatusHistory | **Missing** -- needs table + service | **Missing** | Tracks status transitions |

---

## Architecture Patterns

### Recommended Project Structure

```
backend/src/
├── patients/          # EXISTS - full CRUD + encryption
├── demands/           # NEEDS CREATION
│   ├── demands.module.ts
│   ├── demands.controller.ts
│   ├── demands.service.ts
│   ├── dto/
│   │   ├── create-demand.dto.ts
│   │   ├── update-demand.dto.ts
│   │   ├── change-status.dto.ts
│   │   └── demand-filters.dto.ts
│   └── entities/
│       ├── demand.entity.ts
│       └── demand-status-history.entity.ts
├── paths/             # NEEDS CREATION
│   ├── paths.module.ts
│   ├── paths.controller.ts
│   ├── paths.service.ts
│   ├── dto/
│   └── entities/
└── path-instances/   # NEEDS CREATION (if separate from paths module)
    ├── path-instances.module.ts
    ├── path-instances.service.ts
    └── dto/

frontend/src/
├── pages/
│   ├── demands/       # NEEDS CREATION
│   │   ├── DemandsPage.tsx
│   │   ├── DemandFormModal.tsx
│   │   └── DemandDetailModal.tsx
│   └── paths/         # NEEDS CREATION
│       ├── PathsPage.tsx
│       ├── PathTemplateDetailPage.tsx
│       └── PathAssignmentModal.tsx
└── api/
    ├── demands.ts     # NEEDS CREATION
    └── paths.ts       # NEEDS CREATION
```

### Pattern 1: NestJS Module Structure (Established)

**Follow exactly the PatientsModule pattern:**
- `module.ts` -- imports PrismaModule, exports service
- `controller.ts` -- REST endpoints with `@UseGuards(JwtAuthGuard)`, extracts `orgId` from `req.user.orgId`
- `service.ts` -- business logic, injects `PrismaService` and `Logger`
- `dto/` -- Zod schemas with `.extend()` for derived types
- `entities/` -- TypeScript interfaces matching Prisma models

### Pattern 2: Multi-tenant Data Isolation (Established)

Every service method MUST include `orgId` in queries:
```typescript
// Source: existing patients.service.ts pattern
async findAll(orgId: string, page = 1, limit = 20, filters?: {...}) {
  const where: any = { orgId, deletedAt: null };
  // ... filters
  return this.prisma.patient.findMany({ where, skip, take, orderBy });
}
```

### Pattern 3: Soft Delete (Established)

Patient uses `deletedAt` null-check pattern -- Demands and Paths should follow the same:
```typescript
// In find/update methods
where: { id, deletedAt: null }
```
For Paths: add `deletedAt DateTime?` to PathTemplate and PathInstance models.

### Pattern 4: Medical Field Encryption (Established)

Patient module encrypts `allergyHistory` and `pastHistory` via `EncryptionService`. Demands and Paths do not have sensitive medical fields requiring encryption -- this pattern is NOT needed for Phase 2 modules.

### Pattern 5: Status State Machine (New - for Demands)

Demand status transitions must follow a state machine. The schema defines:
```
DemandStatus: OPEN | IN_PROGRESS | PENDING | FULFILLED | CANCELLED | LOST
```

**Valid transitions (aligned to schema):**
```
OPEN -> IN_PROGRESS
OPEN -> CANCELLED
IN_PROGRESS -> PENDING
IN_PROGRESS -> FULFILLED
IN_PROGRESS -> CANCELLED
IN_PROGRESS -> LOST
PENDING -> FULFILLED
PENDING -> CANCELLED
FULFILLED -> CLOSED (via explicit close action)
```

Note: The plan specifies `NEW/IN_PROGRESS/CONVERTED/COMPLETED/CLOSED` but the schema uses `OPEN/IN_PROGRESS/PENDING/FULFILLED/CANCELLED/LOST`. Use schema enums directly to avoid migration. The business meaning maps: NEW=OPEN, CONVERTED=FULFILLED, COMPLETED=CLOSED.

### Pattern 6: Path Instance Tracking (New - for Paths)

When a path template is assigned to a patient demand:
1. Create `PathInstance` record (links template + patient + demand)
2. For each `PathStep` in the template, create a `PathInstanceStep` with:
   - `dueDate` = startDate + cumulative executeDays
   - `status` = PENDING
3. First step becomes `currentStep`

Tracking: `completedCount`, `currentStep` index, `pendingCount`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State machine validation | Custom if/else chains for status transitions | Explicit transition map object | Readable, testable, prevents invalid transitions |
| Pagination | Manual offset calculation | Prisma `skip`/`take` with helper | Already established pattern |
| Multi-filter queries | Building dynamic where objects manually | Prisma composed where with spread | Type-safe, consistent |
| Soft delete | Hard DELETE | `deletedAt` null-check in all queries | Audit trail, data recovery |
| orgId extraction | Repeated `req.user.orgId` in every method | Extract once per controller method, pass to service | DRY, consistent |

---

## Common Pitfalls

### Pitfall 1: Demand Status Enum Mismatch
**What goes wrong:** Plan specifies `NEW/IN_PROGRESS/CONVERTED/COMPLETED/CLOSED` but schema uses `OPEN/IN_PROGRESS/PENDING/FULFILLED/CANCELLED/LOST`. Implementing the plan's enum names requires a schema migration.
**Why it happens:** Schema was designed independently of plan document.
**How to avoid:** Use schema enums as source of truth. Map business labels in the UI layer.
**Warning signs:** Seeing enum value `NEW` in code when schema defines `OPEN`.

### Pitfall 2: Missing PathInstance Tables
**What goes wrong:** Path template can be created but cannot be assigned to a patient without `PathInstance` and `PathInstanceStep` tables.
**Why it happens:** Plan 02-02 mentions these tables but they are not in the current schema.
**How to avoid:** Before implementing wave 2, add `PathInstance`, `PathInstanceStep`, `DemandStatusHistory` tables via Prisma migration.
**Warning signs:** `PathInstance` model not found in schema.prisma during 02-02 implementation.

### Pitfall 3: orgId Not Propagated to Related Records
**What goes wrong:** When creating Demand linked to Patient, `orgId` must be set from JWT context, not inferred from patient.
**Why it happens:** Patient and Demand both have orgId -- proper tenant isolation requires explicit propagation.
**How to avoid:** Always extract `orgId` from JWT (`req.user.orgId`) in controller, pass to service, include in all `create()` calls.
**Warning signs:** Demand queries returning cross-tenant data in tests.

### Pitfall 4: Cascading Deletes Not Configured
**What goes wrong:** Deleting a PathTemplate does not clean up PathSteps.
**Why it happens:** Prisma `@relation(onDelete: Cascade)` not set on PathStep.
**How to avoid:** Set `onDelete: Cascade` on all child-entity relations (PathStep -> PathTemplate, DemandStatusHistory -> Demand, PathInstanceStep -> PathInstance).
**Warning signs:** Orphaned records after template deletion.

### Pitfall 5: Frontend Demands/Paths API Not Created
**What goes wrong:** Placeholder pages reference `demandsApi` and `pathsApi` that do not exist.
**Why it happens:** Placeholder pages were created but corresponding API files were not.
**How to avoid:** Create `frontend/src/api/demands.ts` and `frontend/src/api/paths.ts` following the `patients.ts` pattern before implementing frontend pages.
**Warning signs:** `demandsApi is not defined` or `pathsApi is not defined` during frontend implementation.

---

## Code Examples

### Status State Machine Pattern (Demand)

```typescript
// Source: demand status transition validation pattern
// File: backend/src/demands/demands.service.ts

const VALID_TRANSITIONS: Record<DemandStatus, DemandStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PENDING', 'FULFILLED', 'CANCELLED', 'LOST'],
  PENDING: ['FULFILLED', 'CANCELLED'],
  FULFILLED: ['CLOSED'],
  CLOSED: [], // terminal
  CANCELLED: [],
  LOST: [],
};

async changeStatus(id: string, newStatus: DemandStatus, userId: string, notes?: string): Promise<Demand> {
  const demand = await this.prisma.demand.findUnique({ where: { id } });

  const validNextStatuses = VALID_TRANSITIONS[demand.status];
  if (!validNextStatuses.includes(newStatus)) {
    throw new BadRequestException(
      `Invalid status transition from ${demand.status} to ${newStatus}`
    );
  }

  // Create history record
  await this.prisma.demandStatusHistory.create({
    data: {
      demandId: id,
      fromStatus: demand.status,
      toStatus: newStatus,
      changedBy: userId,
      notes,
    },
  });

  return this.prisma.demand.update({
    where: { id },
    data: { status: newStatus, closedAt: newStatus === 'CLOSED' ? new Date() : undefined },
  });
}
```

### Path Instance Creation Pattern

```typescript
// Source: path instance creation pattern
// File: backend/src/paths/paths.service.ts

async assignToPatient(templateId: string, patientId: string, demandId: string, orgId: string, startDate: Date = new Date()): Promise<PathInstance> {
  const template = await this.prisma.path.findUnique({
    where: { id: templateId },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });

  if (!template) throw new NotFoundException('Path template not found');

  // Create instance
  const instance = await this.prisma.pathInstance.create({
    data: {
      pathId: templateId,
      patientId,
      demandId,
      orgId,
      status: 'IN_PROGRESS',
      currentStep: 1,
    },
  });

  // Create instance steps with calculated due dates
  let cumulativeDays = 0;
  const instanceSteps = template.steps.map((step, idx) => {
    cumulativeDays += step.estimatedDays || 0;
    return {
      instanceId: instance.id,
      stepId: step.id,
      stepOrder: step.stepOrder,
      status: idx === 0 ? 'IN_PROGRESS' : 'PENDING',
      dueDate: new Date(startDate.getTime() + cumulativeDays * 24 * 60 * 60 * 1000),
    };
  });

  await this.prisma.pathInstanceStep.createMany({ data: instanceSteps });
  return instance;
}
```

### Frontend API Pattern (from patients.ts)

```typescript
// Source: frontend/src/api/patients.ts (established pattern)
// Use same pattern for demands.ts and paths.ts

import api from './auth';

export interface Demand {
  id: string;
  patientId: string;
  orgId: string;
  type: DemandType;
  title: string;
  description: string | null;
  status: DemandStatus;
  priority: Priority;
  createdAt: string;
}

export const demandsApi = {
  list: (params?: DemandFilters): Promise<PaginatedResponse<Demand>> => {
    return api.get('/demands', { params });
  },
  create: (data: CreateDemandDto): Promise<Demand> => {
    return api.post('/demands', data);
  },
  update: (id: string, data: UpdateDemandDto): Promise<Demand> => {
    return api.put(`/demands/${id}`, data);
  },
  changeStatus: (id: string, status: DemandStatus, notes?: string): Promise<Demand> => {
    return api.put(`/demands/${id}/status`, { status, notes });
  },
  getHistory: (id: string): Promise<DemandStatusHistory[]> => {
    return api.get(`/demands/${id}/history`);
  },
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hard delete for patients | Soft delete via `deletedAt` | Phase 01 | Audit trail, data recovery |
| Status as free-form string | Status as PostgreSQL enum | Schema design | Type safety, DB-level constraints |
| No history tracking | Status history table with FK | Phase 02 (new) | Full audit of demand lifecycle |
| Path templates only | Template + Instance separation | Phase 02 (new) | Enables per-patient path execution tracking |
| Manual step sequencing | StepOrder + estimatedDays calculation | Phase 02 (new) | Automatic due date calculation |

**Schema items not yet in schema.prisma (needed for Phase 02):**
- `DemandStatusHistory` table -- tracks each status transition with user + timestamp
- `PathInstance` table -- tracks assigned path per patient/demand
- `PathInstanceStep` table -- tracks each step's status within an instance
- `PathInstanceStatus` enum: IN_PROGRESS, COMPLETED, CANCELLED
- `PathStepStatus` enum: PENDING, IN_PROGRESS, COMPLETED, SKIPPED, OVERDUE

---

## Open Questions

1. **Demand status mapping ambiguity**
   - What we know: Plan specifies NEW/IN_PROGRESS/CONVERTED/COMPLETED/CLOSED; schema specifies OPEN/IN_PROGRESS/PENDING/FULFILLED/CANCELLED/LOST
   - What's unclear: Whether the plan's status names are authoritative or the schema's. The semantic mapping is non-obvious (is FULFILLED=CONVERTED? is CLOSED=COMPLETED?)
   - Recommendation: Use schema enums as-is for backend. In frontend UI, display business-friendly labels via i18n mapping. Do not rename schema enums -- it requires migration.

2. **Path timeout notification mechanism**
   - What we know: Plan says "in-system notification only" (no external notifications in MVP)
   - What's unclear: No `Notification` model exists in schema yet. Need to determine if PATH-05 notification uses a new Notification table or reuses existing audit logging.
   - Recommendation: Create minimal `Notification` model with userId, title, message, link, read. Reuse existing RabbitMQ infrastructure from Phase 01 for async delivery.

3. **Demand `source` field usage**
   - What we know: Schema has `DemandSource` enum (PHONE/WECHAT/WEB/WALK_IN/REFERRAL/CAMPAIGN/OTHER)
   - What's unclear: The plan doesn't mention source filtering (DEMAND-04 says filter by patient/status/date only)
   - Recommendation: Include source in DemandFiltersDto but don't make it a primary UI filter yet.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (via `npm run test`) |
| Config file | `backend/jest.config.js` or `jest.config.ts` |
| Quick run command | `cd backend && npm run test -- --testPathPattern=demands --passWithNoTests 2>&1 \| tail -20` |
| Full suite command | `cd backend && npm run test 2>&1 \| tail -20` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PATIENT-01 | Create patient with name/gender/age/contact | unit | `cd backend && npm run test -- --testPathPattern=patients --passWithNoTests 2>&1 \| tail -5` | YES |
| PATIENT-02 | Medical fields (allergy/past history) stored encrypted | unit | Manual verify: check encrypted value in DB | YES (encryption module exists) |
| PATIENT-03 | Search by name/phone精准 | unit | `cd backend && npm run test -- --testPathPattern=patients --passWithNoTests` | YES |
| PATIENT-04 | Edit patient record | unit | Same as PATIENT-01 | YES |
| PATIENT-05 | Patient tier stratification | unit | Same as PATIENT-01 | YES |
| DEMAND-01 | Create demand linked to patient | unit | `cd backend && npm run test -- --testPathPattern=demands --passWithNoTests 2>&1 \| tail -5` | NO - needs file |
| DEMAND-02 | Status transitions follow valid flow | unit | Test status state machine transitions | NO - needs file |
| DEMAND-03 | Status history recorded | unit | Verify DemandStatusHistory records created | NO - needs file |
| DEMAND-04 | Filter by patient/status/date | unit | Test filter combinations | NO - needs file |
| DEMAND-05 | Demand -> patientId FK | unit | Verify patient demands via `include` | NO - needs file |
| PATH-01 | PathTemplate CRUD with steps | unit | `cd backend && npm run test -- --testPathPattern=paths --passWithNoTests 2>&1 \| tail -5` | NO - needs file |
| PATH-02 | Step has executeDays + responsibleRole | unit | Verify PathStep has required fields | NO - needs file |
| PATH-03 | Assign template to patient demand | unit | Test PathInstance creation | NO - needs file |
| PATH-04 | Track completed/current/pending steps | unit | Test step status progression | NO - needs file |
| PATH-05 | Overdue detection + notification | unit | Test overdue step detection | NO - needs file |

### Sampling Rate
- **Per task commit:** `npm run test -- --testPathPattern={module} --passWithNoTests`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- `backend/src/demands/demands.service.spec.ts` -- covers DEMAND-01 through DEMAND-05
- `backend/src/paths/paths.service.spec.ts` -- covers PATH-01 through PATH-05
- `frontend/src/api/demands.ts` -- frontend API client (referenced by existing DemandsPage placeholder)
- `frontend/src/api/paths.ts` -- frontend API client (referenced by existing PathsPage placeholder)
- `prisma/schema.prisma` additions:
  - `DemandStatusHistory` model
  - `PathInstance` model + `PathInstanceStatus` enum
  - `PathInstanceStep` model + `PathStepStatus` enum
  - `Notification` model (for PATH-05)
- No Jest config file found in backend -- verify `jest.config.js` or `jest.config.ts` exists and is configured for `ts-jest`

---

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `backend/src/patients/` (module, service, controller, DTOs)
- `backend/prisma/schema.prisma` -- all entity definitions, enums, relations
- `frontend/src/pages/patients/PatientsPage.tsx` -- established frontend patterns
- `frontend/src/api/patients.ts` -- established API client pattern
- `backend/src/app.module.ts` -- module registration pattern

### Secondary (MEDIUM confidence)
- Phase 02 plan files: `02-01-PLAN.md`, `02-02-PLAN.md`, `02-03-PLAN.md` -- planned implementation details
- `.planning/research/STACK.md` -- technology stack with versions

### Tertiary (LOW confidence)
- NestJS 11 patterns -- inferred from existing code structure (no direct docs verified)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all from verified existing codebase
- Architecture: HIGH -- all patterns from established Phase 01 implementation
- Pitfalls: MEDIUM -- identified through schema/plan comparison, not from failed implementations

**Research date:** 2026-03-30
**Valid until:** 2026-04-29 (30 days -- stable domain, no fast-moving technology changes expected)
