import { PrismaService } from '../common/prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    create(data: {
        userId: string;
        title: string;
        message: string;
        type: 'PATH_OVERDUE' | 'FOLLOWUP_DUE' | 'FOLLOWUP_OVERDUE' | 'SYSTEM';
        link?: string;
        orgId: string;
    }): Promise<{
        id: string;
        orgId: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        link: string | null;
        message: string;
        read: boolean;
    }>;
    getUserNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        data: {
            id: string;
            orgId: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            userId: string;
            link: string | null;
            message: string;
            read: boolean;
        }[];
        unreadCount: number;
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        orgId: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        link: string | null;
        message: string;
        read: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
}
