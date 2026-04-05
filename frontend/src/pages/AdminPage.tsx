import { Tabs, Table, Button, Tag, Card, Typography, Space, Descriptions } from 'antd';
import { PlusOutlined, UserOutlined, TeamOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export default function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tabItems = [
    {
      key: 'overview',
      label: <span><UserOutlined /> {t('admin.overview') || 'Overview'}</span>,
      children: (
        <div>
          <Title level={4}>{t('admin.adminOverview') || 'Administration Overview'}</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card
              title={t('users.title')}
              extra={<Button type="link" onClick={() => navigate('/admin/users')}>{t('admin.manageUsers')} <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label={t('users.title')}>
                  {t('admin.userManagementDesc') || 'Create, edit, and deactivate user accounts within your organization.'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title={t('roles.title')}
              extra={<Button type="link" onClick={() => navigate('/admin/roles')}>{t('admin.manageRoles')} <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label={t('roles.permissions')}>
                  {t('admin.roleDesc') || 'Configure roles with menu and button-level permissions.'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title={t('permissions.title')}
              extra={<Button type="link" onClick={() => navigate('/admin/permissions')}>{t('admin.viewPermissions')} <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label={t('permissions.title')}>
                  {t('admin.permissionDesc') || 'Reference list of all available menu and button permissions.'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </div>
      ),
    },
    {
      key: 'users',
      label: <span><UserOutlined /> {t('users.title')}</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>{t('users.addUser')}</Button>
          </div>
          <Table
            dataSource={[]}
            rowKey="id"
            columns={[
              { title: t('common.name'), dataIndex: 'name', key: 'name' },
              { title: t('common.email'), dataIndex: 'email', key: 'email' },
              { title: t('roles.title'), dataIndex: 'role', key: 'role' },
              { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'orange'}>{s}</Tag> },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'organizations',
      label: <span><TeamOutlined /> {t('admin.organizations') || 'Organizations'}</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>{t('admin.addOrg') || 'Add Organization'}</Button>
          </div>
          <Table
            dataSource={[]}
            rowKey="id"
            columns={[
              { title: t('common.name'), dataIndex: 'name', key: 'name' },
              { title: t('common.code'), dataIndex: 'code', key: 'code' },
              { title: t('common.status'), dataIndex: 'status', key: 'status' },
              { title: t('common.createTime'), dataIndex: 'createdAt', key: 'createdAt' },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'audit',
      label: <span><FileTextOutlined /> {t('admin.auditLogs') || 'Audit Logs'}</span>,
      children: (
        <Table
          dataSource={[]}
          rowKey="id"
          columns={[
            { title: t('admin.user'), dataIndex: 'userName', key: 'userName' },
            { title: t('admin.action'), dataIndex: 'action', key: 'action' },
            { title: t('admin.entity'), dataIndex: 'entityType', key: 'entityType' },
            { title: t('common.time'), dataIndex: 'createdAt', key: 'createdAt' },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>{t('menu.admin')}</h1>
      <Tabs items={tabItems} />
    </div>
  );
}
