import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Logger } from '../common/logger';

@Injectable()
export class NotificationsService {
  private logger = new Logger('NotificationsService');

  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: 'PATH_OVERDUE' | 'FOLLOWUP_DUE' | 'FOLLOWUP_OVERDUE' | 'SYSTEM';
    link?: string;
    orgId: string;
  }) {
    const notification = await this.prisma.notification.create({
      data,
    });

    this.logger.log(`Notification created for user ${data.userId}: ${notification.id}`, 'NotificationsService');
    return notification;
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    this.logger.log(`Notification marked as read: ${id}`, 'NotificationsService');
    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    this.logger.log(`All notifications marked as read for user: ${userId}`, 'NotificationsService');
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { count };
  }
}
