import { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Typography, message, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { pathsApi, PathTemplate } from '@/api/paths';
import { patientsApi, Patient, Demand } from '@/api/patients';

const { Text } = Typography;

interface Props {
  visible: boolean;
  template: PathTemplate | null;
  onOk: () => void;
  onCancel: () => void;
}

export default function PathAssignmentModal({ visible, template, onOk, onCancel }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [demandLoading, setDemandLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({ startDate: dayjs() });
      setSelectedPatientId(null);
      setDemands([]);
    }
  }, [visible, form]);

  const searchPatients = async (query: string) => {
    if (query.length < 2) return;
    setPatientLoading(true);
    try {
      const results = await patientsApi.search(query, 'name');
      setPatients(results);
    } catch (error) {
      console.error('Failed to search patients', error);
    } finally {
      setPatientLoading(false);
    }
  };

  const handlePatientSelect = async (patientId: string) => {
    setSelectedPatientId(patientId);
    form.setFieldsValue({ demandId: undefined });
    setDemandLoading(true);
    try {
      // Get patient's demands - using the first 20 as there's no search endpoint for demands
      const response = await patientsApi.getById(patientId);
      setDemands(response.demands || []);
    } catch (error) {
      console.error('Failed to fetch patient demands', error);
      setDemands([]);
    } finally {
      setDemandLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!template) return;
    try {
      const values = await form.validateFields();
      setLoading(true);

      const assignData = {
        patientId: values.patientId,
        demandId: values.demandId,
        startDate: values.startDate?.toISOString(),
      };

      await pathsApi.assignToPatient(template.id, assignData);
      message.success(t('paths.assignedSuccess') || 'Path assigned successfully');
      form.resetFields();
      onOk();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || t('common.error') || 'Assignment failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('paths.assignToPatient') || 'Assign Path to Patient'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={t('common.confirm') || 'Confirm'}
      cancelText={t('common.cancel') || 'Cancel'}
      width={500}
      confirmLoading={loading}
    >
      {template && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>{t('paths.template') || 'Template'}:</Text> {template.name}
          <br />
          <Text type="secondary">
            {t('paths.steps') || 'Steps'}: {template.steps?.length || 0}
          </Text>
        </div>
      )}

      {template?.steps && template.steps.length === 0 && (
        <Alert
          type="warning"
          message={t('paths.noStepsWarning') || 'This template has no steps. Please add steps before assigning.'}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="patientId"
          label={t('patients.title') || 'Patient'}
          rules={[{ required: true, message: t('patients.selectPatient') || 'Please select a patient' }]}
        >
          <Select
            showSearch
            placeholder={t('patients.searchPatient') || 'Search patient by name'}
            loading={patientLoading}
            onSearch={searchPatients}
            onSelect={handlePatientSelect}
            filterOption={false}
          >
            {patients.map((patient) => (
              <Select.Option key={patient.id} value={patient.id}>
                {patient.name} {patient.phone ? `(${patient.phone})` : ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="demandId"
          label={t('demands.title') || 'Demand'}
          rules={[{ required: true, message: t('demands.selectDemand') || 'Please select a demand' }]}
        >
          <Select
            placeholder={t('demands.selectDemandPlaceholder') || 'Select a demand'}
            loading={demandLoading}
            disabled={!selectedPatientId}
          >
            {demands.map((demand) => (
              <Select.Option key={demand.id} value={demand.id}>
                {demand.title} - {demand.status}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label={t('paths.startDate') || 'Start Date'}
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
