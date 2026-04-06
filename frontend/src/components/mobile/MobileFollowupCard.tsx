import { Card, Tag, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import './MobileFollowupCard.css';

const { Text } = Typography;

interface MobileFollowupCardProps {
  id: string;
  patientName: string;
  type: string;
  status: string;
  planTime: string;
  content: string | null;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  MISSED: 'error',
  CANCELLED: 'default',
  RESCHEDULED: 'processing',
};

const statusLabels: Record<string, string> = {
  PENDING: '待执行',
  COMPLETED: '已完成',
  MISSED: '已错过',
  CANCELLED: '已取消',
  RESCHEDULED: '已重新安排',
};

const typeLabels: Record<string, string> = {
  ROUTINE: '常规随访',
  POST_TREATMENT: '治疗后随访',
  PRE_APPOINTMENT: '预约前',
  CUSTOM: '自定义',
};

export default function MobileFollowupCard({
  patientName,
  type,
  status,
  planTime,
  content,
  onClick,
}: MobileFollowupCardProps) {
  const planDate = new Date(planTime);
  const isOverdue = planDate < new Date() && status === 'PENDING';

  return (
    <Card className={`mobile-followup-card ${isOverdue ? 'overdue' : ''}`} size="small" onClick={onClick}>
      <div className="followup-header">
        <BellOutlined className="followup-icon" />
        <Text type="secondary" className="followup-type">{typeLabels[type] || type}</Text>
        {isOverdue && <Tag color="red">逾期</Tag>}
      </div>
      <Text strong className="followup-patient">{patientName}</Text>
      {content && <div className="followup-content">{content}</div>}
      <div className="followup-footer">
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
        <Text type="secondary" className="followup-time">
          {planDate.toLocaleDateString()} {planDate.getHours().toString().padStart(2, '0')}:{planDate.getMinutes().toString().padStart(2, '0')}
        </Text>
      </div>
    </Card>
  );
}
