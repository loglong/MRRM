import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge, List, Typography, Button, Empty } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  ContactsOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { notificationsApi, Notification } from '../api/notifications';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const result = await notificationsApi.getUnreadCount();
      setUnreadCount(result.count);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  const fetchNotifications = async () => {
    setNotificationLoading(true);
    try {
      const response = await notificationsApi.list({ limit: 10 });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationsApi.markAsRead(notification.id);
        fetchUnreadCount();
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common.profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: logout,
    },
  ];

  const notificationOverlay = (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        width: 360,
        maxHeight: 480,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong>{t('notifications.title') || 'Notifications'}</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead}>
            {t('notifications.markAllRead') || 'Mark all read'}
          </Button>
        )}
      </div>
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('notifications.empty') || 'No notifications'}
            style={{ padding: 24 }}
          />
        ) : (
          <List
            loading={notificationLoading}
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: item.read ? 'transparent' : '#f0f7ff',
                }}
                onClick={() => handleNotificationClick(item)}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!item.read && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#1890ff',
                        }}
                      />
                    )}
                    <Text strong={!item.read} style={{ fontSize: 14 }}>
                      {item.title}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }} className="notification-message">
                    {item.message}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: '/patients', icon: <TeamOutlined />, label: t('menu.patients') },
    { key: '/demands', icon: <FileTextOutlined />, label: t('menu.demands') },
    { key: '/paths', icon: <ShareAltOutlined />, label: t('menu.paths') },
    { key: '/touchpoints', icon: <ContactsOutlined />, label: t('menu.touchpoints') },
    { key: '/followups', icon: <CalendarOutlined />, label: t('menu.followups') },
    { key: '/reports', icon: <BarChartOutlined />, label: t('menu.reports') },
    { key: '/admin', icon: <SettingOutlined />, label: t('menu.admin') },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: collapsed ? 16 : 18,
            fontWeight: 600,
            color: '#1E5F8A',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {collapsed ? 'MRRM' : t('auth.loginSubtitle')}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LanguageSwitcher />
            <Dropdown
              dropdownRender={() => notificationOverlay}
              trigger={['click']}
              placement="bottomRight"
              onOpenChange={(open) => {
                if (open) fetchNotifications();
              }}
            >
              <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
              </Badge>
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1E5F8A' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <span>{user?.name || 'User'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 24, background: '#f5f5f5' }}>
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 112px)',
              background: '#fff',
              borderRadius: 8,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
