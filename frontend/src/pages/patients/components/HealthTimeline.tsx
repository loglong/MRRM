import { useEffect, useState } from 'react';
import { Timeline, Spin, Empty, Button, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { healthApi, HealthRecord } from '@/api/health';

interface Props {
  patientId: string;
}

const categoryColors: Record<string, string> = {
  ALLERGY: 'red',
  PAST_HISTORY: 'blue',
  EXAM_RESULT: 'green',
  DIAGNOSIS: 'purple',
  TREATMENT: 'orange',
};

const categoryLabels: Record<string, string> = {
  ALLERGY: '过敏',
  PAST_HISTORY: '既往史',
  EXAM_RESULT: '检查结果',
  DIAGNOSIS: '诊断',
  TREATMENT: '治疗',
};

export default function HealthTimeline({ patientId }: Props) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const fetchTimeline = async (cursor?: string, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await healthApi.getHealthTimeline(patientId, {
        cursor,
        limit: 20,
      });

      if (isLoadMore) {
        setRecords((prev) => [...prev, ...result.data]);
      } else {
        setRecords(result.data);
      }
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error('Failed to load health timeline', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [patientId]);

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchTimeline(nextCursor, true);
    }
  };

  if (loading) {
    return <Spin />;
  }

  if (records.length === 0) {
    return <Empty description={t('health.timelineEmpty') || 'No health records yet'} />;
  }

  return (
    <div>
      <Timeline
        items={records.map((record) => ({
          color: categoryColors[record.category] || 'gray',
          children: (
            <div>
              <div style={{ fontWeight: 500 }}>
                {record.title}
                <Tag color={categoryColors[record.category]} style={{ marginLeft: 8 }}>
                  {categoryLabels[record.category] || record.category}
                </Tag>
              </div>
              {record.description && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {record.description}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {new Date(record.recordDate).toLocaleDateString()}
              </div>
            </div>
          ),
        }))}
      />
      {nextCursor && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={handleLoadMore} loading={loadingMore}>
            {t('common.loadMore') || 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
