import { Card, Tag, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import './MobileDemandCard.css';

const { Text } = Typography;

interface MobileDemandCardProps {
  id: string;
  patientName: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  OPEN: 'blue',
  IN_PROGRESS: 'processing',
  PENDING: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'default',
  LOST: 'error',
};

const priorityColors: Record<string, string> = {
  LOW: 'green',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
};

const statusLabels: Record<string, string> = {
  OPEN: '开放',
  IN_PROGRESS: '进行中',
  PENDING: '待处理',
  FULFILLED: '已完成',
  CANCELLED: '已取消',
  LOST: '已流失',
};

const priorityLabels: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急',
};

const typeLabels: Record<string, string> = {
  CONSULTATION: '咨询',
  TREATMENT: '治疗',
  PURCHASE: '购买',
  FOLLOWUP: '随访',
  OTHER: '其他',
};

export default function MobileDemandCard({
  patientName,
  type,
  title,
  status,
  priority,
  createdAt,
  onClick,
}: MobileDemandCardProps) {
  return (
    <Card className="mobile-demand-card" size="small" onClick={onClick}>
      <div className="demand-header">
        <FileTextOutlined className="demand-icon" />
        <Text type="secondary" className="demand-type">{typeLabels[type] || type}</Text>
      </div>
      <Text strong className="demand-title">{title}</Text>
      <div className="demand-patient">{patientName}</div>
      <div className="demand-footer">
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
        <Tag color={priorityColors[priority]}>{priorityLabels[priority] || priority}</Tag>
        <Text type="secondary" className="demand-date">
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      </div>
    </Card>
  );
}
