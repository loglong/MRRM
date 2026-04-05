import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Permissions('user:read')
  @ApiOperation({ summary: 'Get all users for organization' })
  async findAll(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.usersService.findAll(req.user.orgId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Permissions('user:create')
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() data: any, @Request() req: any) {
    return this.usersService.create({
      ...data,
      orgId: req.user.orgId,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign roles to user' })
  async assignRoles(@Param('id') id: string, @Body('roleIds') roleIds: string[]) {
    await this.usersService.assignRoles(id, roleIds);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user (set inactive)' })
  async delete(@Param('id') id: string, @Request() req: any) {
    // Prevent self-deletion
    if (id === req.user.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    return this.usersService.delete(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate user' })
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE',
    @Request() req: any,
  ) {
    // Prevent self-deactivation
    if (id === req.user.id && status === 'INACTIVE') {
      throw new ForbiddenException('Cannot deactivate your own account');
    }
    return this.usersService.changeStatus(id, status);
  }
}
