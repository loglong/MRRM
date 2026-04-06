import { Card, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { DecliningPatient } from '../api/experience';

interface Props {
  patients: DecliningPatient[];
  loading?: boolean;
  onViewPatient?: (id: string) => void;
}

export default function DeclineAlertList({ patients, loading }: Props) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('patients.patientName'),
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: t('experience.currentScore'),
      dataIndex: 'currentScore',
      key: 'currentScore',
      render: (score: number) => score.toFixed(0),
    },
    {
      title: t('experience.previousScore'),
      dataIndex: 'previousScore',
      key: 'previousScore',
      render: (score: number) => score.toFixed(0),
    },
    {
      title: t('experience.decline'),
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
    <Card title={t('experience.decliningPatients')}>
      <Table
        columns={columns}
        dataSource={patients}
        rowKey="patientId"
        loading={loading}
        pagination={false}
        locale={{ emptyText: t('experience.noDeclines') }}
      />
    </Card>
  );
}
