---
phase: 06-advanced-intelligence
plan: 01
subsystem: ai
tags: [mobile, responsive, ai, churn-prediction, marketing-automation, cron]

# Dependency graph
requires:
  - phase: 02-core-patient-objects
    provides: Patient, Demand, Touchpoint, Followup models
  - phase: 05-health-and-integration
    provides: Prisma setup, scheduling infrastructure
provides:
  - Mobile-responsive frontend with bottom navigation
  - AI patient churn risk scoring (rule-based MVP)
  - Marketing automation (birthday/followup reminders)
  - Cron-based scheduled tasks
affects: [analytics, reporting, notifications]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Mobile-first responsive design with useMobile hook
    - Rule-based AI scoring with weighted factors
    - Cron job scheduling via @nestjs/schedule

key-files:
  created:
    - backend/src/mobile/mobile.module.ts
    - backend/src/mobile/mobile.service.ts
    - backend/src/mobile/mobile.controller.ts
    - backend/src/ai/ai.module.ts
    - backend/src/ai/services/churn-prediction.service.ts
    - backend/src/ai/ai.controller.ts
    - backend/src/automation/automation.module.ts
    - backend/src/automation/scheduler/automation.scheduler.ts
    - backend/src/automation/services/birthday-reminder.service.ts
    - backend/src/automation/services/followup-reminder.service.ts
    - frontend/src/hooks/useMobile.ts
    - frontend/src/components/mobile/*.tsx
    - frontend/src/pages/mobile/*.tsx
    - frontend/src/pages/ChurnRiskPage.tsx
  modified:
    - backend/src/app.module.ts
    - frontend/src/App.tsx
    - frontend/src/pages/patients/PatientsPage.tsx
    - frontend/src/api/followups.ts
    - frontend/src/i18n/zh.json

key-decisions:
  - "Churn prediction uses rule-based MVP first (lastVisitDays 40%, satisfactionDrop 30%, touchpointDecline 20%, pathMissed 10%)"
  - "Birthday reminders created 7 days before birthday with ROUTINE followup type"
  - "Followup reminders based on treatment type cycles (implant=180d, orthodontics=30d, etc)"
  - "Mobile uses bottom navigation bar with 4 tabs: Home, Patients, Demands, Tasks"

patterns-established:
  - "Conditional rendering based on window.innerWidth < 768 for mobile detection"
  - "Cron jobs: daily at 9 AM for automation, hourly for churn risk updates"

requirements-completed: [MOBILE-01, AI-02, ADV-02]

# Metrics
duration: 8min
completed: 2026-04-06
---

# Phase 6 Plan 1: Advanced Intelligence & Mobile Summary

**Mobile-responsive Web with AI patient churn prediction and marketing automation (birthday/followup reminders)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-06T07:07:02Z
- **Completed:** 2026-04-06T07:15:00Z
- **Tasks:** 3
- **Files modified:** ~40

## Accomplishments

- Mobile-responsive foundation with bottom navigation bar and dedicated mobile pages
- AI churn prediction service with rule-based scoring (4 weighted factors)
- Marketing automation with birthday and followup reminder scheduling

## Task Commits

Each task was committed atomically:

1. **Task 1: Mobile Responsive Foundation** - `cdf6ac4e` (feat)
2. **Task 2: AI Patient Churn Prediction** - `18ebfbe0` (feat)
3. **Task 3: Marketing Automation Foundation** - `46dbd8c8` (feat)

**Plan metadata:** `0703cef` (docs: complete plan)

## Files Created/Modified

### Backend - Mobile Module
- `backend/src/mobile/mobile.module.ts` - MobileModule with PrismaModule import
- `backend/src/mobile/mobile.service.ts` - Mobile data services (patients, demands, touchpoints, followups)
- `backend/src/mobile/mobile.controller.ts` - REST endpoints at /api/mobile/*
- `backend/src/mobile/dto/mobile-patient.dto.ts` - DTOs for mobile API

### Backend - AI Module
- `backend/src/ai/ai.module.ts` - AiModule with ChurnPredictionService
- `backend/src/ai/ai.controller.ts` - API at /api/ai/churn-risk/*
- `backend/src/ai/services/churn-prediction.service.ts` - Rule-based risk scoring
- `backend/src/ai/entities/patient-risk.entity.ts` - RiskLevel, RiskFactor enums/interfaces
- `backend/src/ai/dto/churn-prediction.dto.ts` - Query DTOs

### Backend - Automation Module
- `backend/src/automation/automation.module.ts` - AutomationModule with ScheduleModule
- `backend/src/automation/scheduler/automation.scheduler.ts` - Cron jobs (daily 9AM, hourly)
- `backend/src/automation/services/birthday-reminder.service.ts` - Birthday followup creation
- `backend/src/automation/services/followup-reminder.service.ts` - Treatment cycle followup creation
- `backend/src/automation/services/marketing-automation.service.ts` - Aggregate service

### Frontend - Mobile Components
- `frontend/src/hooks/useMobile.ts` - Mobile detection hook
- `frontend/src/components/mobile/MobileNavBar.tsx` - Bottom navigation
- `frontend/src/components/mobile/MobilePatientList.tsx` - Mobile patient list
- `frontend/src/components/mobile/MobileDemandCard.tsx` - Demand card
- `frontend/src/components/mobile/MobileFollowupCard.tsx` - Followup card
- `frontend/src/layouts/MobileLayout.tsx` - Mobile layout wrapper

### Frontend - Mobile Pages
- `frontend/src/pages/mobile/MobileHomePage.tsx` - Dashboard with stats
- `frontend/src/pages/mobile/MobilePatientsPage.tsx` - Patient list wrapper
- `frontend/src/pages/mobile/MobileDemandsPage.tsx` - Demands list
- `frontend/src/pages/mobile/MobileTasksPage.tsx` - Followup tasks

### Frontend - Churn Risk
- `frontend/src/pages/ChurnRiskPage.tsx` - Churn risk dashboard
- `frontend/src/api/churn-risk.ts` - API client

### Configuration Updates
- `backend/src/app.module.ts` - Added MobileModule, AiModule, AutomationModule
- `frontend/src/App.tsx` - Added mobile routes and ChurnRiskPage
- `frontend/src/pages/patients/PatientsPage.tsx` - Responsive conditional rendering
- `frontend/src/api/followups.ts` - Added listPending method
- `frontend/src/i18n/zh.json` - Added churn risk translations

## Decisions Made

- Churn prediction uses rule-based MVP (not ML) with 4 weighted factors
- Risk levels: HIGH >= 70, MEDIUM >= 40, LOW < 40
- Birthday reminders use 7-day window before birthday date
- Followup cycles mapped per treatment type (implant=180d, orthodontics=30d, etc)
- Cron scheduling: daily automation at 9 AM, hourly churn risk updates

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Mobile routing available at /mobile/*
- Churn risk data available at /api/ai/churn-risk/*
- Automation scheduled tasks ready for execution
- Phase 7 (AI Advanced) can leverage churn prediction foundation

---
*Phase: 06-advanced-intelligence*
*Completed: 2026-04-06*
