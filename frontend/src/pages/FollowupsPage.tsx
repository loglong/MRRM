import { useState, useEffect, useCallback } from 'react';
import { Table, Space, Button, Select, Tabs, Tag, message, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { followupsApi, FollowupPlan, FollowupRecord, FollowupAnalytics } from '@/api/followups';
import FollowupPlanFormModal from './FollowupPlanFormModal';
import ExecuteFollowupModal from './ExecuteFollowupModal';
import dayjs from 'dayjs';

export default function FollowupsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'plans' | 'records'>('plans');
  const [plans, setPlans] = useState<FollowupPlan[]>([]);
  const [records, setRecords] = useState<FollowupRecord[]>([]);
  const [analytics, setAnalytics] = useState<FollowupAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number }>({ page: 1, limit: 20, total: 0 });
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FollowupRecord | null>(null);
  const [filters, setFilters] = useState<any>({});

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await followupsApi.listPlans({ page: pagination.page, limit: pagination.limit, ...filters });
      setPlans(result.data);
      setPagination(prev => ({ ...prev, total: result.pagination.total }));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, t]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await followupsApi.listRecords({ page: pagination.page, limit: pagination.limit, ...filters });
      setRecords(result.data);
      setPagination(prev => ({ ...prev, total: result.pagination.total }));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, t]);

  const loadAnalytics = useCallback(async () => {
    try {
      const result = await followupsApi.getCompletionRate();
      setAnalytics(result);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'plans') {
      loadPlans();
    } else {
      loadRecords();
    }
    loadAnalytics();
  }, [activeTab, loadPlans, loadRecords, loadAnalytics]);

  const handlePlanCreate = () => {
    setPlanModalVisible(true);
  };

  const handlePlanModalOk = () => {
    setPlanModalVisible(false);
    loadPlans();
    loadAnalytics();
  };

  const handlePausePlan = async (plan: FollowupPlan) => {
    try {
      await followupsApi.pausePlan(plan.id);
      message.success(t('common.success'));
      loadPlans();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleResumePlan = async (plan: FollowupPlan) => {
    try {
      await followupsApi.resumePlan(plan.id);
      message.success(t('common.success'));
      loadPlans();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleExecuteRecord = (record: FollowupRecord) => {
    setSelectedRecord(record);
    setExecuteModalVisible(true);
  };

  const handleExecuteModalOk = () => {
    setExecuteModalVisible(false);
    setSelectedRecord(null);
    loadRecords();
    loadAnalytics();
    loadPlans();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'blue', text: t('common.pending') || '待处理' },
      COMPLETED: { color: 'green', text: t('common.completed') || '已完成' },
      MISSED: { color: 'red', text: t('followups.missed') || '已错过' },
      CANCELLED: { color: 'gray', text: t('common.cancelled') || '已取消' },
      ACTIVE: { color: 'green', text: t('followups.active') || '进行中' },
      PAUSED: { color: 'orange', text: t('followups.paused') || '已暂停' },
      RESCHEDULED: { color: 'purple', text: t('followups.rescheduled') || '已重新安排' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      ROUTINE: { color: 'blue', text: t('followups.typeRoutine') || '常规' },
      POST_TREATMENT: { color: 'green', text: t('followups.typePostTreatment') || '治疗后' },
      PRE_APPOINTMENT: { color: 'purple', text: t('followups.typePreAppointment') || '预约前' },
      CUSTOM: { color: 'orange', text: t('followups.typeCustom') || '自定义' },
    };
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const planColumns = [
    { title: t('patients.patientName') || '患者', dataIndex: ['patient', 'name'], key: 'patient' },
    { title: t('followups.planName') || '计划名称', dataIndex: 'name', key: 'name' },
    { title: t('common.type'), dataIndex: 'type', key: 'type', render: (type: string) => getTypeTag(type) },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (status: string) => getStatusTag(status) },
    { title: t('followups.frequencyDays') || '频率(天)', dataIndex: 'frequencyDays', key: 'frequencyDays' },
    { title: t('followups.completion') || '完成率', key: 'completion', render: (_: any, record: FollowupPlan) => {
      if (!record.recordCount) return '-';
      const rate = record.recordCount > 0 ? Math.round((record.completedCount || 0) / record.recordCount * 100) : 0;
      return `${rate}%`;
    }},
    { title: t('followups.startDate') || '开始日期', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: FollowupPlan) => (
        <Space>
          {record.status === 'ACTIVE' ? (
            <Button size="small" icon={<PauseCircleOutlined />} onClick={() => handlePausePlan(record)}>
              {t('common.pause') || '暂停'}
            </Button>
          ) : record.status === 'PAUSED' ? (
            <Button size="small" icon={<PlayCircleOutlined />} onClick={() => handleResumePlan(record)}>
              {t('common.resume') || '恢复'}
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  const recordColumns = [
    { title: t('patients.patientName') || '患者', dataIndex: ['patient', 'name'], key: 'patient' },
    { title: t('followups.planName') || '计划', dataIndex: ['plan', 'name'], key: 'plan' },
    { title: t('followups.scheduled') || '计划时间', dataIndex: 'scheduledAt', key: 'scheduledAt', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (status: string) => getStatusTag(status) },
    { title: t('followups.outcome') || '结果', dataIndex: 'outcome', key: 'outcome' },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: FollowupRecord) => (
        record.status === 'PENDING' ? (
          <Button size="small" type="primary" onClick={() => handleExecuteRecord(record)}>
            {t('followups.execute') || '执行'}
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div>
      {/* Analytics Cards */}
      {analytics && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Card size="small">
              <Statistic title={t('followups.total') || '总数'} value={analytics.total} />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic title={t('common.completed')} value={analytics.completed} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic title={t('followups.missed')} value={analytics.missed} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic title={t('common.pending')} value={analytics.pending} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic title={t('followups.completionRate')} value={analytics.completionRate} suffix="%" valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as 'plans' | 'records');
          setPagination(prev => ({ ...prev, page: 1 }));
        }}
        tabBarExtraContent={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => activeTab === 'plans' ? loadPlans() : loadRecords()}>
              {t('common.refresh') || '刷新'}
            </Button>
            {activeTab === 'plans' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handlePlanCreate}>
                {t('followups.createPlan')}
              </Button>
            )}
          </Space>
        }
      >
        <Tabs.TabPane tab={t('followups.plans') || '随访计划'} key="plans">
          <Space style={{ marginBottom: 16 }}>
            <Select
              placeholder={t('common.status')}
              style={{ width: 120 }}
              allowClear
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Select.Option value="ACTIVE">{t('followups.active') || '进行中'}</Select.Option>
              <Select.Option value="PAUSED">{t('followups.paused') || '已暂停'}</Select.Option>
              <Select.Option value="COMPLETED">{t('common.completed')}</Select.Option>
              <Select.Option value="CANCELLED">{t('common.cancelled')}</Select.Option>
            </Select>
          </Space>
          <Table
            dataSource={plans}
            rowKey="id"
            columns={planColumns}
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: (page) => setPagination(prev => ({ ...prev, page })),
            }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('followups.records') || '随访记录'} key="records">
          <Space style={{ marginBottom: 16 }}>
            <Select
              placeholder={t('common.status')}
              style={{ width: 120 }}
              allowClear
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Select.Option value="PENDING">{t('common.pending')}</Select.Option>
              <Select.Option value="COMPLETED">{t('common.completed')}</Select.Option>
              <Select.Option value="MISSED">{t('followups.missed')}</Select.Option>
            </Select>
          </Space>
          <Table
            dataSource={records}
            rowKey="id"
            columns={recordColumns}
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: (page) => setPagination(prev => ({ ...prev, page })),
            }}
          />
        </Tabs.TabPane>
      </Tabs>

      <FollowupPlanFormModal
        visible={planModalVisible}
        onOk={handlePlanModalOk}
        onCancel={() => setPlanModalVisible(false)}
      />

      <ExecuteFollowupModal
        visible={executeModalVisible}
        record={selectedRecord}
        onOk={handleExecuteModalOk}
        onCancel={() => {
          setExecuteModalVisible(false);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
}
