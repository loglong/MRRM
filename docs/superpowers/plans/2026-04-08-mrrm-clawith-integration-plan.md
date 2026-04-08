# MRRM × Clawith Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 MRRM 患者管理能力封装为 AI API 接口，供 Clawith 数字员工调用

**Architecture:** 新建独立 AI 接口层 (`/api/v1/ai/patients/*`)，通过 API Key + 白名单鉴权，复用现有 Prisma Schema 和审计日志

**Tech Stack:** NestJS, Prisma, class-validator, @nestjs/throttler, YAML 配置

---

## File Structure

```
backend/src/
├── ai/
│   ├── ai.module.ts                    # 扩展现有 AI 模块
│   ├── ai.controller.ts                # 扩展现有控制器
│   ├── config/
│   │   └── ai-permissions.yml          # 白名单权限配置
│   ├── dto/
│   │   ├── patient-search.dto.ts       # 患者搜索 DTO
│   │   ├── patient-detail.dto.ts        # 患者详情 DTO
│   │   ├── create-touchpoint.dto.ts     # 创建触点 DTO
│   │   └── create-followup.dto.ts       # 创建随访 DTO
│   ├── guards/
│   │   └── api-key.guard.ts            # API Key 鉴权 Guard
│   ├── interceptors/
│   │   └── ai-audit.interceptor.ts    # AI 操作日志拦截器
│   ├── services/
│   │   ├── api-key.service.ts          # API Key 管理服务
│   │   ├── permission.service.ts        # 权限校验服务
│   │   └── patient-skill.service.ts    # 患者 Skill 服务
│   └── interfaces/
│       └── ai-response.interface.ts    # 统一响应格式
└── prisma/
    └── schema.prisma                    # 扩展 AuditLog 表

frontend/src/
├── pages/ai/
│   └── ApiKeyManagementPage.tsx        # (后续) API Key 管理页面
```

---

## Task 1: Prisma Schema Extension

**Files:**
- Modify: `backend/prisma/schema.prisma:173-197`

- [ ] **Step 1: 扩展 AuditLog 表，添加 isAiCall 字段**

```prisma
model AuditLog {
  id            String    @id @default(uuid())
  userId        String?   @map("user_id")
  orgId         String    @map("org_id")
  action        String
  entityType    String    @map("entity_type")
  entityId      String?   @map("entity_id")
  ipAddress     String?   @map("ip_address")
  userAgent     String?   @map("user_agent")
  requestMethod String?   @map("request_method")
  requestPath   String?   @map("request_path")
  requestBody   Json?     @map("request_body")
  responseStatus Int?     @map("response_status")
  errorMessage  String?   @map("error_message")
  // AI 调用扩展字段
  apiKeyId      String?   @map("api_key_id")    // API Key 标识
  isAiCall      Boolean   @default(false) @map("is_ai_call")  // 是否为 AI 调用
  createdAt     DateTime  @default(now()) @map("created_at")

  user          User?        @relation(fields: [userId], references: [id])
  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId, createdAt])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([apiKeyId])
  @@map("audit_logs")
}
```

- [ ] **Step 2: 生成迁移**

Run: `cd backend && npx prisma migrate dev --name add_is_ai_call_to_audit_log`
Expected: Migration created successfully

- [ ] **Step 3: 提交**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat: extend AuditLog with isAiCall and apiKeyId fields"
```

---

## Task 2: AI Permissions Config

**Files:**
- Create: `backend/src/ai/config/ai-permissions.yml`

- [ ] **Step 1: 创建白名单配置文件**

```yaml
ai_employee:
  # API Key 配置示例（实际运行时从环境变量或数据库加载）
  keys:
    - id: "clawith-key-001"
      key: "sk-ai-clawith-xxxxx"  # 实际存储于环境变量
      orgId: "default-org"
      name: "Clawith AI Employee"
      enabled: true
      ipWhitelist: []  # 空数组表示不限制 IP

  permissions:
    - endpoint: "/api/v1/ai/patients/search"
      methods: ["GET"]
      rateLimit: "100/min"
    - endpoint: "/api/v1/ai/patients/:id"
      methods: ["GET"]
      rateLimit: "200/min"
    - endpoint: "/api/v1/ai/patients/:id/touchpoints"
      methods: ["POST"]
      rateLimit: "50/min"
    - endpoint: "/api/v1/ai/patients/:id/followups"
      methods: ["POST"]
      rateLimit: "50/min"
    - endpoint: "/api/v1/ai/health"
      methods: ["GET"]
      rateLimit: "1000/min"
