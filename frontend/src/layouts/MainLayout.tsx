import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
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
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/patients', icon: <TeamOutlined />, label: 'Patients' },
  { key: '/demands', icon: <FileTextOutlined />, label: 'Demands' },
  { key: '/paths', icon: <ShareAltOutlined />, label: 'Paths' },
  { key: '/touchpoints', icon: <ContactsOutlined />, label: 'Touchpoints' },
  { key: '/followups', icon: <CalendarOutlined />, label: 'Follow-ups' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  { key: '/admin', icon: <SettingOutlined />, label: 'Admin' },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
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
          {collapsed ? 'MRRM' : 'MRRM System'}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Badge count={5}>
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
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
