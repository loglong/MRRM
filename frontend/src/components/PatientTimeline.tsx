import { Timeline, Card, Tag, Typography, Space, Pagination, Spin } from 'antd';
import {
  CustomerServiceOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { JourneyEvent } from '@/api/journey';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface PatientTimelineProps {
  events: JourneyEvent[];
  loading?: boolean;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
}

const eventTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  TOUCHPOINT: { icon: <CustomerServiceOutlined />, color: 'blue' },
  DEMAND: { icon: <FileTextOutlined />, color: 'green' },
  PATH_START: { icon: <PlayCircleOutlined />, color: 'purple' },
  PATH_STEP: { icon: <ProjectOutlined />, color: 'purple' },
  PATH_END: { icon: <CheckCircleOutlined />, color: 'purple' },
  FOLLOWUP: { icon: <CalendarOutlined />, color: 'orange' },
  MILESTONE: { icon: <StarOutlined />, color: 'gold' },
};

const sentimentColors: Record<string, string> = {
  POSITIVE: 'success',
  NEUTRAL: 'default',
  NEGATIVE: 'error',
};

export function PatientTimeline({
  events,
  loading,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
}: PatientTimelineProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
        {t('journey.noEvents', 'No events recorded')}
      </div>
    );
  }

  const timelineItems = events.map((event) => ({
    dot: eventTypeConfig[event.type]?.icon,
    color: eventTypeConfig[event.type]?.color,
    children: (
      <Card size="small" style={{ marginBottom: 8 }}>
        <Space direction="vertical" size={0}>
          <Text strong>{event.title}</Text>
          <Space>
            <Tag>{t(`journey.eventType.${event.type}`, event.type.replace('_', ' '))}</Tag>
            {event.subType && <Tag>{event.subType}</Tag>}
            {event.sentiment && (
              <Tag color={sentimentColors[event.sentiment]}>{t(`journey.sentiment.${event.sentiment}`, event.sentiment)}</Tag>
            )}
            {event.status && <Tag color="blue">{t(`journey.status.${event.status}`, event.status)}</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(event.occurredAt).toLocaleString()}
          </Text>
        </Space>
      </Card>
    ),
  }));

  return (
    <div>
      <Timeline mode="left" items={timelineItems} />
      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination
            current={currentPage}
            total={totalPages * 10}
            pageSize={10}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default PatientTimeline;
