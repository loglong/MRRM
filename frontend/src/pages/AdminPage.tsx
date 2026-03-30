import { Tabs, Table, Button, Tag, Card, Typography, Space, Descriptions } from 'antd';
import { PlusOutlined, UserOutlined, TeamOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function AdminPage() {
  const navigate = useNavigate();

  const tabItems = [
    {
      key: 'overview',
      label: <span><UserOutlined /> Overview</span>,
      children: (
        <div>
          <Title level={4}>Administration Overview</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card
              title="User Management"
              extra={<Button type="link" onClick={() => navigate('/admin/users')}>Manage Users <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label="Manage user accounts, roles, and status.">
                  Create, edit, and deactivate user accounts within your organization.
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Roles & Permissions"
              extra={<Button type="link" onClick={() => navigate('/admin/roles')}>Manage Roles <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label="Role-based access control">
                  Configure roles with menu and button-level permissions.
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Permissions Reference"
              extra={<Button type="link" onClick={() => navigate('/admin/permissions')}>View Permissions <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label="Permission catalog">
                  Reference list of all available menu and button permissions.
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </div>
      ),
    },
    {
      key: 'users',
      label: <span><UserOutlined /> Users</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>Add User</Button>
          </div>
          <Table
            dataSource={[]}
            rowKey="id"
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Email', dataIndex: 'email', key: 'email' },
              { title: 'Role', dataIndex: 'role', key: 'role' },
              { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'orange'}>{s}</Tag> },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'organizations',
      label: <span><TeamOutlined /> Organizations</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>Add Organization</Button>
          </div>
          <Table
            dataSource={[]}
            rowKey="id"
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Code', dataIndex: 'code', key: 'code' },
              { title: 'Status', dataIndex: 'status', key: 'status' },
              { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'audit',
      label: <span><FileTextOutlined /> Audit Logs</span>,
      children: (
        <Table
          dataSource={[]}
          rowKey="id"
          columns={[
            { title: 'User', dataIndex: 'userName', key: 'userName' },
            { title: 'Action', dataIndex: 'action', key: 'action' },
            { title: 'Entity', dataIndex: 'entityType', key: 'entityType' },
            { title: 'Time', dataIndex: 'createdAt', key: 'createdAt' },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Administration</h1>
      <Tabs items={tabItems} />
    </div>
  );
}
