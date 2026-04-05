# Technology Stack

**Project:** MRRM - 医疗患者关系管理系统
**Researched:** 2026-03-25
**Confidence:** MEDIUM-HIGH (most sources verified via official documentation; some via WebFetch)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React** | 19.x (stable) | UI Framework | Project constraint; 2025 market leader with mature ecosystem; React 19 adds performance improvements and new features like Actions and useEffectEvent |
| **Ant Design** | 6.3.4 (stable) | UI Component Library | Project constraint; comprehensive enterprise components; March 2025 release with Form.List, Table, Menu improvements |
| **TypeScript** | 5.x (latest stable) | Type Safety | Strong typing reduces runtime errors; works seamlessly with React and Node.js; required for Prisma and modern tooling |

### AI Native Layer (Phase 3-4 Integration)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **PgVector** | Latest | Vector Search | PostgreSQL extension for embeddings; patient similarity search, follow-up intent recognition; avoids separate vector DB initially |
| **Vercel AI SDK** | Latest | Frontend AI Integration | Unified API for OpenAI/Anthropic/Google; streaming UI support; React hooks (useChat, useCompletion) |
| **LangChain.js** | Latest | Backend AI Orchestration | Agent framework; chain composition; memory management for patient context; tool calling |
| **Helicone** | Cloud | AI Observability | LLM call tracking; cost analytics; latency monitoring; no infrastructure needed |

**AI Integration Timeline:**
- Phase 1-2: Install PgVector extension; design AI-ready data schemas
- Phase 3-4: Integrate Vercel AI SDK + LangChain.js; implement semantic cache with Redis
- Phase 5-6: LangChain Agents for autonomous tasks; AI-powered patient triage

### Backend Framework (RECOMMENDED: Node.js + NestJS)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Node.js** | 24.14.1 (LTS) | Runtime | Latest LTS with 30-month support; strong ecosystem for JSON-heavy healthcare data; easier async handling for high-concurrency CRM workloads |
| **NestJS** | Latest stable | Backend Framework | Modular architecture suited for CRM modules; built-on Express with dependency injection; TypeScript-first; enterprise-proven |
| **Express.js** | 5.2.1 (alternative) | Lightweight API | Lower-level control; good if NestJS overhead is unnecessary; but less structured for large CRM codebase |

**Why NOT Java Spring Boot for this project:**
- Node.js/TypeScript shares language with frontend, reducing context switching
- JSON-native handling aligns with patient journey/contact data structures
- Faster initial development for CRUD-heavy CRM features
- Strong npm ecosystem for healthcare integrations (HL7 FHIR libraries available)

**Why Java Spring Boot remains valid (for future consideration):**
- Superior type safety at compile-time for complex business logic
- Better performance for compute-intensive operations
- Stronger enterprise support contracts (Red Hat, IBM)
- Preferred in hospital/HIS integration environments

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **PostgreSQL** | 18.3 (stable) | Primary Database + Vector Store | Project constraint confirmed; best-in-class multi-tenant support via Row-Level Security (RLS); PostgreSQL 18 released Feb 2026 with performance improvements; **PgVector extension for AI embeddings** |
| **Redis** | 8.0 | Caching Layer + Semantic Cache | Sub-millisecond response for session management; supports 18 data structures; active-active geo-distribution for high availability; **LLM response caching** |

**Why PostgreSQL over MongoDB for this medical CRM:**
- Strict schema aligns with medical record structures (patient, appointment, treatment paths)
- Row-Level Security provides hardware-level tenant isolation (critical for healthcare compliance)
- Mature JSON/JSONB support for flexible patient attributes
- Better for complex queries across patient journeys
- **PgVector enables similarity search without separate vector database**

### ORM

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| **Prisma** | v7 | Type-safe ORM + Vector Support | RECOMMENDED; works with PostgreSQL; provides migration system, type safety, and excellent DX; v7 may support pgvector operations via raw queries; **pair with Prisma Extensions for custom vector operations** |
| **TypeORM** | Latest | Traditional ORM | Alternative; more verbose than Prisma; better for complex stored procedures |

