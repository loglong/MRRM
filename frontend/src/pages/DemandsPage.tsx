import { useState, useEffect } from 'react';
import {
  Table, Tag, Space, Button, Input, Card, Select, Typography, message, Modal, Form, Timeline, Dropdown, DatePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, HistoryOutlined, CheckCircleOutlined, SettingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { patientsApi } from '@/api/patients';
import { pathsApi } from '@/api/paths';
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

// Column key definitions for custom field selection
const ALL_COLUMN_KEYS = [
  'patient', 'type', 'title', 'status', 'priority', 'source',
  'estimatedAmount', 'createdAt', 'createdBy', 'developmentManager',
  'preTreatmentStartDate', 'preTreatmentManager',
  'treatmentStartDate', 'treatmentManager', 'treatmentEndDate',
  'pathId', 'maintenanceManager', 'maintenancePlanId', 'demandEndDate',
  'action'
] as const;

type ColumnKey = typeof ALL_COLUMN_KEYS[number];

const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
  'patient', 'type', 'title', 'status', 'priority', 'createdAt', 'action'
];

interface DemandFormModalProps {
  visible: boolean;
  demand: Demand | null;
  patients: { id: string; name: string; phone: string | null }[];
  paths: { id: string; name: string }[];
  onOk: () => void;
  onCancel: () => void;
}

