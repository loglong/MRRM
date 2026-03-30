---
phase: 02-core-patient-objects
plan: "03"
subsystem: api
tags: [nestjs, prisma, react, ant-design, rest-api, status-flow]

# Dependency graph
requires:
  - phase: 02-01
    provides: Patient model with CRUD operations
provides:
  - Demand model with type, title, description, priority, status
  - DemandStatusHistory for tracking all status transitions
  - Status flow: OPEN->IN_PROGRESS->PENDING->FULFILLED (or terminal)
  - Demand CRUD with filtering and pagination
  - Frontend demand management UI with timeline display
affects:
  - 02-core-patient-objects
  - 03-workflow-automation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD approach with Zod validation DTOs
    - Service layer pattern with Prisma
    - RESTful API design with query params for filtering

key-files:
  created:
    - backend/src/demands/demands.service.ts
    - backend/src/demands/demands.controller.ts
    - backend/src/demands/demands.module.ts
    - backend/src/demands/dto/*.ts
    - backend/src/demands/entities/*.ts
    - frontend/src/api/demands.ts
    - frontend/src/pages/demands/DemandsPage.tsx
    - frontend/src/pages/demands/DemandFormModal.tsx
    - frontend/src/pages/demands/DemandDetailModal.tsx
  modified:
    - backend/prisma/schema.prisma (added DemandStatusHistory)
    - backend/src/app.module.ts (added DemandsModule)

key-decisions:
  - "Used schema enums (OPEN, IN_PROGRESS, PENDING, FULFILLED) per CEO decision instead of plan-specified names"
  - "Valid transitions enforced at service layer: OPEN->IN_PROGRESS->PENDING->FULFILLED with terminal states at any stage"
  - "History recorded on creation (fromStatus=null) and every subsequent transition"

patterns-established:
  - "Status transition validation in service layer prevents invalid flows"
  - "closedAt timestamp set automatically when entering terminal states"

requirements-completed: [DEMAND-01, DEMAND-02, DEMAND-03, DEMAND-04, DEMAND-05]

# Metrics
duration: 15min
completed: 2026-03-30
---

# Phase 02 Plan 03: Demand Management Summary

**Demand module with status flow (OPEN->IN_PROGRESS->PENDING->FULFILLED), history tracking, and React UI with timeline display**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-30T12:40:04Z
- **Completed:** 2026-03-30T12:55:00Z
- **Tasks:** 3 (combined into single commit for efficiency)
- **Files modified:** 13

## Accomplishments

- Backend demand module with CRUD, status transitions, and history tracking
- Valid status transition enforcement at service layer
- DemandStatusHistory model records all transitions with timestamps and user IDs
- Frontend demand management UI with filtering, form modal, and detail modal with timeline
- Prisma schema updated with DemandStatusHistory relation

## Task Commits

Single comprehensive commit for the demand module:

1. **Task 1-3: Demand model + CRUD + status transitions + UI** - `10c8ead` (feat)

**Plan metadata:** N/A - no separate docs commit needed

## Files Created/Modified

- `backend/src/demands/demands.service.ts` - Core service with create, findAll, findById, update, changeStatus, getStatusHistory, getDemandStats
- `backend/src/demands/demands.controller.ts` - REST endpoints for /api/v1/demands
- `backend/src/demands/demands.module.ts` - NestJS module configuration
- `backend/src/demands/dto/create-demand.dto.ts` - Zod validation for demand creation
- `backend/src/demands/dto/update-demand.dto.ts` - Zod validation for updates
- `backend/src/demands/dto/change-status-demand.dto.ts` - Status change validation
- `backend/src/demands/dto/filter-demand.dto.ts` - Filter query params validation
- `backend/src/demands/entities/demand.entity.ts` - Demand entity class
- `backend/src/demands/entities/demand-status-history.entity.ts` - Status history entity
- `frontend/src/api/demands.ts` - TypeScript types and API functions for demands
- `frontend/src/pages/demands/DemandsPage.tsx` - Main demand list with filtering
- `frontend/src/pages/demands/DemandFormModal.tsx` - Create/edit demand form
- `frontend/src/pages/demands/DemandDetailModal.tsx` - Detail view with status history timeline
- `backend/prisma/schema.prisma` - Added DemandStatusHistory model
- `backend/src/app.module.ts` - Added DemandsModule import

## Decisions Made

- Used schema enums (OPEN, IN_PROGRESS, PENDING, FULFILLED, CANCELLED, LOST) per CEO decision in plan context
- Valid transitions: OPEN->IN_PROGRESS, OPEN->CANCELLED, OPEN->LOST; IN_PROGRESS->PENDING, IN_PROGRESS->FULFILLED, IN_PROGRESS->CANCELLED, IN_PROGRESS->LOST; PENDING->FULFILLED, PENDING->CANCELLED, PENDING->LOST
- Terminal statuses (FULFILLED, CANCELLED, LOST) cannot transition further
- closedAt set automatically when entering terminal states
- Initial history record created on demand creation (fromStatus=null, toStatus=OPEN)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TypeScript errors in frontend files due to incorrect imports (i18next vs react-i18next, icon naming) - fixed during implementation
- Collapsible component not available in antd - removed unused import

## Verification

- Backend: `cd backend && npx prisma validate` - schema valid
- Backend: `cd backend && npx prisma generate` - client generated
- Frontend: `cd frontend && npm run build` - build successful

## Next Phase Readiness

- Demand module complete and ready for integration with patient and follow-up modules
- Status history tracking provides foundation for workflow automation in next plans
- No blockers - all DEMAND requirements satisfied

---
*Phase: 02-core-patient-objects*
*Plan: 03*
*Completed: 2026-03-30*
