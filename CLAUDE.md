# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MRRM is a medical patient relationship management system designed for healthcare organizations (likely dental/口腔). The project currently exists only as a PRD document - no code has been implemented yet.

## Repository State

- **No code exists** - this is a documentation-only repository
- Single file: `完整PRD文档.md` contains the complete product requirements
- Future Claude instances should read the PRD to understand the intended system architecture

## Key Context from PRD

**Core Modules (planned):**
- 基础模块 (Base): User management, permissions
- 需求管理 (Demand): Demand creation, status transitions
- 路径管理 (Path): Technical path configuration and execution
- 触点管理 (Touchpoint): Touchpoint records and analytics
- 随访管理 (Follow-up): Follow-up plans and execution
- 三大中心 (Three Centers): Journey, Experience, Health centers
- System integrations: CRM, HIS, BI

**Data Capacity:**
- 100万+ patients
- 500万+ demand records
- 1000万+ touchpoint records

## Development Notes

When implementation begins, this system will require:
- Backend: Java/Node.js with RESTful APIs
- Frontend: React with Material Design / Ant Design
- Database: PostgreSQL/MySQL (multi-tenant, physical data isolation)
- Deployment: Docker + Kubernetes support
- Security: HTTPS/TLS 1.3, AES-256 for sensitive fields, SSO support
