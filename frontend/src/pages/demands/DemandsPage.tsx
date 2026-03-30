import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  Demand,
  DemandFilters,
  demandsApi,
  demandStatusLabels,
  demandTypeLabels,
  demandPriorityLabels,
  demandSourceLabels,
  DemandStatus,
  DemandType,
  DemandPriority,
  DemandSource,
} from '@/api/demands';
import { patientsApi, Patient } from '@/api/patients';
import DemandFormModal from './DemandFormModal';
import DemandDetailModal from './DemandDetailModal';
import dayjs from 'dayjs';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const statusColors: Record<DemandStatus, string> = {
  OPEN: 'blue',
  IN_PROGRESS: 'processing',
  PENDING: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'default',
  LOST: 'error',
};

export default function DemandsPage() {
  const { t } = useTranslation();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState<DemandFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Modals
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);

  const loadDemands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await demandsApi.list({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setDemands(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error('Failed to load demands:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadDemands();
  }, [loadDemands]);

  const searchPatients = async (query: string) => {
    try {
      const results = await patientsApi.search(query || '', 'all');
      setPatients(results);
    } catch (error) {
      console.error('Failed to search patients:', error);
    }
  };

  useEffect(() => {
    searchPatients('');
  }, []);

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });
  };

  const handleFilterChange = (key: keyof DemandFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        dateFrom: dates[0].toISOString(),
        dateTo: dates[1].toISOString(),
      }));
    } else {
      setFilters((prev) => {
        const { dateFrom, dateTo, ...rest } = prev;
        return rest;
      });
    }
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const resetFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleViewDetail = (demand: Demand) => {
    setSelectedDemandId(demand.id);
    setSelectedDemand(demand);
    setDetailModalVisible(true);
  };

  const handleEdit = (demand: Demand) => {
    setDetailModalVisible(false);
    setSelectedDemand(demand);
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedDemand(null);
    setFormModalVisible(true);
  };

  const columns = [
    {
      title: t('demands.patient') || 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patientName',
      width: 120,
      render: (_: any, record: Demand) => record.patient?.name || '-',
    },
    {
      title: t('demands.type') || 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: DemandType) => demandTypeLabels[type],
    },
    {
      title: t('demands.title') || 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('demands.priority') || 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: DemandPriority) => (
        <Tag color={priority === 'URGENT' ? 'red' : priority === 'HIGH' ? 'orange' : 'default'}>
          {demandPriorityLabels[priority]}
        </Tag>
      ),
    },
    {
      title: t('common.status') || 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: DemandStatus) => (
        <Tag color={statusColors[status]}>{demandStatusLabels[status]}</Tag>
      ),
    },
    {
      title: t('demands.source') || 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (source: DemandSource) => demandSourceLabels[source],
    },
    {
      title: t('demands.createdAt') || 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('common.actions') || 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: Demand) => (
        <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
          {t('common.view')}
        </Button>
      ),
    },
  ];

  const patientOptions = patients.map((p) => ({
    label: `${p.name} ${p.phone ? `(${p.phone})` : ''}`,
    value: p.id,
  }));

  const statusOptions = Object.entries(demandStatusLabels).map(([value, label]) => ({
    label,
    value,
  }));

  const typeOptions = Object.entries(demandTypeLabels).map(([value, label]) => ({
    label,
    value,
  }));

  const priorityOptions = Object.entries(demandPriorityLabels).map(([value, label]) => ({
    label,
    value,
  }));

  const sourceOptions = Object.entries(demandSourceLabels).map(([value, label]) => ({
    label,
    value,
  }));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Text strong style={{ fontSize: 18 }}>
          {t('demands.title') || 'Demand Management'}
        </Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {t('demands.addDemand') || 'Add Demand'}
        </Button>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space>
            <Button
              icon={<SearchOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {t('common.filter') || 'Filter'}
            </Button>
            {(filters.patientId ||
              filters.status ||
              filters.type ||
              filters.priority ||
              filters.source ||
              filters.dateFrom) && (
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                {t('common.reset') || 'Reset'}
              </Button>
            )}
          </Space>

          {showFilters && (
            <Row gutter={16}>
              <Col span={6}>
                <Select
                  allowClear
                  showSearch
                  placeholder={t('demands.selectPatient') || 'Select patient'}
                  options={patientOptions}
                  value={filters.patientId}
                  onChange={(value) => handleFilterChange('patientId', value)}
                  onSearch={(value) => searchPatients(value)}
                  filterOption={false}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={4}>
                <Select
                  allowClear
                  placeholder={t('common.status') || 'Status'}
                  options={statusOptions}
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={4}>
                <Select
                  allowClear
                  placeholder={t('demands.type') || 'Type'}
                  options={typeOptions}
                  value={filters.type}
                  onChange={(value) => handleFilterChange('type', value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={4}>
                <Select
                  allowClear
                  placeholder={t('demands.priority') || 'Priority'}
                  options={priorityOptions}
                  value={filters.priority}
                  onChange={(value) => handleFilterChange('priority', value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={4}>
                <Select
                  allowClear
                  placeholder={t('demands.source') || 'Source'}
                  options={sourceOptions}
                  value={filters.source}
                  onChange={(value) => handleFilterChange('source', value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={6}>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={handleDateRangeChange}
                />
              </Col>
            </Row>
          )}
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={demands}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => t('common.total', { count: total }) || `Total ${total}`,
        }}
        onChange={handleTableChange}
        locale={{
          emptyText: (
            <div style={{ padding: 40 }}>
              <Text type="secondary">{t('demands.empty') || 'No demands found'}</Text>
              <br />
              <Button type="link" onClick={handleCreate}>
                {t('demands.addFirst') || 'Add your first demand'}
              </Button>
            </div>
          ),
        }}
      />

      <DemandFormModal
        visible={formModalVisible}
        demand={selectedDemand}
        onOk={() => {
          setFormModalVisible(false);
          loadDemands();
        }}
        onCancel={() => {
          setFormModalVisible(false);
          setSelectedDemand(null);
        }}
      />

      <DemandDetailModal
        visible={detailModalVisible}
        demandId={selectedDemandId}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedDemandId(null);
          setSelectedDemand(null);
        }}
        onEdit={handleEdit}
        onRefresh={loadDemands}
      />
    </div>
  );
}
