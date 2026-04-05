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
import { TouchpointsService } from './touchpoints.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTouchpointSchema } from './dto/create-touchpoint.dto';
import { UpdateTouchpointSchema } from './dto/update-touchpoint.dto';
import { TouchpointFiltersSchema } from './dto/touchpoint-filters.dto';

@Controller('touchpoints')
@UseGuards(JwtAuthGuard)
export class TouchpointsController {
  constructor(private readonly touchpointsService: TouchpointsService) {}

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    const parsed = CreateTouchpointSchema.parse(body);
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.touchpointsService.create(parsed, orgId, req.user?.id);
  }

  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const filters = TouchpointFiltersSchema.parse(query);
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.touchpointsService.findAll(orgId, filters);
  }

  @Get('analytics')
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('granularity') granularity?: 'day' | 'week' | 'month',
    @Request() req?: any,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.touchpointsService.getAnalytics(orgId, startDate, endDate, granularity || 'day');
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.touchpointsService.findById(id, orgId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const parsed = UpdateTouchpointSchema.parse(body);
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.touchpointsService.update(id, parsed, orgId);
  }

  @Put(':id/void')
  async void(@Param('id', ParseUUIDPipe) id: string, @Body() body: { reason: string }, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.touchpointsService.void(id, body.reason, orgId);
  }
}
