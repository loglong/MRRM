import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Space, Button, Input, Select, DatePicker, Modal, message, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { touchpointsApi, Touchpoint, TouchpointFilters, TouchpointAnalytics } from '@/api/touchpoints';
import TouchpointFormModal from './TouchpointFormModal';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function TouchpointsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<Touchpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<TouchpointFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<Touchpoint | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [analytics, setAnalytics] = useState<TouchpointAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await touchpointsApi.list({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setData(result.data);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize, t]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const result = await touchpointsApi.getAnalytics({
        startDate: filters.startDate,
        endDate: filters.endDate,
        granularity: 'day',
      });
      setAnalytics(result);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  }, [filters.startDate, filters.endDate, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: keyof TouchpointFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0]?.toISOString(),
        endDate: dates[1]?.toISOString(),
      }));
    } else {
      setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
    }
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleVoid = async () => {
    if (!selectedTouchpoint || !voidReason.trim()) {
      message.error(t('touchpoints.enterVoidReason') || 'Please enter void reason');
      return;
    }
    try {
      await touchpointsApi.void(selectedTouchpoint.id, voidReason);
      message.success(t('common.success'));
      setVoidModalOpen(false);
      setVoidReason('');
      setSelectedTouchpoint(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const openVoidModal = (touchpoint: Touchpoint) => {
    setSelectedTouchpoint(touchpoint);
    setVoidModalOpen(true);
  };

  const toggleAnalytics = () => {
    if (!showAnalytics) {
      fetchAnalytics();
    }
    setShowAnalytics(!showAnalytics);
  };

  const columns: ColumnsType<Touchpoint> = [
    {
      title: t('patients.patientName') || 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient',
      render: (name: string) => name || '-',
    },
    {
      title: t('common.type') || 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          VISIT: t('touchpoints.visit') || 'Visit',
          CALL: t('touchpoints.call') || 'Call',
          MESSAGE: t('touchpoints.message') || 'Message',
          EMAIL: t('touchpoints.email') || 'Email',
          WECHAT: t('touchpoints.wechat') || 'WeChat',
          VIDEO: t('touchpoints.video') || 'Video',
          SMS: t('touchpoints.sms') || 'SMS',
          OTHER: t('touchpoints.other') || 'Other',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: t('touchpoints.channel') || 'Channel',
      dataIndex: 'channel',
      key: 'channel',
      render: (channel: string) => {
        const channelMap: Record<string, string> = {
          OFFLINE: t('touchpoints.offline') || 'Offline',
          ONLINE: t('touchpoints.online') || 'Online',
          MOBILE: t('touchpoints.mobile') || 'Mobile',
          PHONE: t('touchpoints.phone') || 'Phone',
        };
        return channel ? channelMap[channel] || channel : '-';
      },
    },
    {
      title: t('common.name') || 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('touchpoints.sentiment') || 'Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
      render: (sentiment?: string) => {
        const colors: Record<string, string> = {
          POSITIVE: 'green',
          NEUTRAL: 'default',
          NEGATIVE: 'red',
        };
        const labels: Record<string, string> = {
          POSITIVE: t('touchpoints.positive') || 'Positive',
          NEUTRAL: t('touchpoints.neutral') || 'Neutral',
          NEGATIVE: t('touchpoints.negative') || 'Negative',
        };
        return sentiment ? <Tag color={colors[sentiment]}>{labels[sentiment] || sentiment}</Tag> : '-';
      },
    },
    {
      title: t('touchpoints.duration') || 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration?: number) => (duration ? `${Math.round(duration / 60)} ${t('touchpoints.minutes') || 'min'}` : '-'),
    },
    {
      title: t('common.createTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('common.action') || 'Action',
      key: 'action',
      render: (_: any, record: Touchpoint) => (
        <Button type="link" danger onClick={() => openVoidModal(record)}>
          {t('touchpoints.void') || 'Void'}
        </Button>
      ),
    },
  ];

  const typeOptions = [
    { label: t('touchpoints.visit') || 'Visit', value: 'VISIT' },
    { label: t('touchpoints.call') || 'Call', value: 'CALL' },
    { label: t('touchpoints.message') || 'Message', value: 'MESSAGE' },
    { label: t('touchpoints.email') || 'Email', value: 'EMAIL' },
    { label: t('touchpoints.wechat') || 'WeChat', value: 'WECHAT' },
    { label: t('touchpoints.video') || 'Video', value: 'VIDEO' },
    { label: t('touchpoints.sms') || 'SMS', value: 'SMS' },
    { label: t('touchpoints.other') || 'Other', value: 'OTHER' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{t('menu.touchpoints')}</h1>
        <Space>
          <Button icon={<BarChartOutlined />} onClick={toggleAnalytics}>
            {t('touchpoints.analytics') || 'Analytics'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            {t('touchpoints.record')}
          </Button>
        </Space>
      </div>

      {showAnalytics && analytics && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title={t('touchpoints.totalTouchpoints') || 'Total Touchpoints'} value={analytics.total} />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('touchpoints.positive') || 'Positive'}
                value={analytics.sentimentDistribution.find((s) => s.sentiment === 'POSITIVE')?.count || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('touchpoints.neutral') || 'Neutral'}
                value={analytics.sentimentDistribution.find((s) => s.sentiment === 'NEUTRAL')?.count || 0}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('touchpoints.negative') || 'Negative'}
                value={analytics.sentimentDistribution.find((s) => s.sentiment === 'NEGATIVE')?.count || 0}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
          </Row>
          {analytics.counts.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4>{t('touchpoints.touchpointTrend') || 'Touchpoint Trend'}</h4>
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {analytics.counts.slice(-14).map((item) => (
                  <div key={item.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>{item.date}</span>
                    <span>
                      <Tag>{item.count}</Tag>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder={t('touchpoints.searchPatient') || 'Search patient'}
            style={{ width: 200 }}
            onChange={(e) => handleFilterChange('patientId', e.target.value)}
            allowClear
          />
          <RangePicker onChange={handleDateRangeChange} />
          <Select
            placeholder={t('common.type') || 'Type'}
            style={{ width: 150 }}
            allowClear
            options={typeOptions}
            onChange={(value) => handleFilterChange('type', value)}
          />
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => t('common.total', { count: total }) || `Total ${total}`,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({ ...prev, current: page, pageSize }));
          },
        }}
      />

      <TouchpointFormModal visible={isModalOpen} onOk={() => {
        setIsModalOpen(false);
        fetchData();
      }} onCancel={() => setIsModalOpen(false)} />

      <Modal
        title={t('touchpoints.void') || 'Void Touchpoint'}
        open={voidModalOpen}
        onOk={handleVoid}
        onCancel={() => {
          setVoidModalOpen(false);
          setVoidReason('');
          setSelectedTouchpoint(null);
        }}
        okText={t('common.confirm') || 'Confirm'}
        cancelText={t('common.cancel')}
      >
        <p>{t('touchpoints.voidWarning') || 'Are you sure you want to void this touchpoint? This action cannot be undone.'}</p>
        <Input.TextArea
          placeholder={t('touchpoints.voidReasonPlaceholder') || 'Enter void reason (required)'}
          rows={3}
          value={voidReason}
          onChange={(e) => setVoidReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
