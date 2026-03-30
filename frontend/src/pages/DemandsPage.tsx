import { Table, Space, Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function DemandsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Demands</h1>
        <Space>
          <Input placeholder="Search demands" style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />}>Create Demand</Button>
        </Space>
      </div>
      <Table
        dataSource={[]}
        rowKey="id"
        columns={[
          { title: 'Patient', dataIndex: 'patient', key: 'patient' },
          { title: 'Type', dataIndex: 'type', key: 'type' },
          { title: 'Title', dataIndex: 'title', key: 'title' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Priority', dataIndex: 'priority', key: 'priority' },
          { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
        ]}
      />
    </div>
  );
}
