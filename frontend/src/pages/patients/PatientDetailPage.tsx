import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Tabs, Table, Space, Typography, Spin, message } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { patientsApi, Patient } from '@/api/patients';
import { journeyApi, JourneyEvent } from '@/api/journey';
import { demandStatusLabels, demandTypeLabels, DemandStatus, DemandType } from '@/api/demands';
import HealthArchiveSummary from './components/HealthArchiveSummary';
import HealthTimeline from './components/HealthTimeline';
import HealthReminderForm from './components/HealthReminderForm';
import PatientFormModal from './PatientFormModal';
import PatientTimeline from '@/components/PatientTimeline';
import { FollowupRecommendationPanel } from '../ai/FollowupRecommendationPage';

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

const demandStatusColors: Record<string, string> = {
  OPEN: 'blue',
  IN_PROGRESS: 'processing',
  PENDING: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'default',
  LOST: 'error',
};

export default function PatientDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyPage, setJourneyPage] = useState(1);
  const [journeyTotalPages, setJourneyTotalPages] = useState(1);

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

  useEffect(() => {
    if (patient?.id) {
      setJourneyLoading(true);
      journeyApi.getPatientJourney(patient.id, { page: journeyPage, limit: 50 })
        .then((data) => {
          setJourneyEvents(data.events);
          setJourneyTotalPages(data.pagination.totalPages);
        })
        .catch((err) => {
          console.error('Failed to load journey', err);
          message.error(t('common.error') || 'Failed to load journey');
        })
        .finally(() => setJourneyLoading(false));
    }
  }, [patient?.id, journeyPage, t]);

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
    MALE: t('patients.male'),
    FEMALE: t('patients.female'),
    OTHER: t('patients.other'),
    UNKNOWN: t('patients.unknown'),
  };

  const basicInfoItems = [
    { key: '1', label: t('patientDetail.name'), children: <Text strong>{patient.name}</Text> },
    { key: '2', label: t('patientDetail.gender'), children: genderLabels[patient.gender || 'UNKNOWN'] || '-' },
    { key: '3', label: t('patientDetail.birthDate'), children: patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : '-' },
    { key: '4', label: t('patientDetail.tier'), children: <Tag color={tierColors[patient.tier]}>{tierLabels[patient.tier]}</Tag> },
    { key: '5', label: t('patientDetail.status'), children: <Tag color={statusColors[patient.status]}>{patient.status}</Tag> },
    { key: '6', label: t('patientDetail.created'), children: new Date(patient.createdAt).toLocaleString() },
  ];

  const contactInfoItems = [
    { key: '1', label: t('patientDetail.phone'), children: patient.phone || '-' },
    { key: '2', label: t('patientDetail.email'), children: patient.email || '-' },
    { key: '3', label: t('patientDetail.address'), children: patient.address || '-' },
  ];

  const medicalInfoItems = [
    { key: '1', label: t('patientDetail.allergyHistory'), children: patient.allergyHistory || '-' },
    { key: '2', label: t('patientDetail.pastMedicalHistory'), children: patient.pastHistory || '-' },
  ];

  const demandColumns = [
    { title: t('patientDetail.demandTitle'), dataIndex: 'title', key: 'title' },
    {
      title: t('patientDetail.demandType'),
      dataIndex: 'type',
      key: 'type',
      render: (type: DemandType) => <Tag>{demandTypeLabels[type] || type}</Tag>,
    },
    {
      title: t('patientDetail.demandStatus'),
      dataIndex: 'status',
      key: 'status',
      render: (status: DemandStatus) => <Tag color={demandStatusColors[status]}>{demandStatusLabels[status] || status}</Tag>,
    },
    { title: t('patientDetail.demandCreated'), dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  const touchpointColumns = [
    { title: t('patientDetail.title'), dataIndex: 'title', key: 'title' },
    { title: t('patientDetail.type'), dataIndex: 'type', key: 'type' },
    { title: t('touchpoints.channel'), dataIndex: 'channel', key: 'channel' },
    { title: t('patientDetail.created'), dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  const followupColumns = [
    { title: t('followups.planName'), dataIndex: 'name', key: 'name' },
    { title: t('patientDetail.type'), dataIndex: 'type', key: 'type' },
    { title: t('patientDetail.status'), dataIndex: 'status', key: 'status' },
    { title: t('followups.startDate'), dataIndex: 'startDate', key: 'startDate', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  const tabItems = [
    {
      key: 'demands',
      label: `${t('patients.demands')} (${patient.demands?.length || 0})`,
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
      label: `${t('patients.touchpoints')} (${patient.touchpoints?.length || 0})`,
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
      label: `${t('patients.followups')} (${patient.followupPlans?.length || 0})`,
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
    {
      key: 'journey',
      label: t('patients.journey'),
      children: (
        <PatientTimeline
          events={journeyEvents}
          loading={journeyLoading}
          onPageChange={setJourneyPage}
          currentPage={journeyPage}
          totalPages={journeyTotalPages}
        />
      ),
    },
    {
      key: 'health',
      label: t('patients.health') || '健康档案',
      children: (
        <div>
          <Card title={t('health.archiveSummary') || '健康档案摘要'} size="small" style={{ marginBottom: 16 }}>
            <HealthArchiveSummary patientId={patient.id} />
          </Card>
          <Card title={t('health.timeline') || '健康时间线'} size="small" style={{ marginBottom: 16 }}>
            <HealthTimeline patientId={patient.id} />
          </Card>
          <Card title={t('health.reminders') || '健康提醒'} size="small">
            <HealthReminderForm patientId={patient.id} onReminderCreated={() => {}} />
          </Card>
        </div>
      ),
    },
    {
      key: 'ai-recommendation',
      label: 'AI随访推荐',
      children: (
        <FollowupRecommendationPanel
          patientId={patient.id}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')}>
          {t('common.back')}
        </Button>
        <Button icon={<EditOutlined />} onClick={handleEdit}>
          {t('common.edit')}
        </Button>
      </Space>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>{patient.name}</Title>
        <Tag color={tierColors[patient.tier]}>{tierLabels[patient.tier]}</Tag>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Card title={t('patients.basicInfo')} size="small">
          <Descriptions column={1} size="small" items={basicInfoItems} />
        </Card>

        <Card title={t('patients.contactInfo')} size="small">
          <Descriptions column={1} size="small" items={contactInfoItems} />
        </Card>

        <Card title={t('patients.medicalInfo')} size="small">
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
