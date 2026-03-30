import { Table, Tag, Space, Button, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Touchpoint {
  id: string;
  patient: string;
  type: string;
  channel: string;
  title: string;
  sentiment?: string;
  createdAt: string;
}

const touchpoints: Touchpoint[] = [];

export default function TouchpointsPage() {
  const columns: ColumnsType<Touchpoint> = [
    { title: 'Patient', dataIndex: 'patient', key: 'patient' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Channel', dataIndex: 'channel', key: 'channel' },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
      render: (sentiment?: string) => {
        const colors: Record<string, string> = { POSITIVE: 'green', NEUTRAL: 'default', NEGATIVE: 'red' };
        return sentiment ? <Tag color={colors[sentiment]}>{sentiment}</Tag> : null;
      },
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Touchpoints</h1>
        <Space>
          <Input placeholder="Search" style={{ width: 150 }} />
          <Select placeholder="Type" style={{ width: 120 }} allowClear>
            <Select.Option value="VISIT">Visit</Select.Option>
            <Select.Option value="CALL">Call</Select.Option>
            <Select.Option value="MESSAGE">Message</Select.Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />}>Record Touchpoint</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={touchpoints} rowKey="id" />
    </div>
  );
}
