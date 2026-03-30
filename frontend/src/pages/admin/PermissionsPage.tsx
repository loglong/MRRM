import { useState, useEffect } from 'react';
import { Table, Input, Tag, Space, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { permissionsApi, type Permission } from '../../api/permissions';

const { Search } = Input;

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await permissionsApi.list();
      setPermissions(data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(
    (p) =>
      p.code.toLowerCase().includes(searchText.toLowerCase()) ||
      p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const groupedPermissions = {
    MENU: filteredPermissions.filter((p) => p.type === 'MENU'),
    BUTTON: filteredPermissions.filter((p) => p.type === 'BUTTON'),
    API: filteredPermissions.filter((p) => p.type === 'API'),
  };

  const columns: ColumnsType<Permission> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'MENU' ? 'blue' : type === 'BUTTON' ? 'green' : 'purple';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Menu Path',
      dataIndex: 'menuPath',
      key: 'menuPath',
      render: (path: string | undefined) =>
        path ? <Tag>{path}</Tag> : <span style={{ color: '#999' }}>-</span>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Permissions Reference</h2>
        <Search
          placeholder="Search by code or name"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="Menu Permissions" size="small">
          <Table
            columns={columns}
            dataSource={groupedPermissions.MENU}
            rowKey="id"
            pagination={false}
            size="small"
            loading={loading}
          />
        </Card>

        <Card title="Button Permissions" size="small">
          <Table
            columns={columns}
            dataSource={groupedPermissions.BUTTON}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            size="small"
            loading={loading}
          />
        </Card>

        {groupedPermissions.API.length > 0 && (
          <Card title="API Permissions" size="small">
            <Table
              columns={columns}
              dataSource={groupedPermissions.API}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        )}
      </Space>
    </div>
  );
}
