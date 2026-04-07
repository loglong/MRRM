import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, page?: string, limit?: string, unreadOnly?: string): Promise<{
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
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<{
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
    markAllAsRead(req: any): Promise<{
        success: boolean;
    }>;
}
