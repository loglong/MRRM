import { Table, Space, Button, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function FollowupsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Follow-ups</h1>
        <Space>
          <Input placeholder="Search" style={{ width: 150 }} />
          <Select placeholder="Status" style={{ width: 120 }} allowClear>
            <Select.Option value="PENDING">Pending</Select.Option>
            <Select.Option value="COMPLETED">Completed</Select.Option>
            <Select.Option value="MISSED">Missed</Select.Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />}>Create Plan</Button>
        </Space>
      </div>
      <Table
        dataSource={[]}
        rowKey="id"
        columns={[
          { title: 'Patient', dataIndex: 'patient', key: 'patient' },
          { title: 'Plan', dataIndex: 'planName', key: 'planName' },
          { title: 'Type', dataIndex: 'type', key: 'type' },
          { title: 'Scheduled', dataIndex: 'scheduledAt', key: 'scheduledAt' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
        ]}
      />
    </div>
  );
}
