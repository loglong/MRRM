import { Tabs, Table, Button, Tag } from 'antd';
import { PlusOutlined, UserOutlined, TeamOutlined, SafetyOutlined, FileTextOutlined } from '@ant-design/icons';

export default function AdminPage() {
  const tabItems = [
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
      key: 'roles',
      label: <span><SafetyOutlined /> Roles</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>Add Role</Button>
          </div>
          <Table
            dataSource={[]}
            rowKey="id"
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Code', dataIndex: 'code', key: 'code' },
              { title: 'System', dataIndex: 'isSystem', key: 'isSystem', render: (v: boolean) => v ? <Tag>System</Tag> : null },
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
