import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PathsService } from './paths.service';
import { CreatePathDtoType } from './dto/create-path.dto';
import { UpdatePathDtoType } from './dto/update-path.dto';
import { CreatePathStepDtoType } from './dto/create-path-step.dto';
import { AssignPathDtoType } from './dto/assign-path.dto';
import { CompleteStepDtoType, SkipStepDtoType } from './dto/complete-step.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class PathsController {
  constructor(private readonly pathsService: PathsService) {}

  // ========================================================================
  // Path Templates
  // ========================================================================

  @Post('path-templates')
  async create(@Body() data: CreatePathDtoType, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.pathsService.create(data, orgId);
  }

  @Get('path-templates')
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.pathsService.findAll(orgId, parseInt(page, 10), parseInt(limit, 10), {
      status,
      search,
    });
  }

  @Get('path-templates/:id')
  async findOne(@Param('id') id: string) {
    return this.pathsService.findById(id);
  }

  @Put('path-templates/:id')
  async update(@Param('id') id: string, @Body() data: UpdatePathDtoType) {
    return this.pathsService.update(id, data);
  }

  @Delete('path-templates/:id')
  async remove(@Param('id') id: string) {
    return this.pathsService.delete(id);
  }

  @Post('path-templates/:id/duplicate')
  async duplicate(@Param('id') id: string, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.pathsService.duplicate(id, orgId);
  }

  // ========================================================================
  // Path Steps
  // ========================================================================

  @Post('path-templates/:id/steps')
  async addStep(@Param('id') id: string, @Body() data: CreatePathStepDtoType) {
    return this.pathsService.addStep(id, data);
  }

  @Put('path-templates/:id/steps/:stepId')
  async updateStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() data: Partial<CreatePathStepDtoType>,
  ) {
    return this.pathsService.updateStep(id, stepId, data);
  }

  @Delete('path-templates/:id/steps/:stepId')
  async deleteStep(@Param('id') id: string, @Param('stepId') stepId: string) {
    return this.pathsService.deleteStep(id, stepId);
  }

  // ========================================================================
  // Path Assignment (Instance)
  // ========================================================================

  @Post('path-templates/:id/assign')
  async assignToPatient(
    @Param('id') id: string,
    @Body() data: AssignPathDtoType,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.pathsService.assignToPatient(id, data, orgId);
  }

  @Get('path-instances')
  async getInstances(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('patientId') patientId?: string,
    @Query('demandId') demandId?: string,
    @Query('status') status?: string,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.pathsService.getInstances(orgId, parseInt(page, 10), parseInt(limit, 10), {
      patientId,
      demandId,
      status,
    });
  }

  @Get('path-instances/:id')
  async getInstance(@Param('id') id: string) {
    return this.pathsService.getInstance(id);
  }

  @Put('path-instances/:id/steps/:stepId/complete')
  async completeStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() data: CompleteStepDtoType,
  ) {
    return this.pathsService.completeStep(id, stepId, data);
  }

  @Put('path-instances/:id/steps/:stepId/skip')
  async skipStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() data: SkipStepDtoType,
  ) {
    return this.pathsService.skipStep(id, stepId, data);
  }

  @Put('path-instances/:id/cancel')
  async cancelInstance(@Param('id') id: string) {
    return this.pathsService.cancelInstance(id);
  }

  // ========================================================================
  // Patient/Demand Path Instances
  // ========================================================================

  @Get('patients/:patientId/path-instances')
  async getPatientInstances(@Param('patientId') patientId: string) {
    return this.pathsService.getPatientInstances(patientId);
  }

  @Get('demands/:demandId/path-instances')
  async getDemandInstances(@Param('demandId') demandId: string) {
    return this.pathsService.getDemandInstances(demandId);
  }
}
