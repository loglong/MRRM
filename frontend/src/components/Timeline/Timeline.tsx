import { Timeline as AntTimeline, Card, Tag, Typography, Space, Button, Empty, Spin, Select } from 'antd';
import {
  CustomerServiceOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  StarOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const { Text } = Typography;

export interface TimelineEvent {
  id: string;
  type: 'TOUCHPOINT' | 'DEMAND' | 'PATH_START' | 'PATH_STEP' | 'PATH_END' | 'FOLLOWUP' | 'MILESTONE';
  title: string;
  subType?: string;
  description?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  status?: string;
  occurredAt: string;
  responsibleUser?: string;
  metadata?: Record<string, any>;
}

export interface TimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  showFilters?: boolean;
  showDateRange?: boolean;
}

export interface TimelineFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  dateRange?: [string, string] | null;
  onDateRangeChange?: (range: [string, string] | null) => void;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; cssColor: string }> = {
  TOUCHPOINT: { icon: <CustomerServiceOutlined />, color: 'blue', cssColor: 'var(--color-primary, #1E5F8A)' },
  DEMAND: { icon: <FileTextOutlined />, color: 'green', cssColor: 'var(--color-success, #2E7D5A)' },
  PATH_START: { icon: <PlayCircleOutlined />, color: 'orange', cssColor: 'var(--color-warning, #B8760A)' },
  PATH_STEP: { icon: <ProjectOutlined />, color: 'orange', cssColor: '#D4A03A' },
  PATH_END: { icon: <CheckCircleOutlined />, color: 'cyan', cssColor: '#38B2AC' },
  FOLLOWUP: { icon: <CalendarOutlined />, color: 'purple', cssColor: '#805AD5' },
  MILESTONE: { icon: <StarOutlined />, color: 'gold', cssColor: '#D69E2E' },
};

const SENTIMENT_CONFIG: Record<string, { color: string; emoji: string }> = {
  POSITIVE: { color: 'success', emoji: '😊' },
  NEUTRAL: { color: 'default', emoji: '😐' },
  NEGATIVE: { color: 'error', emoji: '😞' },
};

const ALL_TYPES = ['TOUCHPOINT', 'DEMAND', 'PATH_START', 'PATH_STEP', 'PATH_END', 'FOLLOWUP', 'MILESTONE'];

export function TimelineFilters({
  selectedTypes,
  onTypesChange,
}: TimelineFiltersProps) {
  const { t } = useTranslation();

  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Select
        mode="multiple"
        placeholder={t('journey.filterByType') || 'Filter by type'}
        value={selectedTypes.length > 0 ? selectedTypes : ALL_TYPES}
        onChange={onTypesChange}
        style={{ minWidth: 200 }}
        options={ALL_TYPES.map((type) => ({
          value: type,
          label: t(`journey.eventType.${type}`, type.replace('_', ' ')),
        }))}
        maxTagCount={3}
        allowClear
      />
    </Space>
  );
}

export function TimelineItem({
  event,
  onClick,
}: {
  event: TimelineEvent;
  onClick?: (event: TimelineEvent) => void;
}) {
  const { t } = useTranslation();
  const config = EVENT_TYPE_CONFIG[event.type] || { icon: null, color: 'gray', cssColor: '#d9d9d9' };
  const sentiment = event.sentiment ? SENTIMENT_CONFIG[event.sentiment] : null;

  return (
    <Card
      size="small"
      hoverable={!!onClick}
      onClick={() => onClick?.(event)}
      style={{ marginBottom: 8 }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text strong style={{ fontSize: 14 }}>{event.title}</Text>
          {onClick && <PlusOutlined style={{ color: '#999', fontSize: 12 }} />}
        </div>

        <Space wrap>
          <Tag icon={config.icon} color={config.color}>
            {t(`journey.eventType.${event.type}`, event.type.replace('_', ' '))}
          </Tag>
          {event.subType && <Tag>{event.subType}</Tag>}
          {sentiment && (
            <Tag color={sentiment.color}>
              {sentiment.emoji} {event.sentiment ? t(`journey.sentiment.${event.sentiment}`) : ''}
            </Tag>
          )}
          {event.status && <Tag color="blue">{t(`journey.status.${event.status}`, event.status)}</Tag>}
        </Space>

        {event.description && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {event.description}
          </Text>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(event.occurredAt).format('YYYY-MM-DD HH:mm')}
          </Text>
          {event.responsibleUser && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {event.responsibleUser}
            </Text>
          )}
        </div>
      </Space>
    </Card>
  );
}

export function Timeline({
  events,
  loading,
  onEventClick,
  onLoadMore,
  hasMore,
  loadingMore,
  showFilters = false,
}: TimelineProps) {
  const { t } = useTranslation();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(ALL_TYPES);

  const filteredEvents = events.filter(
    (event) => selectedTypes.length === 0 || selectedTypes.includes(event.type)
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Empty
        description={t('journey.noEvents') || 'No events recorded'}
        style={{ padding: 48 }}
      />
    );
  }

  const timelineItems = filteredEvents.map((event) => {
    const config = EVENT_TYPE_CONFIG[event.type] || { icon: null, color: 'gray' };

    return {
      dot: config.icon,
      color: config.color,
      children: <TimelineItem event={event} onClick={onEventClick} />,
    };
  });

  return (
    <div>
      {showFilters && (
        <TimelineFilters
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
        />
      )}

      <AntTimeline mode="left" items={timelineItems} />

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={onLoadMore} loading={loadingMore}>
            {t('journey.loadMore') || 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
