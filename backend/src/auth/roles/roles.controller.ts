import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(@Request() req: any) {
    const orgId = req.user.orgId;
    return this.rolesService.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  async create(@Body() createRoleDto: any, @Request() req: any) {
    return this.rolesService.create({
      ...createRoleDto,
      orgId: req.user.orgId,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: any) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
