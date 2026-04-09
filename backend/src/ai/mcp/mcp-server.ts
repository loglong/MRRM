import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MrrmMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'MRRM-Patient-Skill',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params as { name: string; arguments: Record<string, unknown> };

      try {
        switch (name) {
          case 'search_patients': {
            const orgId = (args.orgId as string) || 'default';
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
                createdAt: true,
              },
            });

            return {
              content: [{ type: 'text', text: JSON.stringify({ patients, page, limit }, null, 2) }],
            };
          }

          case 'get_patient_detail': {
            const orgId = (args.orgId as string) || 'default';
            const patientId = args.patient_id as string;

            const patient = await prisma.patient.findFirst({
              where: { id: patientId, orgId },
              include: {
                demands: { take: 10, orderBy: { createdAt: 'desc' } },
                touchpoints: { take: 10, orderBy: { createdAt: 'desc' } },
                _count: { select: { demands: true, touchpoints: true, followupRecords: true } },
              },
            });

            if (!patient) {
              return {
                content: [{ type: 'text', text: JSON.stringify({ error: 'Patient not found' }, null, 2) }],
                isError: true,
              };
            }

            return {
              content: [{ type: 'text', text: JSON.stringify(patient, null, 2) }],
            };
          }

          case 'create_touchpoint': {
            const orgId = (args.orgId as string) || 'default';
            const patientId = args.patient_id as string;

            const touchpoint = await prisma.touchpoint.create({
              data: {
                patientId,
                orgId,
                type: args.type as any,
                title: args.title as string,
                content: args.content as string,
                channel: args.channel as any,
              },
            });

            return {
              content: [{ type: 'text', text: JSON.stringify(touchpoint, null, 2) }],
            };
          }

          case 'create_followup': {
            const orgId = (args.orgId as string) || 'default';
            const patientId = args.patient_id as string;
            const plannedAt = new Date(args.planned_at as string);

            // Create a followup plan
            const plan = await prisma.followupPlan.create({
              data: {
                patientId,
                orgId,
                name: args.title as string,
                type: args.type as any,
                startDate: plannedAt,
              },
            });

            // Create the followup record
            const record = await prisma.followupRecord.create({
              data: {
                planId: plan.id,
                patientId,
                orgId,
                scheduledAt: plannedAt,
                status: 'PENDING',
              },
            });

            return {
              content: [{ type: 'text', text: JSON.stringify({ plan, record }, null, 2) }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}