function DemandFormModal({ visible, demand, patients, paths, onOk, onCancel }: DemandFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && demand) {
      form.setFieldsValue({
        ...demand,
        patientId: demand.patientId,
        preTreatmentStartDate: demand.preTreatmentStartDate ? dayjs(demand.preTreatmentStartDate) : null,
        treatmentStartDate: demand.treatmentStartDate ? dayjs(demand.treatmentStartDate) : null,
        treatmentEndDate: demand.treatmentEndDate ? dayjs(demand.treatmentEndDate) : null,
        demandEndDate: demand.demandEndDate ? dayjs(demand.demandEndDate) : null,
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
          developmentManager: values.developmentManager,
          preTreatmentStartDate: values.preTreatmentStartDate?.toISOString(),
          preTreatmentManager: values.preTreatmentManager,
          treatmentStartDate: values.treatmentStartDate?.toISOString(),
          treatmentManager: values.treatmentManager,
          treatmentEndDate: values.treatmentEndDate?.toISOString(),
          pathId: values.pathId,
          maintenanceManager: values.maintenanceManager,
          maintenancePlanId: values.maintenancePlanId,
          demandEndDate: values.demandEndDate?.toISOString(),
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
          developmentManager: values.developmentManager,
          preTreatmentStartDate: values.preTreatmentStartDate?.toISOString(),
          preTreatmentManager: values.preTreatmentManager,
          treatmentStartDate: values.treatmentStartDate?.toISOString(),
          treatmentManager: values.treatmentManager,
          treatmentEndDate: values.treatmentEndDate?.toISOString(),
          pathId: values.pathId,
          maintenanceManager: values.maintenanceManager,
          maintenancePlanId: values.maintenancePlanId,
          demandEndDate: values.demandEndDate?.toISOString(),
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

        {/* 开发期 */}
        <div style={{ fontWeight: 500, margin: '16px 0 8px', color: '#1890ff' }}>{t('demands.developmentPhase') || '开发期'}</div>
        <Form.Item name="developmentManager" label={t('demands.developmentManager')}>
          <Input placeholder={t('demands.developmentManagerPlaceholder') || '输入开发期管理人（前台）'} />
        </Form.Item>

        {/* 治疗前期 */}
        <div style={{ fontWeight: 500, margin: '16px 0 8px', color: '#52c41a' }}>{t('demands.preTreatmentPhase') || '治疗前期'}</div>
        <Space style={{ display: 'flex' }} align="start">
          <Form.Item name="preTreatmentStartDate" label={t('demands.preTreatmentStartDate')}>
            <DatePicker placeholder={t('demands.selectDate') || '选择日期'} />
          </Form.Item>
          <Form.Item name="preTreatmentManager" label={t('demands.preTreatmentManager')}>
            <Input placeholder={t('demands.preTreatmentManagerPlaceholder') || '输入治疗前期管理人（护士）'} />
          </Form.Item>
        </Space>

        {/* 治疗期 */}
        <div style={{ fontWeight: 500, margin: '16px 0 8px', color: '#fa8c16' }}>{t('demands.treatmentPhase') || '治疗期'}</div>
        <Space style={{ display: 'flex' }} align="start">
          <Form.Item name="treatmentStartDate" label={t('demands.treatmentStartDate')}>
            <DatePicker placeholder={t('demands.selectDate') || '选择日期'} />
          </Form.Item>
          <Form.Item name="treatmentManager" label={t('demands.treatmentManager')}>
            <Input placeholder={t('demands.treatmentManagerPlaceholder') || '输入治疗期管理人（护士）'} />
          </Form.Item>
          <Form.Item name="treatmentEndDate" label={t('demands.treatmentEndDate')}>
            <DatePicker placeholder={t('demands.selectDate') || '选择日期'} />
          </Form.Item>
        </Space>

        {/* 技术路径 */}
        <div style={{ fontWeight: 500, margin: '16px 0 8px', color: '#722ed1' }}>{t('demands.pathInfo') || '技术路径'}</div>
        <Space style={{ display: 'flex' }} align="start">
          <Form.Item name="pathId" label={t('demands.pathId')} style={{ width: 200 }}>
            <Select allowClear placeholder={t('demands.selectPath') || '选择技术路径'} showSearch>
              {paths.map((p) => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="maintenanceManager" label={t('demands.maintenanceManager')}>
            <Input placeholder={t('demands.maintenanceManagerPlaceholder') || '输入维护人（护士）'} />
          </Form.Item>
          <Form.Item name="maintenancePlanId" label={t('demands.maintenancePlanId')}>
            <Input placeholder={t('demands.maintenancePlanIdPlaceholder') || '输入维护方案ID'} />
          </Form.Item>
        </Space>

        {/* 需求结束 */}
        <Form.Item name="demandEndDate" label={t('demands.demandEndDate')}>
          <DatePicker placeholder={t('demands.selectDate') || '选择日期'} />
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

  // Custom column visibility state
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(() => {
    const saved = localStorage.getItem('demand_visible_columns');
    return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
  });
  const [paths, setPaths] = useState<{ id: string; name: string }[]>([]);

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

  const fetchPaths = async () => {
    try {
      const response = await pathsApi.list({ limit: 100, status: 'ACTIVE' });
      setPaths(response.data.map((p: any) => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error('Failed to fetch paths', error);
    }
  };

  const toggleColumn = (key: ColumnKey) => {
    const newVisible = visibleColumns.includes(key)
      ? visibleColumns.filter((k) => k !== key)
      : [...visibleColumns, key];
    setVisibleColumns(newVisible);
    localStorage.setItem('demand_visible_columns', JSON.stringify(newVisible));
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
    fetchPaths();
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

  // Build columns based on visible columns
  const columns: ColumnsType<Demand> = [
    visibleColumns.includes('patient') && {
      title: t('patients.patientName') || 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient',
      render: (_: any, record: Demand) => (
        <Text strong>{record.patient?.name || '-'}</Text>
      ),
    },
    visibleColumns.includes('type') && {
      title: t('demands.demandType') || 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: DemandType) => (
        <Tag>{demandTypeLabels[type] || type}</Tag>
      ),
    },
    visibleColumns.includes('title') && {
      title: t('common.name') || 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text>{title}</Text>,
    },
    visibleColumns.includes('status') && {
      title: t('common.status') || 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: DemandStatus) => (
        <Tag color={statusColors[status]}>{demandStatusLabels[status]}</Tag>
      ),
    },
    visibleColumns.includes('priority') && {
      title: t('demands.priority') || 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: DemandPriority) => (
        <Tag color={priorityColors[priority]}>{demandPriorityLabels[priority]}</Tag>
      ),
    },
    visibleColumns.includes('source') && {
      title: t('demands.source') || 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => demandSourceLabels[source as keyof typeof demandSourceLabels] || source,
    },
    visibleColumns.includes('estimatedAmount') && {
      title: t('demands.estimatedAmount') || 'Est. Amount',
      dataIndex: 'estimatedAmount',
      key: 'estimatedAmount',
      render: (amount: number | null) => amount ? `¥${amount.toLocaleString()}` : '-',
    },
    visibleColumns.includes('createdAt') && {
      title: t('common.createTime') || 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    visibleColumns.includes('createdBy') && {
      title: t('demands.createdBy') || 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (val: string | null) => val || '-',
    },
    visibleColumns.includes('developmentManager') && {
      title: t('demands.developmentManager') || 'Dev Manager',
      dataIndex: 'developmentManager',
      key: 'developmentManager',
      render: (val: string | null) => val || '-',
    },
    visibleColumns.includes('preTreatmentStartDate') && {
      title: t('demands.preTreatmentStartDate') || 'Pre-Tx Start',
      dataIndex: 'preTreatmentStartDate',
      key: 'preTreatmentStartDate',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : '-',
    },
    visibleColumns.includes('preTreatmentManager') && {
      title: t('demands.preTreatmentManager') || 'Pre-Tx Manager',
      dataIndex: 'preTreatmentManager',
      key: 'preTreatmentManager',
      render: (val: string | null) => val || '-',
    },
    visibleColumns.includes('treatmentStartDate') && {
      title: t('demands.treatmentStartDate') || 'Tx Start',
      dataIndex: 'treatmentStartDate',
      key: 'treatmentStartDate',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : '-',
    },
    visibleColumns.includes('treatmentManager') && {
      title: t('demands.treatmentManager') || 'Tx Manager',
      dataIndex: 'treatmentManager',
      key: 'treatmentManager',
      render: (val: string | null) => val || '-',
    },
    visibleColumns.includes('treatmentEndDate') && {
      title: t('demands.treatmentEndDate') || 'Tx End',
      dataIndex: 'treatmentEndDate',
      key: 'treatmentEndDate',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : '-',
    },
    visibleColumns.includes('pathId') && {
      title: t('demands.pathId') || 'Path',
      dataIndex: ['path', 'name'],
      key: 'pathId',
      render: (_: any, record: Demand) => record.path?.name || '-',
    },
    visibleColumns.includes('maintenanceManager') && {
      title: t('demands.maintenanceManager') || 'Maint. Manager',
      dataIndex: 'maintenanceManager',
      key: 'maintenanceManager',
      render: (val: string | null) => val || '-',
    },
    visibleColumns.includes('maintenancePlanId') && {
      title: t('demands.maintenancePlanId') || 'Maint. Plan',
      dataIndex: 'maintenancePlanId',
      key: 'maintenancePlanId',
      render: (val: string | null) => val || '-',
    },
    visibleColumns.includes('demandEndDate') && {
      title: t('demands.demandEndDate') || 'End Date',
      dataIndex: 'demandEndDate',
      key: 'demandEndDate',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : '-',
    },
    visibleColumns.includes('action') && {
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
  ].filter(Boolean) as ColumnsType<Demand>;

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
        <Space>
          <Dropdown
            menu={{
              selectable: true,
              selectedKeys: visibleColumns,
              onSelect: ({ key }) => toggleColumn(key as ColumnKey),
              items: [
                { key: 'patient', label: t('patients.patientName') || 'Patient' },
                { key: 'type', label: t('demands.demandType') || 'Type' },
                { key: 'title', label: t('common.name') || 'Title' },
                { key: 'status', label: t('common.status') || 'Status' },
                { key: 'priority', label: t('demands.priority') || 'Priority' },
                { key: 'source', label: t('demands.source') || 'Source' },
                { key: 'estimatedAmount', label: t('demands.estimatedAmount') || 'Est. Amount' },
                { key: 'createdAt', label: t('common.createTime') || 'Created' },
                { key: 'createdBy', label: t('demands.createdBy') || 'Created By' },
                { key: 'developmentManager', label: t('demands.developmentManager') || 'Dev Manager' },
                { key: 'preTreatmentStartDate', label: t('demands.preTreatmentStartDate') || 'Pre-Tx Start' },
                { key: 'preTreatmentManager', label: t('demands.preTreatmentManager') || 'Pre-Tx Manager' },
                { key: 'treatmentStartDate', label: t('demands.treatmentStartDate') || 'Tx Start' },
                { key: 'treatmentManager', label: t('demands.treatmentManager') || 'Tx Manager' },
                { key: 'treatmentEndDate', label: t('demands.treatmentEndDate') || 'Tx End' },
                { key: 'pathId', label: t('demands.pathId') || 'Path' },
                { key: 'maintenanceManager', label: t('demands.maintenanceManager') || 'Maint. Manager' },
                { key: 'maintenancePlanId', label: t('demands.maintenancePlanId') || 'Maint. Plan' },
                { key: 'demandEndDate', label: t('demands.demandEndDate') || 'End Date' },
              ],
            }}
            trigger={['click']}
          >
            <Button icon={<SettingOutlined />}>
              {t('demands.customizeColumns') || 'Customize Columns'}
            </Button>
          </Dropdown>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('demands.createDemand')}
          </Button>
        </Space>
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
        paths={paths}
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
