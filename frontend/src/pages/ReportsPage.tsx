import { Row, Col, Card, DatePicker, Button, message, Space } from 'antd';
import { TeamOutlined, FileTextOutlined, RiseOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { KPICard } from '../components/KPICard';
import { reportsApi } from '../api/reports';

const { RangePicker } = DatePicker;

export default function ReportsPage() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState({
    newPatients: 0,
    conversionRate: 0,
    followupCompletionRate: 0,
  });
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }

      const data = await reportsApi.getKPIs(filters);
      setKpis({
        newPatients: data.newPatients,
        conversionRate: data.conversionRate,
        followupCompletionRate: data.followupCompletionRate,
      });
    } catch (error) {
      message.error('Failed to load KPI data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [dateRange]);

  const handleExport = async () => {
    try {
      const filters: any = {};
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }

      const blob = await reportsApi.exportKPIs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kpi-report-${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Report exported successfully');
    } catch (error) {
      message.error('Failed to export report');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{t('menu.reports')}</h1>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            placeholder={[t('reports.selectDateRange'), t('reports.selectDateRange')]}
          />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            {t('reports.export')}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <KPICard
            title={t('reports.newPatients')}
            value={kpis.newPatients}
            prefix={<TeamOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <KPICard
            title={t('reports.conversionRate')}
            value={kpis.conversionRate}
            suffix="%"
            prefix={<FileTextOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <KPICard
            title={t('reports.followupCompletionRate')}
            value={kpis.followupCompletionRate}
            suffix="%"
            prefix={<RiseOutlined />}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('reports.patientTrends')}>
            <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>{t('reports.chartPlaceholder')}</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('reports.demandAnalysis')}>
            <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>{t('reports.chartPlaceholder')}</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
