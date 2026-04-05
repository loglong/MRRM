import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, DatePicker, Select, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { experienceApi, SatisfactionTrend, DecliningPatient } from '../api/experience';
import SatisfactionTrendChart from '../components/SatisfactionTrendChart';
import DeclineAlertList from '../components/DeclineAlertList';

const { RangePicker } = DatePicker;

export default function ExperiencePage() {
  const { t } = useTranslation();
  const [trends, setTrends] = useState<SatisfactionTrend[]>([]);
  const [declining, setDeclining] = useState<DecliningPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('week');

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: any = { granularity };
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }

      const [trendsData, decliningData] = await Promise.all([
        experienceApi.getSatisfactionTrends(filters),
        experienceApi.getDecliningPatients(filters),
      ]);

      setTrends(trendsData);
      setDeclining(decliningData);
    } catch (err) {
      message.error('Failed to load experience data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [granularity]);

  const handleExport = async () => {
    try {
      const filters: any = { granularity };
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }

      const blob = await experienceApi.exportExperience(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `experience-report-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Report exported successfully');
    } catch (err) {
      message.error('Failed to export report');
    }
  };

  // Calculate stats
  const avgScore = trends.length > 0
    ? Math.round(trends.reduce((sum, t) => sum + t.score, 0) / trends.length)
    : 0;
  const totalResponses = trends.reduce((sum, t) => sum + t.total, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={[t('experience.selectDateRange'), t('experience.selectDateRange')]}
          />
        </Col>
        <Col>
          <Select
            value={granularity}
            onChange={setGranularity}
            options={[
              { value: 'day', label: t('experience.day') },
              { value: 'week', label: t('experience.week') },
              { value: 'month', label: t('experience.month') },
            ]}
            style={{ width: 120 }}
          />
        </Col>
        <Col>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            {t('experience.export')}
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <SatisfactionTrendChart data={trends} loading={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card title={t('experience.averageScore')}>
            <div style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>{avgScore}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={t('experience.totalInteractions')}>
            <div style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>{totalResponses}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={t('experience.declineAlert')}>
            <div style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>{declining.length}</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <DeclineAlertList patients={declining} loading={loading} />
        </Col>
      </Row>
    </div>
  );
}