### API Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Swagger/OpenAPI** | 3.x | API Documentation | Standard for RESTful API docs; auto-generates client SDKs; interactive testing UI |
| **Zod** | 4.0 (stable) | Runtime Validation | TypeScript-first schema validation; replaces class-validator for cleaner API validation |
| **Axios** | 1.13.2 | HTTP Client | Browser and Node.js support; interceptors for auth tokens; automatic JSON transformation |

### Authentication & Security

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Auth0** | Cloud/Self-hosted | Identity Provider | HIPAA-compliant option available; handles SSO, MFA, social login; reduces auth implementation burden |
| **JWT (jsonwebtoken)** | Latest | Token-based Auth | Self-hosted alternative; 90-day password expiry requirement achievable via token expiration |
| **bcrypt** | Latest | Password Hashing | Industry standard;配合 JWT 实现完整认证流程 |

### DevOps & Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Docker** | Latest | Containerization | Project constraint; universal deployment format; healthcare-compliant images available |
| **Kubernetes** | 1.35 | Orchestration | Project constraint; v1.35 is current; automated rollouts/rollbacks, self-healing, horizontal scaling |
| **Jest** | 30.0 | Testing Framework | Zero-config for React/Node.js; snapshot testing for UI components; parallel execution |

### Data Fetching (Frontend)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **TanStack Query** | v5 | Server State Management | Auto caching, background refetching, stale data handling; reduces API call boilerplate; works with React 19 |

### Logging & Monitoring

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Winston** | Latest | Node.js Logging | Standard Node.js logger; multiple transports (file, cloud); structured logging for audit trails |
| **Prometheus** | Latest | Metrics | Kubernetes-native monitoring; healthcare compliance dashboards available |

### Message Queue (for async operations)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **RabbitMQ** | 4.2.5 | Async Messaging | Reliable message acknowledgment; quorum queues for replication; MQTT/AMQP 5.0 support |

---

## Architecture Pattern: Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Modules  │ │  Pages   │ │Components│ │  Hooks   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                      TanStack Query                      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────┐
│                   API Gateway (NestJS)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │  Users    │ │Patients  │ │ Follow-up│  │
│  │  Module  │ │  Module   │ │  Module  │ │  Module  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                      Zod Validation                      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Data Layer (Prisma ORM)                      │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼───────┐                   ┌────────▼────────┐
│  PostgreSQL   │                   │     Redis        │
│  (Primary DB) │                   │   (Cache/Session)│
└───────────────┘                   └──────────────────┘
```

---

## What NOT to Use and Why

| Technology | Why Avoid | Instead Use |
|------------|-----------|-------------|
| **MongoDB** | Flexible schemas increase compliance risk for medical records; lacks native RLS for multi-tenant | PostgreSQL with JSONB for flexibility |
| **MySQL** | Weaker multi-tenant isolation; less mature JSON support | PostgreSQL |
| **GraphQL** | Overkill for CRUD-heavy CRM; adds complexity without clear benefit | RESTful API with Swagger |
| **jQuery** | Deprecated for new development; no TypeScript support | React |
| **Angular** | Higher learning curve; less flexibility than React for CRM UIs | React |
| **Morris.js/Recharts** | Limited enterprise features | Ant Design Charts or ECharts |
| **Webpack (manual config)** | Complex setup | Vite (faster, simpler) or Next.js |

---

## Technology Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| Frontend Framework | React 19 | Next.js 15 | SSR adds complexity; app router ecosystem still maturing; API routes unnecessary with separate backend |
| Backend Language | Node.js + TypeScript | Java Spring Boot | TypeScript shares language with frontend; faster JSON handling; easier async for CRM |
| ORM | Prisma v7 | TypeORM | Prisma has better TypeScript integration; cleaner migration DX |
| API Validation | Zod 4 | class-validator | Zod is TypeScript-first, immutable, smaller bundle |
| Auth | Auth0 | Passport.js | Auth0 provides HIPAA compliance path, SSO, MFA out-of-box; reduces implementation time |
| Message Queue | RabbitMQ | Kafka | Kafka is overkill for CRM async tasks; higher operational complexity |
| Cache | Redis | Memcached | Redis supports more data structures; better persistence options |

---

## Installation

```bash
# Core Frontend
npm create vite@latest mrrm-frontend -- --template react-ts
cd mrrm-frontend
npm install react@19 react-dom@19 antd@6.3.4 @ant-design/icons
npm install @tanstack/react-query@5 zod@4 axios@1.13

