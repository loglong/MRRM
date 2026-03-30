import { Card, Tag, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/api/patients';

const { Text } = Typography;

const tierColors: Record<string, string> = {
  HIGH_VALUE: 'gold',
  REGULAR: 'default',
  LOST_RISK: 'red',
};

const tierLabels: Record<string, string> = {
  HIGH_VALUE: '高价值',
  REGULAR: '普通',
  LOST_RISK: '流失风险',
};

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/patients/${patient.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      title={
        <Space>
          <Text strong>{patient.name}</Text>
          <Tag color={tierColors[patient.tier]}>{tierLabels[patient.tier]}</Tag>
        </Space>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <Text type="secondary">Phone:</Text>
          <div>{patient.phone || '-'}</div>
        </div>
        <div>
          <Text type="secondary">Email:</Text>
          <div>{patient.email || '-'}</div>
        </div>
        <div>
          <Text type="secondary">Gender:</Text>
          <div>{patient.gender || '-'}</div>
        </div>
        <div>
          <Text type="secondary">Last Visit:</Text>
          <div>{patient.lastVisitAt ? new Date(patient.lastVisitAt).toLocaleDateString() : '-'}</div>
        </div>
      </div>
    </Card>
  );
}
