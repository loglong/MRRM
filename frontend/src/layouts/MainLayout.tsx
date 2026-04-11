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
  ExperimentOutlined,
  MedicineBoxOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { notificationsApi, Notification } from '../api/notifications';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Apple Design Colors
const APPLE_BLUE = '#0071e3';
const APPLE_NEAR_BLACK = '#1d1d1f';

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
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 6px 30px rgba(0, 0, 0, 0.15)',
        width: 360,
        maxHeight: 480,
        overflow: 'hidden',
      }}
      className="dark-scrollbar"
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 21,
            fontWeight: 700,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Helvetica, Arial, sans-serif",
          }}
        >
          {t('notifications.title') || 'Notifications'}
        </Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead} style={{ color: APPLE_BLUE }}>
            {t('notifications.markAllRead') || 'Mark all read'}
          </Button>
        )}
      </div>
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('notifications.empty') || 'No notifications'}
            style={{ padding: 32 }}
          />
        ) : (
          <List
            loading={notificationLoading}
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '14px 20px',
                  cursor: 'pointer',
                  background: item.read ? 'transparent' : 'rgba(0, 113, 227, 0.04)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
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
                          background: APPLE_BLUE,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Text
                      strong={!item.read}
                      style={{
                        fontSize: 15,
                        fontWeight: item.read ? 400 : 600,
                        color: item.read ? 'rgba(0, 0, 0, 0.65)' : APPLE_NEAR_BLACK,
                      }}
                    >
                      {item.title}
                    </Text>
                  </div>
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'rgba(0, 0, 0, 0.48)',
                      display: 'block',
                      marginTop: 2,
                    }}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'rgba(0, 0, 0, 0.36)',
                      display: 'block',
                      marginTop: 4,
                    }}
                  >
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
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
    { key: '/journey-center', icon: <CustomerServiceOutlined />, label: t('menu.journeyCenter') },
    { key: '/health-archive', icon: <MedicineBoxOutlined />, label: t('menu.healthArchive') },
    { key: '/experience', icon: <ExperimentOutlined />, label: t('menu.experience') },
    { key: '/admin', icon: <SettingOutlined />, label: t('menu.admin') },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f7ff' }}>
      {/* Apple-style Glass Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        trigger={null}
        style={{
          background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>M</span>
          </div>
          {!collapsed && (
            <span
              style={{
                marginLeft: 10,
                fontSize: 17,
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: -0.4,
              }}
            >
              {t('auth.loginSubtitle') || 'MRRM'}
            </span>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            marginTop: 8,
            background: 'transparent',
          }}
        />

        {/* Custom Collapse Trigger */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '12px 0',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s',
              transform: collapsed ? 'rotate(180deg)' : 'none',
            }}
          >
            {collapsed ? '→' : '←'}
          </div>
        </div>
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s ease' }}>
        {/* Apple-style Glass Header */}
        <Header
          className="custom-header"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
            padding: '0 24px',
            height: 56,
            lineHeight: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            position: 'relative',
            zIndex: 99,
            boxShadow: '0 1px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <LanguageSwitcher />
            <Dropdown
              dropdownRender={() => notificationOverlay}
              trigger={['click']}
              placement="bottomRight"
              onOpenChange={(open) => {
                if (open) fetchNotifications();
              }}
            >
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                  <BellOutlined
                    style={{
                      fontSize: 20,
                      color: '#ffffff',
                      opacity: 0.85,
                    }}
                  />
                </Badge>
              </div>
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 8,
                  transition: 'background 0.2s',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: APPLE_BLUE,
                    flexShrink: 0,
                  }}
                  size={32}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  {user?.name || 'User'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Page Content */}
        <Content style={{ margin: 24, minHeight: 'calc(100vh - 64px)' }}>
          <div
            style={{
              background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)',
              borderRadius: 12,
              padding: 24,
              minHeight: '100%',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
