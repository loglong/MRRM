import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDtoType } from './dto/create-patient.dto';
import { UpdatePatientDtoType } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  async create(@Body() createPatientDto: CreatePatientDtoType, @Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.patientsService.create(createPatientDto, orgId);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('tier') tier?: string,
    @Query('search') search?: string,
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.patientsService.findAll(
      orgId,
      parseInt(page, 10),
      parseInt(limit, 10),
      { tier, search },
    );
  }

  @Get('search')
  async search(
    @Request() req: any,
    @Query('q') query: string,
    @Query('field') field: 'name' | 'phone' | 'all' = 'all',
  ) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.patientsService.search(orgId, query, field);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    const orgId = req.user?.orgId || req.user?.user?.orgId;
    return this.patientsService.getStats(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }

  @Get(':id/profile')
  async getPatientProfile(@Param('id') id: string) {
    return this.patientsService.getPatientPortrait(id);
  }

  @Get(':id/tags')
  async getPatientTags(
    @Param('id') id: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.patientsService.getPatientTags(id, category, status);
  }

  @Post(':id/tags')
  async addPatientTag(
    @Param('id') id: string,
    @Body() body: { tagCode: string; tagName: string; category: string },
  ) {
    return this.patientsService.addManualTag(id, body.tagCode, body.tagName, body.category);
  }

  @Patch(':id/tags/:tagId')
  async updateTagStatus(
    @Param('tagId') tagId: string,
    @Body() body: { status: string },
  ) {
    return this.patientsService.updateTagStatus(tagId, body.status);
  }

  @Post(':id/analyze')
  async triggerAiAnalysis(@Param('id') id: string) {
    return this.patientsService.triggerAiAnalysis(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDtoType) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientsService.delete(id);
  }
}
