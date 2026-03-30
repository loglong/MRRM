import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface TodayTask {
  id: string;
  patient: string;
  task: string;
  time: string;
  status: 'pending' | 'completed';
}

const todayTasks: TodayTask[] = [
  { id: '1', patient: 'Zhang Wei', task: 'Follow-up call', time: '09:00', status: 'pending' },
  { id: '2', patient: 'Li Ming', task: 'Treatment plan review', time: '10:30', status: 'completed' },
  { id: '3', patient: 'Wang Fang', task: 'Lab results discussion', time: '14:00', status: 'pending' },
];

const taskColumns: ColumnsType<TodayTask> = [
  { title: 'Time', dataIndex: 'time', key: 'time', width: 80 },
  { title: 'Patient', dataIndex: 'patient', key: 'patient' },
  { title: 'Task', dataIndex: 'task', key: 'task' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'completed' ? 'green' : 'orange'}>
        {status === 'completed' ? 'Completed' : 'Pending'}
      </Tag>
    ),
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Dashboard</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Patients"
              value={1256}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1E5F8A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Open Demands"
              value={89}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#B8760A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Follow-ups"
              value={24}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#2E7D5A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={78}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#2E7D5A' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Today's Tasks" size="small">
            <Table
              columns={taskColumns}
              dataSource={todayTasks}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Stats" size="small">
            <p>New patients this week: <strong>15</strong></p>
            <p>Completed treatments: <strong>42</strong></p>
            <p>Pending reviews: <strong>8</strong></p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
