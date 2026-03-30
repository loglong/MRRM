import { Controller, Get, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Get audit logs for organization (system admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: Record<string, unknown> = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) (filters.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (filters.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    return this.auditService.findAll(req.user.orgId, Number(page), Number(limit), filters);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit logs for specific entity' })
  async findByEntity(
    @Request() req: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId, req.user.orgId);
  }

  @Get('export')
  @Roles('SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Export audit logs as CSV (system admin only)' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async exportLogs(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const logs = await this.auditService.getLogsForExport(
      req.user.orgId,
      new Date(startDate),
      new Date(endDate),
    );

    // Generate CSV
    const headers = ['ID', 'Time', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Status', 'Error'];
    const rows = logs.map((log: any) => [
      log.id,
      log.createdAt.toISOString(),
      log.user?.email || log.userId || 'System',
      log.action,
      log.entityType,
      log.entityId || '',
      log.ipAddress || '',
      log.responseStatus || '',
      log.errorMessage || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r: string[]) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${startDate}-${endDate}.csv"`);
    res.send(csv);
  }
}
