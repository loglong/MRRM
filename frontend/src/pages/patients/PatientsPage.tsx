import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Card, Select, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { patientsApi, Patient } from '@/api/patients';
import PatientFormModal from './PatientFormModal';
import { useMobile } from '@/hooks/useMobile';
import MobilePatientList from '@/components/mobile/MobilePatientList';

const { Title, Text } = Typography;
const { Search } = Input;

const tierColors: Record<string, string> = {
  HIGH_VALUE: 'gold',
  REGULAR: 'default',
  LOST_RISK: 'red',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  CHURNED: 'red',
  DECEASED: 'default',
};

export default function PatientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [tierFilter, setTierFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({ total: 0, byTier: { HIGH_VALUE: 0, REGULAR: 0, LOST_RISK: 0 } });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const tierLabels: Record<string, string> = {
    HIGH_VALUE: t('patients.highValue') || '高价值',
    REGULAR: t('patients.regular') || '普通',
    LOST_RISK: t('patients.lostRisk') || '流失风险',
  };

  const genderLabels: Record<string, string> = {
    MALE: t('patients.male') || '男',
    FEMALE: t('patients.female') || '女',
    OTHER: t('patients.other') || '其他',
    UNKNOWN: t('patients.unknown') || '未知',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: t('patients.active') || '活跃',
    INACTIVE: t('patients.inactive') || '非活跃',
    CHURNED: t('patients.churned') || '已流失',
    DECEASED: t('patients.deceased') || '已故',
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientsApi.list({
        page: pagination.current,
        limit: pagination.pageSize,
        tier: tierFilter,
        search: searchText || undefined,
      });
      setPatients(response.data);
      setPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch (error) {
      message.error(t('common.error') || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await patientsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [pagination.current, pagination.pageSize, tierFilter, searchText]);

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

  const handleTierChange = (value: string | undefined) => {
    setTierFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingPatient(null);
    setModalVisible(true);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await patientsApi.delete(id);
      message.success(t('common.success') || 'Patient deleted successfully');
      fetchPatients();
      fetchStats();
    } catch (error) {
      message.error(t('common.error') || 'Failed to delete patient');
    }
  };

  const handleModalOk = () => {
    setModalVisible(false);
    setEditingPatient(null);
    fetchPatients();
    fetchStats();
  };

  const columns: ColumnsType<Patient> = [
    {
      title: t('common.name') || 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: t('patients.phone') || 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone || '-',
    },
    {
      title: t('patients.gender') || 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string | null) => genderLabels[gender || 'UNKNOWN'] || '-',
    },
    {
      title: t('patients.tier') || 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier: string) => (
        <Tag color={tierColors[tier]}>{tierLabels[tier]}</Tag>
      ),
    },
    {
      title: t('common.status') || 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>,
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
      render: (_: any, record: Patient) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/patients/${record.id}`)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={t('patients.deleteConfirmTitle') || 'Delete patient'}
            description={t('patients.deleteConfirm') || 'Are you sure you want to delete this patient?'}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.confirm') || 'Yes'}
            cancelText={t('common.cancel') || 'No'}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Mobile view - render mobile patient list
  if (isMobile) {
    return (
      <div>
        <div style={{ padding: '12px', paddingBottom: 80 }}>
          <Title level={4} style={{ margin: 0, marginBottom: 12 }}>{t('patients.title')}</Title>
        </div>
        <MobilePatientList />
      </div>
    );
  }

  // Desktop view - render full table
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>{t('patients.title')}</Title>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">{t('patients.totalPatients') || 'Total Patients'}</Text>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.total}</div>
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">{t('patients.highValue') || 'High Value'}</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>{stats.byTier.HIGH_VALUE}</div>
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">{t('patients.regular') || 'Regular'}</Text>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.byTier.REGULAR}</div>
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">{t('patients.lostRisk') || 'Lost Risk'}</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>{stats.byTier.LOST_RISK}</div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Search
            placeholder={t('patients.searchPlaceholder') || 'Search by name or phone'}
            onSearch={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder={t('patients.filterByTier') || 'Filter by tier'}
            allowClear
            style={{ width: 150 }}
            onChange={handleTierChange}
            options={[
              { label: t('patients.allTiers') || 'All Tiers', value: undefined },
              { label: t('patients.highValue') || '高价值', value: 'HIGH_VALUE' },
              { label: t('patients.regular') || '普通', value: 'REGULAR' },
              { label: t('patients.lostRisk') || '流失风险', value: 'LOST_RISK' },
            ]}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('patients.addPatient') || 'Add Patient'}
        </Button>
      </div>

      {/* Patients Table */}
      <Table
        columns={columns}
        dataSource={patients}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `${t('common.total') || 'Total'} ${total} ${t('patients.title') || 'patients'}`,
        }}
        onChange={handleTableChange}
      />

      {/* Add/Edit Modal */}
      <PatientFormModal
        visible={modalVisible}
        patient={editingPatient}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          setEditingPatient(null);
        }}
      />
    </div>
  );
}
