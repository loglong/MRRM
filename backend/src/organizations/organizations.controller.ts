import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.orgsService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findOne(@Param('id') id: string) {
    return this.orgsService.findById(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get organization by code' })
  async findByCode(@Param('code') code: string) {
    return this.orgsService.findByCode(code);
  }

  @Post()
  @ApiOperation({ summary: 'Create new organization (system admin only)' })
  async create(@Body() data: CreateOrganizationDto) {
    return this.orgsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization (system admin only)' })
  async update(@Param('id') id: string, @Body() data: UpdateOrganizationDto) {
    return this.orgsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete organization (system admin only)' })
  async delete(@Param('id') id: string) {
    return this.orgsService.delete(id);
  }
}
