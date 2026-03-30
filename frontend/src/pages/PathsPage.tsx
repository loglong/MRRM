import { Table, Space, Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function PathsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Treatment Paths</h1>
        <Space>
          <Input placeholder="Search paths" style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />}>Create Path</Button>
        </Space>
      </div>
      <Table
        dataSource={[]}
        rowKey="id"
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Version', dataIndex: 'version', key: 'version' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Steps', dataIndex: 'stepCount', key: 'stepCount' },
          { title: 'Updated', dataIndex: 'updatedAt', key: 'updatedAt' },
        ]}
      />
    </div>
  );
}
