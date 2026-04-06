import { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { healthApi, HealthArchive, HealthRecord } from '@/api/health';

const { Text } = Typography;

interface Props {
  patientId: string;
}

export default function HealthArchiveSummary({ patientId }: Props) {
  const { t } = useTranslation();
  const [archive, setArchive] = useState<HealthArchive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    setLoading(true);
    healthApi.getHealthArchive(patientId)
      .then(setArchive)
      .catch((err) => {
        console.error('Failed to load health archive', err);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <Spin />;
  }

  if (!archive) {
    return <Empty description={t('health.archiveEmpty') || 'No health archive data'} />;
  }

  const renderRecordList = (records: HealthRecord[], title: string) => (
    <div style={{ marginBottom: 16 }}>
      <Text strong>{title}</Text>
      {records.length === 0 ? (
        <div style={{ padding: '8px 0', color: '#999' }}>{t('common.empty') || 'None'}</div>
      ) : (
        <List
          size="small"
          dataSource={records}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0' }}>
              <div>
                <div>{item.title}</div>
                {item.description && (
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                )}
                <div style={{ fontSize: 12, color: '#999' }}>
                  {new Date(item.recordDate).toLocaleDateString()}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <div>
      {renderRecordList(archive.allergies, t('health.allergies') || '过敏史')}
      {renderRecordList(archive.pastHistory, t('health.pastHistory') || '既往史')}
      {renderRecordList(archive.examResults, t('health.examResults') || '检查结果')}
    </div>
  );
}
