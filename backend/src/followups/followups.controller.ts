import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFollowupPlanSchema } from './dto/create-followup-plan.dto';
import { CreateFollowupRecordSchema } from './dto/create-followup-record.dto';
import { ExecuteFollowupSchema } from './dto/execute-followup.dto';
import { FollowupPlanFiltersSchema, FollowupRecordFiltersSchema } from './dto/followup-filters.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  // ===== Followup Plans =====

  @Post('followup-plans')
  async createPlan(@Body() body: any, @Request() req: any) {
    const parsed = CreateFollowupPlanSchema.parse(body);
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    return this.followupsService.createPlan(parsed, orgId, userId);
  }

  @Get('followup-plans')
  async findPlans(@Query() query: any, @Request() req: any) {
    const filters = FollowupPlanFiltersSchema.parse(query);
    const orgId = req.user?.orgId;
    return this.followupsService.findPlans(orgId, filters);
  }

  @Get('followup-plans/:id')
  async findPlanById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const orgId = req.user?.orgId;
    return this.followupsService.findPlanById(id, orgId);
  }

  @Put('followup-plans/:id/pause')
  async pausePlan(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const orgId = req.user?.orgId;
    return this.followupsService.pausePlan(id, orgId);
  }

  @Put('followup-plans/:id/resume')
  async resumePlan(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const orgId = req.user?.orgId;
    return this.followupsService.resumePlan(id, orgId);
  }

  // ===== Followup Records =====

  @Post('followup-records')
  async createRecord(@Body() body: any, @Request() req: any) {
    const parsed = CreateFollowupRecordSchema.parse(body);
    const orgId = req.user?.orgId;
    return this.followupsService.generateFollowupRecords(parsed as any, parsed.pathInstanceStepId);
  }

  @Get('followup-records')
  async findRecords(@Query() query: any, @Request() req: any) {
    const filters = FollowupRecordFiltersSchema.parse(query);
    const orgId = req.user?.orgId;
    return this.followupsService.findRecords(orgId, filters);
  }

  @Put('followup-records/:id/execute')
  async executeRecord(@Param('id', ParseUUIDPipe) id: string, @Body() body: any, @Request() req: any) {
    const parsed = ExecuteFollowupSchema.parse(body);
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    return this.followupsService.executeRecord(id, parsed, userId, orgId);
  }

  @Get('followup-records/analytics')
  async getCompletionRate(@Query() query: any, @Request() req: any) {
    const orgId = req.user?.orgId;
    return this.followupsService.getCompletionRate(orgId, query);
  }

  // ===== Path-based Follow-up (LINK-01) =====

  /**
   * Get available path templates for follow-up selection
   */
  @Get('paths/available')
  async getAvailablePaths(
    @Request() req: any,
    @Query('specialty') specialty?: string,
    @Query('search') search?: string,
  ) {
    const orgId = req.user?.orgId;
    return this.followupsService.getAvailablePaths(orgId, { specialty, search });
  }

  /**
   * Suggest paths for a patient based on their specialty/demands
   */
  @Get('patients/:patientId/suggested-paths')
  async suggestPathsForPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId;
    return this.followupsService.suggestPathsForPatient(patientId, orgId);
  }

  /**
   * Create follow-up plan from path template
   */
  @Post('patients/:patientId/followup-plans/from-path/:pathId')
  async createPlanFromPath(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('pathId', ParseUUIDPipe) pathId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    return this.followupsService.createPlanFromPath(patientId, pathId, body, orgId, userId);
  }
}
