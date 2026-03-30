import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Tabs, Table, Space, Typography, Spin, message } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { patientsApi, Patient } from '@/api/patients';
import PatientFormModal from './PatientFormModal';

const { Title, Text } = Typography;

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

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPatient = async () => {
    if (!id) return;
    try {
      const data = await patientsApi.getById(id);
      setPatient(data);
    } catch (error) {
      message.error('Failed to fetch patient');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleModalOk = () => {
    setModalVisible(false);
    fetchPatient();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const genderLabels: Record<string, string> = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
    UNKNOWN: 'Unknown',
  };

  const basicInfoItems = [
    { key: '1', label: 'Name', children: <Text strong>{patient.name}</Text> },
    { key: '2', label: 'Gender', children: genderLabels[patient.gender || 'UNKNOWN'] || '-' },
    { key: '3', label: 'Birth Date', children: patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : '-' },
    { key: '4', label: 'Tier', children: <Tag color={tierColors[patient.tier]}>{tierLabels[patient.tier]}</Tag> },
    { key: '5', label: 'Status', children: <Tag color={statusColors[patient.status]}>{patient.status}</Tag> },
    { key: '6', label: 'Created', children: new Date(patient.createdAt).toLocaleString() },
  ];

  const contactInfoItems = [
    { key: '1', label: 'Phone', children: patient.phone || '-' },
    { key: '2', label: 'Email', children: patient.email || '-' },
    { key: '3', label: 'Address', children: patient.address || '-' },
  ];

  const medicalInfoItems = [
    { key: '1', label: 'Allergy History', children: patient.allergyHistory || '-' },
    { key: '2', label: 'Past Medical History', children: patient.pastHistory || '-' },
  ];

  const demandColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  const touchpointColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Channel', dataIndex: 'channel', key: 'channel' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  const followupColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  const tabItems = [
    {
      key: 'demands',
      label: `Demands (${patient.demands?.length || 0})`,
      children: (
        <Table
          dataSource={patient.demands || []}
          columns={demandColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'touchpoints',
      label: `Touchpoints (${patient.touchpoints?.length || 0})`,
      children: (
        <Table
          dataSource={patient.touchpoints || []}
          columns={touchpointColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'followups',
      label: `Follow-ups (${patient.followupPlans?.length || 0})`,
      children: (
        <Table
          dataSource={patient.followupPlans || []}
          columns={followupColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')}>
          Back
        </Button>
        <Button icon={<EditOutlined />} onClick={handleEdit}>
          Edit
        </Button>
      </Space>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>{patient.name}</Title>
        <Tag color={tierColors[patient.tier]}>{tierLabels[patient.tier]}</Tag>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Card title="Basic Information" size="small">
          <Descriptions column={1} size="small" items={basicInfoItems} />
        </Card>

        <Card title="Contact Information" size="small">
          <Descriptions column={1} size="small" items={contactInfoItems} />
        </Card>

        <Card title="Medical Information" size="small">
          <Descriptions column={1} size="small" items={medicalInfoItems} />
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <Tabs items={tabItems} />
      </Card>

      <PatientFormModal
        visible={modalVisible}
        patient={patient}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
}
