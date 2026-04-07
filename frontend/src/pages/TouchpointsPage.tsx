import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Space, Button, Input, Select, DatePicker, Modal, message, Card, Row, Col, Statistic, Popconfirm } from 'antd';
import { PlusOutlined, BarChartOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [editingTouchpoint, setEditingTouchpoint] = useState<Touchpoint | null>(null);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<Touchpoint | null>(null);
  const [previewTouchpoint, setPreviewTouchpoint] = useState<Touchpoint | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
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

  const openEditModal = (touchpoint: Touchpoint) => {
    setEditingTouchpoint(touchpoint);
    setIsModalOpen(true);
  };

  const openPreviewModal = (touchpoint: Touchpoint) => {
    setPreviewTouchpoint(touchpoint);
    setPreviewModalOpen(true);
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
      title: t('touchpoints.feedback') || 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
      render: (feedback?: string) => {
        const colors: Record<string, string> = {
          SATISFIED: 'green',
          NEUTRAL: 'default',
          DISSATISFIED: 'red',
        };
        const labels: Record<string, string> = {
          SATISFIED: t('touchpoints.satisfied') || 'Satisfied',
          NEUTRAL: t('touchpoints.neutral') || 'Neutral',
          DISSATISFIED: t('touchpoints.dissatisfied') || 'Dissatisfied',
        };
        return feedback ? <Tag color={colors[feedback]}>{labels[feedback] || feedback}</Tag> : '-';
      },
    },
    {
      title: t('touchpoints.satisfactionScore') || 'Score',
      dataIndex: 'satisfactionScore',
      key: 'satisfactionScore',
      render: (score?: number) => score ? <span style={{ color: score >= 7 ? 'green' : score >= 4 ? 'orange' : 'red' }}>{score}</span> : '-',
    },
    {
      title: t('touchpoints.nextPlan') || 'Next Plan',
      dataIndex: 'nextPlan',
      key: 'nextPlan',
      render: (plan?: string) => plan || '-',
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
      width: 120,
      render: (_: any, record: Touchpoint) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} title={t('common.preview')} onClick={() => openPreviewModal(record)} />
          <Button type="text" icon={<EditOutlined />} title={t('common.edit')} onClick={() => openEditModal(record)} />
          <Popconfirm
            title={t('touchpoints.voidWarning')}
            onConfirm={() => openVoidModal(record)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title={t('touchpoints.void')} />
          </Popconfirm>
        </Space>
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

      <TouchpointFormModal visible={isModalOpen} editingTouchpoint={editingTouchpoint} onOk={() => {
        setIsModalOpen(false);
        setEditingTouchpoint(null);
        fetchData();
      }} onCancel={() => {
        setIsModalOpen(false);
        setEditingTouchpoint(null);
      }} />

      <Modal
        title={t('common.preview') || 'Preview'}
        open={previewModalOpen}
        onCancel={() => {
          setPreviewModalOpen(false);
          setPreviewTouchpoint(null);
        }}
        footer={null}
        width={600}
      >
        {previewTouchpoint && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('patients.patientName')}:</span>
              <span>{previewTouchpoint.patient?.name || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('common.type')}:</span>
              <span>{previewTouchpoint.type}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('common.name')}:</span>
              <span>{previewTouchpoint.title}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('touchpoints.channel')}:</span>
              <span>{previewTouchpoint.channel || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('touchpoints.feedback')}:</span>
              <span>{previewTouchpoint.feedback || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('touchpoints.satisfactionScore')}:</span>
              <span>{previewTouchpoint.satisfactionScore || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('touchpoints.durationMinutes')}:</span>
              <span>{previewTouchpoint.duration ? `${Math.round(previewTouchpoint.duration / 60)} ${t('touchpoints.minutes')}` : '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('touchpoints.outcome')}:</span>
              <span>{previewTouchpoint.outcome || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('touchpoints.nextPlan')}:</span>
              <span>{previewTouchpoint.nextPlan || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('touchpoints.nextPlanTime')}:</span>
              <span>{previewTouchpoint.nextPlanTime ? dayjs(previewTouchpoint.nextPlanTime).format('YYYY-MM-DD HH:mm') : '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t('common.createTime')}:</span>
              <span>{dayjs(previewTouchpoint.createdAt).format('YYYY-MM-DD HH:mm')}</span>
            </div>
          </div>
        )}
      </Modal>

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
