import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Card, Select, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { patientsApi, Patient } from '@/api/patients';
import PatientFormModal from './PatientFormModal';

const { Title, Text } = Typography;
const { Search } = Input;

const tierColors: Record<string, string> = {
  HIGH_VALUE: 'gold',
  REGULAR: 'default',
  LOST_RISK: 'red',
};

const tierLabels: Record<string, string> = {
  HIGH_VALUE: '高价值',
  REGULAR: '普通',
  LOST_RISK: '流失风险',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  CHURNED: 'red',
  DECEASED: 'default',
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [tierFilter, setTierFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({ total: 0, byTier: { HIGH_VALUE: 0, REGULAR: 0, LOST_RISK: 0 } });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

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
      message.error('Failed to fetch patients');
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
      message.success('Patient deleted successfully');
      fetchPatients();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete patient');
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone || '-',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string | null) => {
        const labels: Record<string, string> = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other', UNKNOWN: 'Unknown' };
        return labels[gender || 'UNKNOWN'] || '-';
      },
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier: string) => (
        <Tag color={tierColors[tier]}>{tierLabels[tier]}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
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
            title="Delete patient"
            description="Are you sure you want to delete this patient?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Patient Management</Title>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">Total Patients</Text>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.total}</div>
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">High Value</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>{stats.byTier.HIGH_VALUE}</div>
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">Regular</Text>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.byTier.REGULAR}</div>
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Text type="secondary">Lost Risk</Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>{stats.byTier.LOST_RISK}</div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Search by name or phone"
            onSearch={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Filter by tier"
            allowClear
            style={{ width: 150 }}
            onChange={handleTierChange}
            options={[
              { label: 'All Tiers', value: undefined },
              { label: '高价值', value: 'HIGH_VALUE' },
              { label: '普通', value: 'REGULAR' },
              { label: '流失风险', value: 'LOST_RISK' },
            ]}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Patient
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
          showTotal: (total) => `Total ${total} patients`,
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
