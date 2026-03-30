import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('unreadOnly') unreadOnly = 'false',
  ) {
    const userId = req.user?.id || req.user?.user?.id;
    return this.notificationsService.getUserNotifications(
      userId,
      parseInt(page, 10),
      parseInt(limit, 10),
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user?.id || req.user?.user?.id;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || req.user?.user?.id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    const userId = req.user?.id || req.user?.user?.id;
    return this.notificationsService.markAllAsRead(userId);
  }
}
