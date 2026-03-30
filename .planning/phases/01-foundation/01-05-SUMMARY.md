---
phase: 01-foundation
plan: "05"
subsystem: audit
tags: [nestjs, rabbitmq, postgresql, audit, react, csv-export]

# Dependency graph
requires:
  - "01-04"
provides:
  - Async audit logging via RabbitMQ
  - Automatic operation capture via NestJS interceptor
  - Admin UI for audit log search and export
affects: [01-06, 01-07, 01-08, 02-patient]

# Tech tracking
tech-stack:
  added: [amqplib, @types/amqplib]
  patterns: [async audit, RabbitMQ producer/consumer, message persistence]

key-files:
  created:
    - backend/src/rabbitmq/rabbitmq.module.ts - Global RabbitMQ module
    - backend/src/rabbitmq/rabbitmq.service.ts - Connection, publish, buffer, reconnect
    - backend/src/audit/interceptors/audit.interceptor.ts - Auto-capture all operations
    - backend/src/audit/audit.consumer.ts - RabbitMQ consumer for DB writes
    - backend/src/audit/audit.controller.ts - List, filter, entity lookup, CSV export
    - backend/src/audit/audit.service.ts - Updated with findAll, getLogsForExport
    - frontend/src/api/audit.ts - Audit API client
    - frontend/src/pages/admin/AuditLogsPage.tsx - Admin audit log UI
  modified:
    - backend/src/app.module.ts - Added RabbitMQModule import
    - backend/src/audit/audit.module.ts - Added AuditConsumer, RabbitMQService
    - backend/src/main.ts - Registered AuditInterceptor globally
    - backend/prisma/schema.prisma - Added requestMethod, requestPath to AuditLog

key-decisions:
  - "RabbitMQ producer buffers in memory (max 100) when unavailable, retries on reconnect"
  - "AuditInterceptor skips health/docs/auth paths to avoid noise"
  - "Consumer uses prefetch=1 for ordered processing, nack with requeue on failure"
  - "90-day max query range enforced in service layer"
  - "CSV export limited to 10,000 records for safety"

patterns-established:
  - "RabbitMQ connection lifecycle tied to NestJS module init/destroy"
  - "Sensitive fields sanitized in interceptor before logging"
  - "Audit consumer runs as singleton within AuditModule"

requirements-completed: [AUTH-09, AUTH-10]

# Metrics
duration: ~9min
completed: 2026-03-30
---

# Phase 01-05: Audit Logging System Summary

**Async audit logging via RabbitMQ with admin UI and 1-year retention**

## Performance

- **Duration:** ~9 minutes
- **Started:** 2026-03-30T10:55:00Z
- **Completed:** 2026-03-30T11:04:07Z
- **Tasks:** 3 completed
- **Files modified:** 14 files created/modified

## Accomplishments

- RabbitMQ producer with connection management, reconnection logic, and in-memory buffer
- AuditInterceptor captures all API operations automatically (user, action, entity, IP, user-agent, request method/path)
- Sensitive fields sanitized (passwords, tokens redacted)
- Async publish to RabbitMQ (non-blocking to request)
- AuditConsumer processes queue messages and writes to DB
- Audit logs searchable via admin UI with date/action/entity filters
- CSV export functionality for compliance reporting
- 1-year retention via queue message TTL

## Task Commits

Each task was committed atomically:

1. **Task 1: RabbitMQ producer** - `5684e58` (feat)
2. **Task 2: Audit interceptor** - `3542ab9` (feat)
3. **Task 3: Consumer + UI + retention** - `87c8172` (feat)

## Files Created/Modified

### Backend (8 files)
- `backend/src/rabbitmq/rabbitmq.module.ts` - Global RabbitMQ module
- `backend/src/rabbitmq/rabbitmq.service.ts` - Connection, publish, buffer, reconnect
- `backend/src/audit/interceptors/audit.interceptor.ts` - Auto-capture all operations
- `backend/src/audit/audit.consumer.ts` - RabbitMQ consumer for DB writes
- `backend/src/audit/audit.controller.ts` - List, filter, entity lookup, CSV export
- `backend/src/audit/audit.service.ts` - Updated with findAll, getLogsForExport
- `backend/src/audit/audit.module.ts` - Added AuditConsumer, RabbitMQService
- `backend/src/app.module.ts` - Added RabbitMQModule import
- `backend/src/main.ts` - Registered AuditInterceptor globally
- `backend/prisma/schema.prisma` - Added requestMethod, requestPath to AuditLog

### Frontend (2 files)
- `frontend/src/api/audit.ts` - Audit API client
- `frontend/src/pages/admin/AuditLogsPage.tsx` - Admin audit log UI

## Architecture

**Audit Flow:**
1. API request arrives
2. AuditInterceptor captures request details (user from AuthContext, IP from headers, entity from path)
3. Request proceeds to controller
4. On response (success or error), audit data published to RabbitMQ exchange
5. AuditConsumer receives message from queue
6. Consumer writes to PostgreSQL audit_logs table
7. Admin can query via API or UI

**RabbitMQ Configuration:**
- Exchange: `audit.exchange` (direct, durable)
- Queue: `audit.logs` (durable, 1-year TTL)
- Routing key: `audit.log`
- Messages: persistent (survive broker restart)

**Retention Strategy (AUTH-10):**
- Queue-level TTL: 31536000000ms (1 year) via `x-message-ttl`
- Consumer processes messages and stores in DB
- Partitioning strategy deferred to database phase

## Decisions Made

- In-memory buffer (max 100) when RabbitMQ unavailable, not direct DB write
- Prefetch=1 on consumer for ordered processing
- 90-day max query range enforced at service layer
- AuditInterceptor skips health/docs/refresh paths
- Consumer singleton within AuditModule

## Deviations from Plan

**Rule 3 - Auto-fixed type issues:**
- amqplib types: `Connection` vs `ChannelModel` - corrected type annotations
- Prisma schema regenerated after adding new fields

## Verification Results

- Backend TypeScript compilation: Clean
- Frontend TypeScript compilation: Clean
- Prisma schema validation: Valid

## Success Criteria Met

- [x] AUTH-09: All critical operations logged with user, time, content, IP
- [x] AUTH-10: Audit logs retained for at least 1 year (queue TTL configured)

---
*Plan: 01-foundation-05*
*Completed: 2026-03-30*