```

- [ ] **Step 2: 创建配置加载服务**

- Create: `backend/src/ai/config/ai-config.loader.ts`

```typescript
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface AiPermissionConfig {
  ai_employee: {
    keys: Array<{
      id: string;
      key: string;
      orgId: string;
      name: string;
      enabled: boolean;
      ipWhitelist: string[];
    }>;
    permissions: Array<{
      endpoint: string;
      methods: string[];
      rateLimit: string;
    }>;
  };
}

export function loadAiConfig(): AiPermissionConfig {
  const configPath = path.join(__dirname, 'ai-permissions.yml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents) as AiPermissionConfig;
}
```

- [ ] **Step 3: 提交**

```bash
git add backend/src/ai/config/ai-permissions.yml backend/src/ai/config/ai-config.loader.ts
git commit -m "feat: add AI permissions config and loader"
```

---

## Task 3: API Key Guard

**Files:**
- Create: `backend/src/ai/guards/api-key.guard.ts`

- [ ] **Step 1: 创建 API Key Guard**

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { loadAiConfig, AiPermissionConfig } from '../config/ai-config.loader';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private config: AiPermissionConfig;

  constructor() {
    this.config = loadAiConfig();
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('Missing API Key');
    }

    const keyConfig = this.config.ai_employee.keys.find(
      (k) => k.key === apiKey && k.enabled
    );

    if (!keyConfig) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // 校验 IP 白名单（如果配置了）
    if (keyConfig.ipWhitelist.length > 0) {
      const clientIp = this.getClientIp(request);
      if (!keyConfig.ipWhitelist.includes(clientIp)) {
        throw new ForbiddenException('IP not allowed');
      }
    }

    // 将 API Key 配置挂载到 request 上，供后续使用
    request['aiKeyConfig'] = keyConfig;
    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    // 支持从 Header 或 Query 提取
    return (
      request.headers['x-api-key'] as string ||
      request.query['api_key'] as string
    );
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.ip ||
      request.socket.remoteAddress ||
      ''
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/ai/guards/api-key.guard.ts
git commit -m "feat: add API Key authentication guard"
```

---

## Task 4: AI Audit Interceptor

**Files:**
- Create: `backend/src/ai/interceptors/ai-audit.interceptor.ts`

- [ ] **Step 1: 创建审计日志拦截器**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AiAuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;
    const startTime = Date.now();

    // 从 ApiKeyGuard 获取的 AI Key 配置
    const aiKeyConfig = request['aiKeyConfig'];
    if (!aiKeyConfig) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          const responseTime = Date.now() - startTime;
          this.logAudit(request, aiKeyConfig, {
            status: 200,
            responseTime,
            requestBody: body,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logAudit(request, aiKeyConfig, {
            status: error.status || 500,
            responseTime,
            requestBody: body,
            errorMessage: error.message,
          });
        },
      })
    );
  }

  private async logAudit(
    request: any,
    aiKeyConfig: any,
    result: { status: number; responseTime: number; requestBody?: any; errorMessage?: string }
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          orgId: aiKeyConfig.orgId,
          action: request.method,
          entityType: this.extractEntityType(request.url),
          entityId: this.extractEntityId(request.url),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          requestMethod: request.method,
          requestPath: request.url,
          requestBody: result.requestBody,
          responseStatus: result.status,
          errorMessage: result.errorMessage,
          apiKeyId: aiKeyConfig.id,
          isAiCall: true,
        },
      });
    } catch (error) {
      console.error('Failed to write AI audit log:', error);
    }
  }

  private extractEntityType(url: string): string {
    // 从 URL 提取实体类型
    const match = url.match(/\/patients(?:\/([^\/]+))?/);
    if (match) {
      return match[1] ? 'Patient' : 'PatientList';
    }
    return 'Unknown';
  }

  private extractEntityId(url: string): string | undefined {
    // 从 URL 提取实体 ID
    const match = url.match(/\/patients\/([^\/]+)/);
    return match?.[1];
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/ai/interceptors/ai-audit.interceptor.ts
git commit -m "feat: add AI audit logging interceptor"
```

---

## Task 5: DTOs Creation

**Files:**
- Create: `backend/src/ai/dto/patient-search.dto.ts`
- Create: `backend/src/ai/dto/patient-detail.dto.ts`
- Create: `backend/src/ai/dto/create-touchpoint.dto.ts`
- Create: `backend/src/ai/dto/create-followup.dto.ts`

- [ ] **Step 1: 创建患者搜索 DTO**

```typescript
// backend/src/ai/dto/patient-search.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PatientTier } from '@prisma/client';

export class PatientSearchDto {
  @IsOptional()
  @IsString()
  q?: string;  // 关键词搜索

  @IsOptional()
  @IsEnum(PatientTier)
  tier?: PatientTier;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

- [ ] **Step 2: 创建触点创建 DTO**

```typescript
// backend/src/ai/dto/create-touchpoint.dto.ts
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TouchpointType, TouchpointChannel } from '@prisma/client';

export class CreateTouchpointDto {
  @IsEnum(TouchpointType)
  type: TouchpointType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(TouchpointChannel)
  @IsOptional()
  channel?: TouchpointChannel = 'OFFLINE';
}
```

- [ ] **Step 3: 创建随访创建 DTO**

```typescript
// backend/src/ai/dto/create-followup.dto.ts
import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { FollowupType } from '@prisma/client';

export class CreateFollowupDto {
  @IsEnum(FollowupType)
  type: FollowupType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsDateString()
  plannedAt: string;
}
```

- [ ] **Step 4: 创建统一响应接口**

```typescript
// backend/src/ai/interfaces/ai-response.interface.ts
export interface AiResponseMeta {
  model: string;
  timestamp: string;
}

export interface AiSuccessResponse<T> {
  success: true;
  data: T;
  meta: AiResponseMeta;
}

export interface AiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
  meta: AiResponseMeta;
}

export type AiResponse<T> = AiSuccessResponse<T> | AiErrorResponse;

export function successResponse<T>(data: T): AiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      model: 'MRRM-Patient-Skill-v1',
      timestamp: new Date().toISOString(),
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: string
): AiErrorResponse {
  return {
    success: false,
    error: { code, message, details },
    meta: {
      model: 'MRRM-Patient-Skill-v1',
      timestamp: new Date().toISOString(),
    },
  };
}
```

- [ ] **Step 5: 提交**

```bash
git add backend/src/ai/dto/ backend/src/ai/interfaces/
git commit -m "feat: add AI API DTOs and response interfaces"
```

---

## Task 6: Patient Skill Service

**Files:**
- Create: `backend/src/ai/services/patient-skill.service.ts`

- [ ] **Step 1: 创建患者 Skill 服务**

```typescript
// backend/src/ai/services/patient-skill.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PatientSearchDto } from '../dto/patient-search.dto';
import { CreateTouchpointDto } from '../dto/create-touchpoint.dto';
import { CreateFollowupDto } from '../dto/create-followup.dto';

@Injectable()
export class PatientSkillService {
  constructor(private prisma: PrismaService) {}

  // 手机号脱敏
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  // 患者搜索
  async searchPatients(orgId: string, dto: PatientSearchDto) {
    const { q, tier, page = 1, limit = 20 } = dto;

    const where: any = {
      orgId,
      deletedAt: null,
    };

    if (tier) {
      where.tier = tier;
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          tier: true,
          lastVisitAt: true,
          tags: true,
          _count: {
            select: {
              demands: { where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING'] } } },
            },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      patients: patients.map((p) => ({
        id: p.id,
        name: p.name,
        phone: this.maskPhone(p.phone || ''),
        tier: p.tier,
        lastVisit: p.lastVisitAt?.toISOString().split('T')[0],
        pendingDemands: p._count.demands,
        tags: p.tags,
      })),
      pagination: {
        total,
        page,
        limit,
      },
    };
  }

  // 患者详情
  async getPatientDetail(orgId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
      include: {
        _count: {
          select: {
            demands: true,
            touchpoints: true,
            followupPlans: true,
          },
        },
        demands: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING'] } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        touchpoints: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        followupPlans: {
          where: { status: { in: ['ACTIVE'] } },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      id: patient.id,
      name: patient.name,
      gender: patient.gender,
      age: patient.birthDate
        ? Math.floor((Date.now() - patient.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      phone: this.maskPhone(patient.phone || ''),
      tier: patient.tier,
      medicalInfo: {
        allergy: patient.allergyHistory,
        medicalHistory: patient.pastHistory,
        lastVisit: patient.lastVisitAt?.toISOString().split('T')[0],
      },
      summary: {
        totalDemands: patient._count.demands,
        completedDemands: patient.demands.filter((d) => d.status === 'COMPLETED').length,
        pendingDemands: patient.demands.filter((d) => ['OPEN', 'IN_PROGRESS', 'PENDING'].includes(d.status)).length,
        totalTouchpoints: patient._count.touchpoints,
        lastFollowup: patient.followupPlans[0]?.plannedAt?.toISOString().split('T')[0],
      },
    };
  }

  // 创建触点
  async createTouchpoint(orgId: string, patientId: string, dto: CreateTouchpointDto) {
    // 验证患者存在
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const touchpoint = await this.prisma.touchpoint.create({
      data: {
        patientId,
        orgId,
        type: dto.type,
        channel: dto.channel || 'OFFLINE',
        title: dto.title,
        content: dto.content,
      },
    });

    return {
      id: touchpoint.id,
      patientId: touchpoint.patientId,
      type: touchpoint.type,
      title: touchpoint.title,
      createdAt: touchpoint.createdAt.toISOString(),
    };
  }

  // 创建随访
  async createFollowup(orgId: string, patientId: string, dto: CreateFollowupDto) {
    // 验证患者存在
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, orgId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // 创建随访计划和首次记录
    const followupPlan = await this.prisma.followupPlan.create({
      data: {
        patientId,
        orgId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        status: 'ACTIVE',
        plannedAt: new Date(dto.plannedAt),
        followupRecords: {
          create: {
            type: dto.type,
            status: 'PENDING',
            plannedAt: new Date(dto.plannedAt),
          },
        },
      },
    });

    return {
      id: followupPlan.id,
      patientId: followupPlan.patientId,
      type: followupPlan.type,
      title: followupPlan.title,
      status: followupPlan.status,
      plannedAt: followupPlan.plannedAt.toISOString(),
    };
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/ai/services/patient-skill.service.ts
git commit -m "feat: add PatientSkillService for AI API"
```

---

## Task 7: AI Controller Extensions

**Files:**
- Modify: `backend/src/ai/ai.controller.ts`

- [ ] **Step 1: 扩展 AiController**

```typescript
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AiAuditInterceptor } from './interceptors/ai-audit.interceptor';
import { PatientSkillService } from './services/patient-skill.service';
import { PatientSearchDto } from './dto/patient-search.dto';
import { CreateTouchpointDto } from './dto/create-touchpoint.dto';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { successResponse, errorResponse } from './interfaces/ai-response.interface';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('ai')
@UseGuards(ApiKeyGuard)
@UseInterceptors(AiAuditInterceptor)
export class AiController {
  constructor(private readonly patientSkillService: PatientSkillService) {}

  // 健康检查
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return successResponse({ status: 'ok' });
  }

  // 患者搜索
  @Get('patients/search')
  @UseGuards(ThrottlerGuard)
  async searchPatients(@Query() dto: PatientSearchDto, @Req() req: Request) {
    try {
      const orgId = (req.headers['x-org-id'] as string) || req['aiKeyConfig']?.orgId;
      const result = await this.patientSkillService.searchPatients(orgId, dto);
      return successResponse(result);
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error.name : 'SEARCH_ERROR',
        error instanceof Error ? error.message : 'Search failed'
      );
    }
  }

  // 患者详情
  @Get('patients/:id')
  @UseGuards(ThrottlerGuard)
  async getPatientDetail(@Param('id') id: string, @Req() req: Request) {
    try {
      const orgId = (req.headers['x-org-id'] as string) || req['aiKeyConfig']?.orgId;
      const result = await this.patientSkillService.getPatientDetail(orgId, id);
      return successResponse(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        return errorResponse('PATIENT_NOT_FOUND', '患者不存在', id);
      }
      return errorResponse(
        error instanceof Error ? error.name : 'DETAIL_ERROR',
        error instanceof Error ? error.message : 'Get detail failed'
      );
    }
  }

  // 创建触点
  @Post('patients/:id/touchpoints')
  @UseGuards(ThrottlerGuard)
  async createTouchpoint(
    @Param('id') id: string,
    @Body() dto: CreateTouchpointDto,
    @Req() req: Request,
  ) {
    try {
      const orgId = (req.headers['x-org-id'] as string) || req['aiKeyConfig']?.orgId;
      const result = await this.patientSkillService.createTouchpoint(orgId, id, dto);
      return successResponse(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        return errorResponse('PATIENT_NOT_FOUND', '患者不存在', id);
      }
      return errorResponse(
        error instanceof Error ? error.name : 'TOUCHPOINT_ERROR',
        error instanceof Error ? error.message : 'Create touchpoint failed'
      );
    }
  }

  // 创建随访
  @Post('patients/:id/followups')
  @UseGuards(ThrottlerGuard)
  async createFollowup(
    @Param('id') id: string,
    @Body() dto: CreateFollowupDto,
    @Req() req: Request,
  ) {
    try {
      const orgId = (req.headers['x-org-id'] as string) || req['aiKeyConfig']?.orgId;
      const result = await this.patientSkillService.createFollowup(orgId, id, dto);
      return successResponse(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        return errorResponse('PATIENT_NOT_FOUND', '患者不存在', id);
      }
      return errorResponse(
        error instanceof Error ? error.name : 'FOLLOWUP_ERROR',
        error instanceof Error ? error.message : 'Create followup failed'
      );
    }
  }
}
```

- [ ] **Step 2: 更新 AiModule 注册新服务**

```typescript
// backend/src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiController } from './ai.controller';
import { ChurnPredictionService } from './services/churn-prediction.service';
import { FollowupRecommendationService } from './services/followup-recommendation.service';
import { LlmService } from './services/llm.service';
import { PatientSkillService } from './services/patient-skill.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minute
      limit: 100,  // 100 requests per minute
    }]),
  ],
  controllers: [AiController],
  providers: [
    ChurnPredictionService,
    FollowupRecommendationService,
    LlmService,
    PatientSkillService,
    ApiKeyGuard,
  ],
  exports: [
    ChurnPredictionService,
    FollowupRecommendationService,
    LlmService,
    PatientSkillService,
  ],
})
export class AiModule {}
```

- [ ] **Step 3: 提交**

```bash
git add backend/src/ai/ai.controller.ts backend/src/ai/ai.module.ts
git commit -m "feat: extend AiController with patient skill endpoints"
```

---

## Task 8: Install Dependencies

**Files:**
- Modify: `backend/package.json` (if needed)

- [ ] **Step 1: 安装必要依赖**

Run: `cd backend && npm install js-yaml @nestjs/throttler`
Expected: Dependencies installed

- [ ] **Step 2: 验证编译**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

---

## Task 9: End-to-End Testing

**Files:**
- Test: `backend/src/ai/ai.controller.spec.ts`

- [ ] **Step 1: 编写单元测试**

```typescript
// backend/src/ai/ai.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { PatientSkillService } from './services/patient-skill.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ConfigService } from '@nestjs/config';

describe('AiController', () => {
  let controller: AiController;
  let service: PatientSkillService;

  const mockPatientSkillService = {
    searchPatients: jest.fn(),
    getPatientDetail: jest.fn(),
    createTouchpoint: jest.fn(),
    createFollowup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: PatientSkillService, useValue: mockPatientSkillService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AiController>(AiController);
    service = module.get<PatientSkillService>(PatientSkillService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = controller.health();
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('ok');
    });
  });

  describe('searchPatients', () => {
    it('should return patient list', async () => {
      const mockResult = {
        patients: [{ id: '1', name: '张三', phone: '138****8888' }],
        pagination: { total: 1, page: 1, limit: 20 },
      };
      mockPatientSkillService.searchPatients.mockResolvedValue(mockResult);

      const result = await controller.searchPatients(
        { q: '张三', page: 1, limit: 20 },
        { headers: { 'x-org-id': 'test-org' }, aiKeyConfig: { orgId: 'test-org' } } as any
      );

      expect(result.success).toBe(true);
      expect(result.data.patients).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 2: 运行测试**

Run: `cd backend && npm test -- --testPathPattern=ai.controller.spec.ts`
Expected: Tests pass

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Prisma Schema Extension | `prisma/schema.prisma` |
| 2 | AI Permissions Config | `ai/config/ai-permissions.yml`, `ai-config.loader.ts` |
| 3 | API Key Guard | `ai/guards/api-key.guard.ts` |
| 4 | AI Audit Interceptor | `ai/interceptors/ai-audit.interceptor.ts` |
| 5 | DTOs & Interfaces | `ai/dto/*.ts`, `ai/interfaces/ai-response.interface.ts` |
| 6 | Patient Skill Service | `ai/services/patient-skill.service.ts` |
| 7 | Controller Extensions | `ai/ai.controller.ts`, `ai/ai.module.ts` |
| 8 | Dependencies | `package.json` |
| 9 | E2E Testing | `ai/ai.controller.spec.ts` |

---

**Next Steps:**

1. Execute tasks in order using subagent-driven or inline execution
2. After implementation, write API documentation
3. Integrate with Clawith platform for testing
