import { useState, useEffect } from 'react';
import {
  Table, Tag, Space, Button, Input, Card, Select, Typography, message, Modal, Form, Timeline
} from 'antd';
import {
  PlusOutlined, EditOutlined, HistoryOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { patientsApi } from '@/api/patients';
import {
  demandsApi,
  Demand,
  CreateDemandDto,
  UpdateDemandDto,
  ChangeStatusDto,
  DemandStatus,
  DemandType,
  DemandPriority,
  DemandStatusHistory,
  DemandFilters,
  demandStatusLabels,
  demandTypeLabels,
  demandPriorityLabels,
  demandSourceLabels,
  validStatusTransitions,
} from '@/api/demands';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const statusColors: Record<string, string> = {
  OPEN: 'blue',
  IN_PROGRESS: 'processing',
  PENDING: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'default',
  LOST: 'error',
};

const priorityColors: Record<string, string> = {
  LOW: 'default',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
};

interface DemandFormModalProps {
  visible: boolean;
  demand: Demand | null;
  patients: { id: string; name: string; phone: string | null }[];
  onOk: () => void;
  onCancel: () => void;
}

function DemandFormModal({ visible, demand, patients, onOk, onCancel }: DemandFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && demand) {
      form.setFieldsValue({
        ...demand,
        patientId: demand.patientId,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, demand, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (demand) {
        const data: UpdateDemandDto = {
          title: values.title,
          description: values.description,
          priority: values.priority,
          source: values.source,
          estimatedAmount: values.estimatedAmount,
        };
        await demandsApi.update(demand.id, data);
        message.success(t('common.success'));
      } else {
        const data: CreateDemandDto = {
          patientId: values.patientId,
          type: values.type,
          title: values.title,
          description: values.description,
          priority: values.priority,
          source: values.source,
          estimatedAmount: values.estimatedAmount,
        };
        await demandsApi.create(data);
        message.success(t('common.success'));
      }
      onOk();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={demand ? t('demands.editDemand') : t('demands.createDemand')}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      confirmLoading={loading}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {!demand && (
          <Form.Item
            name="patientId"
            label={t('patients.patientName')}
            rules={[{ required: true, message: t('patients.selectPatient') || '请选择患者' }]}
          >
            <Select
              showSearch
              placeholder={t('patients.selectPatient') || '选择患者'}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as any)?.props?.children?.props?.children?.toLowerCase()?.includes(input.toLowerCase()) ?? false
              }
            >
              {patients.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} {p.phone && `(${p.phone})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="type"
          label={t('demands.demandType')}
          rules={[{ required: true, message: t('demands.selectType') || '请选择需求类型' }]}
        >
          <Select placeholder={t('demands.selectType') || '选择需求类型'}>
            {Object.entries(demandTypeLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label={t('common.name')}
          rules={[{ required: true, message: t('demands.enterTitle') || '请输入需求标题' }]}
        >
          <Input placeholder={t('demands.enterTitle') || '输入需求标题'} />
        </Form.Item>

        <Form.Item name="description" label={t('common.description')}>
          <TextArea rows={3} placeholder={t('demands.enterDesc') || '输入需求描述'} />
        </Form.Item>

        <Form.Item name="priority" label={t('demands.priority')}>
          <Select allowClear placeholder={t('demands.selectPriority') || '选择优先级'}>
            {Object.entries(demandPriorityLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                <Tag color={priorityColors[value]}>{label}</Tag>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="source" label={t('demands.source')}>
          <Select allowClear placeholder={t('demands.selectSource') || '选择来源'}>
            {Object.entries(demandSourceLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="estimatedAmount" label={t('demands.estimatedAmount')}>
          <Input type="number" placeholder={t('demands.enterAmount') || '输入预估金额'} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

interface StatusChangeModalProps {
  visible: boolean;
  demand: Demand | null;
  onOk: () => void;
  onCancel: () => void;
}

function StatusChangeModal({ visible, demand, onOk, onCancel }: StatusChangeModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    if (!demand) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const data: ChangeStatusDto = {
        status: values.status,
        notes: values.notes,
      };
      await demandsApi.changeStatus(demand.id, data);
      message.success(t('common.success'));
      onOk();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = demand?.status as DemandStatus;
  const availableTransitions = currentStatus ? validStatusTransitions[currentStatus] || [] : [];

  return (
    <Modal
      title={t('demands.changeStatus')}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="status"
          label={t('common.status')}
          rules={[{ required: true, message: t('demands.selectStatus') || '请选择状态' }]}
        >
          <Select placeholder={t('demands.selectStatus') || '选择新状态'}>
            {availableTransitions.map((status) => (
              <Select.Option key={status} value={status}>
                <Tag color={statusColors[status]}>{demandStatusLabels[status]}</Tag>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="notes" label={t('demands.statusNotes')}>
          <TextArea rows={3} placeholder={t('demands.enterNotes') || '输入备注（可选）'} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

interface HistoryModalProps {
  visible: boolean;
  demandId: string | null;
  onCancel: () => void;
}

function HistoryModal({ visible, demandId, onCancel }: HistoryModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<DemandStatusHistory[]>([]);

  useEffect(() => {
    if (visible && demandId) {
      fetchHistory();
    }
  }, [visible, demandId]);

  const fetchHistory = async () => {
    if (!demandId) return;
    setLoading(true);
    try {
      const data = await demandsApi.getStatusHistory(demandId);
      setHistory(data);
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('demands.statusHistory')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <Text>{t('common.loading')}</Text>
        ) : history.length === 0 ? (
          <Text type="secondary">{t('common.noData')}</Text>
        ) : (
          <Timeline
            items={history.map((item, index) => ({
              color: index === 0 ? 'blue' : 'gray',
              children: (
                <div>
                  <Space>
                    {item.fromStatus && (
                      <Tag color={statusColors[item.fromStatus]}>{demandStatusLabels[item.fromStatus as DemandStatus]}</Tag>
                    )}
                    <span>→</span>
                    <Tag color={statusColors[item.toStatus]}>{demandStatusLabels[item.toStatus]}</Tag>
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    {item.notes && (
                      <div style={{ marginTop: 4 }}>
                        <Text>{item.notes}</Text>
                      </div>
                    )}
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </div>
    </Modal>
  );
}

export default function DemandsPage() {
  const { t } = useTranslation();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }>({ total: 0, byStatus: {}, byType: {}, byPriority: {} });

  // Modals
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [historyDemandId, setHistoryDemandId] = useState<string | null>(null);
  const [patients, setPatients] = useState<{ id: string; name: string; phone: string | null }[]>([]);

  const fetchPatients = async () => {
    try {
      const response = await patientsApi.list({ limit: 100 });
      setPatients(response.data.map((p) => ({ id: p.id, name: p.name, phone: p.phone })));
    } catch (error) {
      console.error('Failed to fetch patients', error);
    }
  };

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const filters: DemandFilters = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter as DemandStatus | undefined,
        type: typeFilter as DemandType | undefined,
        priority: priorityFilter as DemandPriority | undefined,
      };
      if (searchText) {
        // Backend doesn't have search, filter client-side for now
      }
      const response = await demandsApi.list(filters);
      setDemands(response.data);
      setPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await demandsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchDemands();
  }, [pagination.current, pagination.pageSize, statusFilter, typeFilter, priorityFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingDemand(null);
    setFormModalVisible(true);
  };

  const handleEdit = (demand: Demand) => {
    setEditingDemand(demand);
    setFormModalVisible(true);
  };

  const handleStatusChange = (demand: Demand) => {
    setEditingDemand(demand);
    setStatusModalVisible(true);
  };

  const handleViewHistory = (demand: Demand) => {
    setHistoryDemandId(demand.id);
    setHistoryModalVisible(true);
  };

  const handleModalOk = () => {
    setFormModalVisible(false);
    setStatusModalVisible(false);
    setEditingDemand(null);
    fetchDemands();
    fetchStats();
  };

  const columns: ColumnsType<Demand> = [
    {
      title: t('patients.patientName') || 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient',
      render: (_: any, record: Demand) => (
        <Text strong>{record.patient?.name || '-'}</Text>
      ),
    },
    {
      title: t('demands.demandType') || 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: DemandType) => (
        <Tag>{demandTypeLabels[type] || type}</Tag>
      ),
    },
    {
      title: t('common.name') || 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text>{title}</Text>,
    },
    {
      title: t('common.status') || 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: DemandStatus) => (
        <Tag color={statusColors[status]}>{demandStatusLabels[status]}</Tag>
      ),
    },
    {
      title: t('demands.priority') || 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: DemandPriority) => (
        <Tag color={priorityColors[priority]}>{demandPriorityLabels[priority]}</Tag>
      ),
    },
    {
      title: t('common.createTime') || 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('common.actions') || 'Action',
      key: 'action',
      width: 200,
      render: (_: any, record: Demand) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
          />
          <Button
            type="text"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleStatusChange(record)}
            disabled={validStatusTransitions[record.status as DemandStatus]?.length === 0}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  // Filter demands client-side for search
  const filteredDemands = searchText
    ? demands.filter(
        (d) =>
          d.title.toLowerCase().includes(searchText.toLowerCase()) ||
          d.patient?.name?.toLowerCase().includes(searchText.toLowerCase())
      )
    : demands;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>{t('demands.title')}</Title>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <Card size="small" style={{ flex: '1 1 150px', minWidth: 150 }}>
          <Text type="secondary">{t('common.total')}</Text>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.total}</div>
        </Card>
        <Card size="small" style={{ flex: '1 1 150px', minWidth: 150 }}>
          <Text type="secondary">{demandStatusLabels.OPEN}</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: statusColors.OPEN }}>{stats.byStatus.OPEN || 0}</div>
        </Card>
        <Card size="small" style={{ flex: '1 1 150px', minWidth: 150 }}>
          <Text type="secondary">{demandStatusLabels.IN_PROGRESS}</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: statusColors.IN_PROGRESS }}>{stats.byStatus.IN_PROGRESS || 0}</div>
        </Card>
        <Card size="small" style={{ flex: '1 1 150px', minWidth: 150 }}>
          <Text type="secondary">{demandStatusLabels.FULFILLED}</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: statusColors.FULFILLED }}>{stats.byStatus.FULFILLED || 0}</div>
        </Card>
        <Card size="small" style={{ flex: '1 1 150px', minWidth: 150 }}>
          <Text type="secondary">{demandStatusLabels.PENDING}</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: statusColors.PENDING }}>{stats.byStatus.PENDING || 0}</div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Space wrap>
          <Search
            placeholder={t('demands.searchPlaceholder') || 'Search demands'}
            onSearch={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder={t('demands.filterByStatus') || 'Filter by status'}
            allowClear
            style={{ width: 140 }}
            onChange={(value) => {
              setStatusFilter(value);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
          >
            {Object.entries(demandStatusLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                <Tag color={statusColors[value]}>{label}</Tag>
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder={t('demands.filterByType') || 'Filter by type'}
            allowClear
            style={{ width: 120 }}
            onChange={(value) => {
              setTypeFilter(value);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
          >
            {Object.entries(demandTypeLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder={t('demands.filterByPriority') || 'Filter by priority'}
            allowClear
            style={{ width: 120 }}
            onChange={(value) => {
              setPriorityFilter(value);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
          >
            {Object.entries(demandPriorityLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                <Tag color={priorityColors[value]}>{label}</Tag>
              </Select.Option>
            ))}
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('demands.createDemand')}
        </Button>
      </div>

      {/* Demands Table */}
      <Table
        columns={columns}
        dataSource={filteredDemands}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `${t('common.total') || 'Total'} ${total}`,
        }}
        onChange={handleTableChange}
      />

      {/* Modals */}
      <DemandFormModal
        visible={formModalVisible}
        demand={editingDemand}
        patients={patients}
        onOk={handleModalOk}
        onCancel={() => {
          setFormModalVisible(false);
          setEditingDemand(null);
        }}
      />

      <StatusChangeModal
        visible={statusModalVisible}
        demand={editingDemand}
        onOk={handleModalOk}
        onCancel={() => {
          setStatusModalVisible(false);
          setEditingDemand(null);
        }}
      />

      <HistoryModal
        visible={historyModalVisible}
        demandId={historyDemandId}
        onCancel={() => {
          setHistoryModalVisible(false);
          setHistoryDemandId(null);
        }}
      />
    </div>
  );
}
