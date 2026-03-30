import api from './auth';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'PATH_OVERDUE' | 'FOLLOWUP_DUE' | 'FOLLOWUP_OVERDUE' | 'SYSTEM';
  link: string | null;
  read: boolean;
  orgId: string;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse> => {
    return api.get('/notifications', { params });
  },

  getUnreadCount: (): Promise<{ count: number }> => {
    return api.get('/notifications/unread-count');
  },

  markAsRead: (id: string): Promise<Notification> => {
    return api.put(`/notifications/${id}/read`, {});
  },

  markAllAsRead: (): Promise<{ success: boolean }> => {
    return api.put('/notifications/read-all', {});
  },
};
