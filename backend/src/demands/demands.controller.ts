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
} from '@nestjs/common';
import { DemandsService } from './demands.service';
import { CreateDemandDtoType } from './dto/create-demand.dto';
import { UpdateDemandDtoType } from './dto/update-demand.dto';
import { ChangeStatusDemandDtoType } from './dto/change-status-demand.dto';
import { FilterDemandDtoType } from './dto/filter-demand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('demands')
@UseGuards(JwtAuthGuard)
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Post()
  async create(@Body() createDemandDto: CreateDemandDtoType, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    const userId = req.user?.sub || req.user?.user?.sub;
    return this.demandsService.create(createDemandDto, orgId, userId);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'LOST',
    @Query('type') type?: 'CONSULTATION' | 'TREATMENT' | 'FOLLOWUP' | 'OTHER',
    @Query('priority') priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    @Query('patientId') patientId?: string,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    const filters = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      type,
      priority,
      patientId,
    };
    return this.demandsService.findAll(orgId, filters);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.demandsService.getDemandStats(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.demandsService.findById(id, orgId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDemandDto: UpdateDemandDtoType,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.demandsService.update(id, orgId, updateDemandDto);
  }

  @Put(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDemandDtoType,
    @Request() req: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    const userId = req.user?.sub || req.user?.user?.sub;
    return this.demandsService.changeStatus(id, orgId, userId, changeStatusDto);
  }

  @Get(':id/history')
  async getStatusHistory(@Param('id') id: string, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.demandsService.getStatusHistory(id, orgId);
  }
}

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientDemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Get(':patientId/demands')
  async getPatientDemands(@Param('patientId') patientId: string, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.demandsService.getPatientDemands(patientId, orgId);
  }
}