# Core Backend
mkdir mrrm-backend && cd mrrm-backend
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install prisma@7 @prisma/client zod@4
npm install jsonwebtoken bcrypt
npm install winston rabbitmq

# Database
# PostgreSQL 18.3 - install via Docker or official packages

# DevOps
npm install -D jest@30 typescript@5 @types/node
npm install -D docker kubernetes-client
```

---

## Security Considerations for Medical CRM

Per PROJECT.md constraints (HIPAA-aligned):

| Requirement | Implementation |
|-------------|----------------|
| HTTPS/TLS 1.3 | Configure at load balancer (AWS ALB, nginx) |
| AES-256 encryption | PostgreSQL pgcrypto extension + application-level for PHI fields |
| 90-day password expiry | JWT expiration set to 90 days; refresh token rotation |
| 5 failed login lockout | Auth0 rules or custom implementation with Redis-backed rate limiting |
| Audit logging | Winston with structured JSON logs to immutable storage |
| Multi-tenant RLS | PostgreSQL Row-Level Security policies per institution |

---

## Confidence Assessment

| Technology | Confidence | Notes |
|------------|------------|-------|
| React 19 | HIGH | Verified via react.dev blog (Oct 2025 release) |
| Ant Design 6.3.4 | HIGH | Verified via GitHub releases (March 2025) |
| Node.js 24 LTS | HIGH | Verified via nodejs.org (current LTS) |
| NestJS | MEDIUM | Enterprise-proven but version not directly verified |
| PostgreSQL 18.3 | HIGH | Verified via postgresql.org (Feb 2026 release) |
| Prisma v7 | MEDIUM | Official docs reference v7 |
| TypeScript 5 | MEDIUM | Version inferred from ecosystem; not directly verified |
| Redis 8 | MEDIUM | Official site references "Redis 8" |
| RabbitMQ 4.2.5 | MEDIUM | Version from official site |
| Auth0 | MEDIUM | Industry standard; specific version not critical |
| Kubernetes 1.35 | HIGH | Verified via kubernetes.io (current version) |
| Jest 30 | MEDIUM | Official docs show Jest 30 |

---

## Sources

- React: https://react.dev/blog (React 19.2, October 2025)
- Ant Design: https://github.com/ant-design/ant-design/releases (v6.3.4, March 2025)
- Node.js: https://nodejs.org/en/blog (v24.14.1 LTS)
- PostgreSQL: https://www.postgresql.org/docs/ (v18.3, February 2026)
- NestJS: https://nestjs.com/ (framework overview)
- Prisma: https://www.prisma.io/docs (v7 documentation)
- Redis: https://redis.io/ (Redis 8)
- RabbitMQ: https://www.rabbitmq.com/ (v4.2.5)
- Kubernetes: https://kubernetes.io/ (v1.35)
- Express.js: https://expressjs.com/ (v5.2.1)
- TanStack Query: https://tanstack.com/query/latest (v5)
- Zod: https://zod.dev/ (v4 stable)
- Jest: https://jestjs.io/ (v30)
- Auth0: https://auth0.com/docs/get-started
- Swagger: https://swagger.io/docs/
- MongoDB: https://www.mongodb.com/ (v8.0)
