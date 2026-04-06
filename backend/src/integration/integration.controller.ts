import { Controller, Get, Query, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { PatientQueryDto, PatientResponseDto, DemandQueryDto, DemandResponseDto, TouchpointQueryDto, TouchpointResponseDto, HealthRecordQueryDto } from './dto/openapi-payload.dto';

@ApiTags('Integration')
@ApiBearerAuth()
@Controller('api/v1')
export class IntegrationController {
  constructor(private prisma: PrismaService) {}

  private extractOrgId(headers: any): string {
    // For public API, orgId must be provided via header (external systems identify themselves)
    const orgId = headers['x-org-id'] as string;
    if (!orgId) {
      throw new UnauthorizedException('X-Org-Id header is required for API access');
    }
    return orgId;
  }

  @Get('patients')
  @ApiOperation({
    summary: 'List patients',
    description: 'Public API endpoint for external systems to list patients. Requires X-Org-Id header.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tier', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listPatients(
    @Query() query: PatientQueryDto,
    @Headers() headers: any,
  ) {
    const orgId = this.extractOrgId(headers);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { orgId, deletedAt: null };
    if (query.tier) where.tier = query.tier;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          gender: true,
          phone: true,
          tier: true,
          lastVisitAt: true,
          createdAt: true,
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Get('patients/:id')
  @ApiOperation({
    summary: 'Get patient by ID',
    description: 'Public API endpoint for external systems to get a patient by ID.',
  })
  async getPatient(@Param('id') id: string, @Headers() headers: any): Promise<PatientResponseDto> {
    const orgId = this.extractOrgId(headers);
    const patient = await this.prisma.patient.findFirst({
      where: { id, orgId, deletedAt: null },
      select: {
        id: true,
        name: true,
        gender: true,
        phone: true,
        tier: true,
        lastVisitAt: true,
        createdAt: true,
      },
    }) as any;

    if (!patient) {
      throw new Error('Patient not found');
    }

    return patient;
  }

  @Get('demands')
  @ApiOperation({
    summary: 'List demands',
    description: 'Public API endpoint for external systems to list demands.',
  })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listDemands(@Query() query: DemandQueryDto, @Headers() headers: any) {
    const orgId = this.extractOrgId(headers);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { orgId };
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;

    const [demands, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          patientId: true,
          type: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    return {
      data: demands,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Get('touchpoints')
  @ApiOperation({
    summary: 'List touchpoints',
    description: 'Public API endpoint for external systems to list touchpoints.',
  })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listTouchpoints(@Query() query: TouchpointQueryDto, @Headers() headers: any) {
    const orgId = this.extractOrgId(headers);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { orgId };
    if (query.patientId) where.patientId = query.patientId;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [touchpoints, total] = await Promise.all([
      this.prisma.touchpoint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          patientId: true,
          type: true,
          channel: true,
          title: true,
          sentiment: true,
          createdAt: true,
        },
      }),
      this.prisma.touchpoint.count({ where }),
    ]);

    return {
      data: touchpoints,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Get('health-records')
  @ApiOperation({
    summary: 'List health records',
    description: 'Public API endpoint for external systems to list health records.',
  })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listHealthRecords(@Query() query: HealthRecordQueryDto, @Headers() headers: any) {
    const orgId = this.extractOrgId(headers);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Health records are stored in Patient model (allergyHistory, pastHistory, etc.)
    // For now, return a placeholder - health module may have more structured records
    const where: any = { orgId, deletedAt: null };
    if (query.patientId) where.id = query.patientId;

    const patients = await this.prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        allergyHistory: true,
        pastHistory: true,
        createdAt: true,
      },
    });

    // Map to health record format
    const healthRecords = patients.map((p: any) => ({
      patientId: p.id,
      patientName: p.name,
      category: 'GENERAL',
      allergyHistory: p.allergyHistory,
      pastHistory: p.pastHistory,
      createdAt: p.createdAt,
    }));

    const total = await this.prisma.patient.count({ where });

    return {
      data: healthRecords,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
