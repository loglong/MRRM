import { Card, Table, Tag } from 'antd';
import type { DecliningPatient } from '../api/experience';

interface Props {
  patients: DecliningPatient[];
  loading?: boolean;
  onViewPatient?: (id: string) => void;
}

export default function DeclineAlertList({ patients, loading }: Props) {
  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Current Score',
      dataIndex: 'currentScore',
      key: 'currentScore',
      render: (score: number) => score.toFixed(0),
    },
    {
      title: 'Previous Score',
      dataIndex: 'previousScore',
      key: 'previousScore',
      render: (score: number) => score.toFixed(0),
    },
    {
      title: 'Decline',
      dataIndex: 'decline',
      key: 'decline',
      render: (decline: number) => {
        const isSevere = decline < -30;
        const isModerate = decline < -20;
        const color = isSevere ? 'red' : isModerate ? 'orange' : 'default';
        return <Tag color={color}>{decline.toFixed(0)}%</Tag>;
      },
      sorter: (a: DecliningPatient, b: DecliningPatient) => a.decline - b.decline,
    },
  ];

  return (
    <Card title="Patients with Declining Satisfaction">
      <Table
        columns={columns}
        dataSource={patients}
        rowKey="patientId"
        loading={loading}
        pagination={false}
        locale={{ emptyText: 'No patients with declining experience' }}
      />
    </Card>
  );
}
