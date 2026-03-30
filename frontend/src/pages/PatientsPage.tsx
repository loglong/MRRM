import { Table, Tag, Space, Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Patient {
  id: string;
  name: string;
  phone: string;
  status: string;
  lastVisit: string;
  assignedTo: string;
}

const patients: Patient[] = [
  { id: '1', name: 'Zhang Wei', phone: '138****1234', status: 'ACTIVE', lastVisit: '2024-01-15', assignedTo: 'Dr. Li' },
  { id: '2', name: 'Li Ming', phone: '139****5678', status: 'ACTIVE', lastVisit: '2024-01-14', assignedTo: 'Dr. Wang' },
  { id: '3', name: 'Wang Fang', phone: '137****9012', status: 'INACTIVE', lastVisit: '2024-01-10', assignedTo: 'Dr. Li' },
];

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  CHURNED: 'red',
};

export default function PatientsPage() {
  const columns: ColumnsType<Patient> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    { title: 'Last Visit', dataIndex: 'lastVisit', key: 'lastVisit' },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">View</Button>
          <Button type="link" size="small">Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Patients</h1>
        <Space>
          <Input placeholder="Search patients" style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />}>Add Patient</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={patients} rowKey="id" />
    </div>
  );
}
