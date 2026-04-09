/**
 * MRRM Patient MCP Server - HTTP Transport
 * Provides MCP protocol over HTTP
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PORT = process.env.MCP_PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;
const API_KEY = process.env.MRRM_API_KEY || 'sk-ai-clawith-mrrm';
const DEFAULT_ORG = process.env.MRRM_ORG_ID || 'default-org';

const app = express();
app.use(express.json());

// MCP Tools Definition
const tools = [
  {
    name: 'search_patients',
    description: '搜索患者列表，支持关键词搜索和等级筛选',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: '关键词搜索（姓名、手机号）' },
        tier: { type: 'string', enum: ['HIGH_VALUE', 'REGULAR', 'LOST_RISK'], description: '患者等级筛选' },
        page: { type: 'number', description: '页码，默认1' },
        limit: { type: 'number', description: '每页数量，默认20' },
      },
    },
  },
  {
    name: 'get_patient_detail',
    description: '获取患者详细信息，包括医疗信息和需求统计',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', description: '患者ID' },
      },
      required: ['patient_id'],
    },
  },
  {
    name: 'create_touchpoint',
    description: '为患者创建触点记录',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', description: '患者ID' },
        type: { type: 'string', enum: ['VISIT', 'CALL', 'MESSAGE', 'EMAIL', 'WECHAT', 'VIDEO', 'SMS', 'OTHER'], description: '触点类型' },
        title: { type: 'string', description: '触点标题' },
        content: { type: 'string', description: '触点内容' },
        channel: { type: 'string', enum: ['OFFLINE', 'ONLINE', 'MOBILE', 'PHONE'], description: '沟通渠道' },
      },
      required: ['patient_id', 'type', 'title'],
    },
  },
  {
    name: 'create_followup',
    description: '为患者创建随访任务',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', description: '患者ID' },
        type: { type: 'string', enum: ['ROUTINE', 'POST_TREATMENT', 'PRE_APPOINTMENT', 'CUSTOM'], description: '随访类型' },
        title: { type: 'string', description: '随访标题' },
        content: { type: 'string', description: '随访内容' },
        planned_at: { type: 'string', description: '计划时间 (ISO8601格式: 2026-04-15T10:00:00Z)' },
      },
      required: ['patient_id', 'type', 'title', 'planned_at'],
    },
  },
];

// Tool Handlers
async function handleSearchPatients(args: any) {
  const orgId = args.orgId || DEFAULT_ORG;
  const page = (args.page as number) || 1;
  const limit = (args.limit as number) || 20;
  const where: any = { orgId };

  if (args.q) {
    where.OR = [
      { name: { contains: args.q as string } },
      { phone: { contains: args.q as string } },
    ];
  }
  if (args.tier) {
    where.tier = args.tier;
  }

  const patients = await prisma.patient.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      phone: true,
      tier: true,
      lastVisitAt: true,
      tags: true,
      createdAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const total = await prisma.patient.count({ where });

  return { patients, pagination: { total, page, limit } };
}

async function handleGetPatientDetail(args: any) {
  const orgId = args.orgId || DEFAULT_ORG;
  const patientId = args.patient_id as string;

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, orgId, deletedAt: null },
    include: {
      _count: { select: { demands: true, touchpoints: true, followupPlans: true } },
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  return patient;
}

async function handleCreateTouchpoint(args: any) {
  const orgId = args.orgId || DEFAULT_ORG;
  const patientId = args.patient_id as string;

  const patient = await prisma.patient.findFirst({ where: { id: patientId, orgId, deletedAt: null } });
  if (!patient) {
    throw new Error('Patient not found');
  }

  const touchpoint = await prisma.touchpoint.create({
    data: {
      patientId,
      orgId,
      type: args.type,
      title: args.title,
      content: args.content,
      channel: args.channel || 'OFFLINE',
    },
  });

  return touchpoint;
}

async function handleCreateFollowup(args: any) {
  const orgId = args.orgId || DEFAULT_ORG;
  const patientId = args.patient_id as string;
  const plannedAt = new Date(args.planned_at as string);

  const patient = await prisma.patient.findFirst({ where: { id: patientId, orgId, deletedAt: null } });
  if (!patient) {
    throw new Error('Patient not found');
  }

  const plan = await prisma.followupPlan.create({
    data: {
      patientId,
      orgId,
      name: args.title as string,
      type: args.type,
      startDate: plannedAt,
      status: 'ACTIVE',
    },
  });

  const record = await prisma.followupRecord.create({
    data: {
      planId: plan.id,
      patientId,
      orgId,
      scheduledAt: plannedAt,
      status: 'PENDING',
    },
  });

  return { plan, record };
}

// Routes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'MRRM-Patient-Skill', version: '1.0.0', url: `${BASE_URL}/mcp` });
});

app.get('/tools', (_req: Request, res: Response) => {
  res.json({ tools });
});

// MCP JSON-RPC endpoint
app.all('/mcp', async (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'] as string;

  // Simple auth check
  if (apiKey && apiKey !== API_KEY) {
    res.status(401).json({ jsonrpc: '2.0', id: req.body?.id, error: { code: -32600, message: 'Unauthorized' } });
    return;
  }

  try {
    const { jsonrpc, id, method, params } = req.body;

    if (method === 'tools/list') {
      res.json({ jsonrpc, id, result: { tools } });
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params;
      let result: any;

      switch (name) {
        case 'search_patients':
          result = await handleSearchPatients(args);
          break;
        case 'get_patient_detail':
          result = await handleGetPatientDetail(args);
          break;
        case 'create_touchpoint':
          result = await handleCreateTouchpoint(args);
          break;
        case 'create_followup':
          result = await handleCreateFollowup(args);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      res.json({
        jsonrpc,
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
      });
    } else {
      res.status(400).json({ jsonrpc, id, error: { code: -32601, message: 'Method not found' } });
    }
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id: req.body?.id,
      result: {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`MRRM MCP Server HTTP running at ${BASE_URL}`);
  console.log(`MCP endpoint: ${BASE_URL}/mcp`);
  console.log(`Tools list: ${BASE_URL}/tools`);
  console.log(`Health: ${BASE_URL}/health`);
});

export default app;
