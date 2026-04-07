import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, InputNumber, DatePicker, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { touchpointsApi } from '@/api/touchpoints';
import { patientsApi } from '@/api/patients';
import { demandsApi } from '@/api/demands';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface TouchpointFormModalProps {
  visible: boolean;
  editingTouchpoint?: any;
  onOk: () => void;
  onCancel: () => void;
}

export default function TouchpointFormModal({ visible, editingTouchpoint, onOk, onCancel }: TouchpointFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patientOptions, setPatientOptions] = useState<{ label: string; value: string }[]>([]);
  const [demandOptions, setDemandOptions] = useState<{ label: string; value: string }[]>([]);

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

  const channelOptions = [
    { label: t('touchpoints.offline') || 'Offline', value: 'OFFLINE' },
    { label: t('touchpoints.online') || 'Online', value: 'ONLINE' },
    { label: t('touchpoints.mobile') || 'Mobile', value: 'MOBILE' },
    { label: t('touchpoints.phone') || 'Phone', value: 'PHONE' },
  ];

  const feedbackOptions = [
    { label: t('touchpoints.satisfied') || 'Satisfied', value: 'SATISFIED' },
    { label: t('touchpoints.neutral') || 'Neutral', value: 'NEUTRAL' },
    { label: t('touchpoints.dissatisfied') || 'Dissatisfied', value: 'DISSATISFIED' },
  ];

  const handlePatientSearch = async (query: string) => {
    if (!query || query.length < 1) {
      setPatientOptions([]);
      return;
    }
    try {
      const patients = await patientsApi.search(query);
      setPatientOptions(patients.map((p: any) => ({ label: `${p.name} ${p.phone || ''}`, value: p.id })));
    } catch {
      setPatientOptions([]);
    }
  };

  const handlePatientSelect = async (selectedPatientId: string) => {
    // Load demands for the selected patient
    try {
      const response = await demandsApi.list({ patientId: selectedPatientId, limit: 50 });
      setDemandOptions(response.data.map((d: any) => ({
        label: `${d.title} (${d.type})`,
        value: d.id,
      })));
    } catch {
      setDemandOptions([]);
    }
  };

  const handleDemandSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setDemandOptions([]);
      return;
    }
    try {
      // Search demands by title
      const response = await demandsApi.list({ limit: 20 });
      const filtered = response.data.filter((d: any) =>
        d.title.toLowerCase().includes(query.toLowerCase())
      );
      setDemandOptions(filtered.map((d: any) => ({
        label: `${d.title} (${d.type})`,
        value: d.id,
      })));
    } catch {
      setDemandOptions([]);
    }
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setPatientOptions([]);
      setDemandOptions([]);
    } else if (editingTouchpoint) {
      // Populate form for editing
      form.setFieldsValue({
        patientId: editingTouchpoint.patientId,
        demandId: editingTouchpoint.demandId,
        type: editingTouchpoint.type,
        channel: editingTouchpoint.channel,
        title: editingTouchpoint.title,
        feedback: editingTouchpoint.feedback,
        satisfactionScore: editingTouchpoint.satisfactionScore,
        duration: editingTouchpoint.duration,
        outcome: editingTouchpoint.outcome,
        nextPlan: editingTouchpoint.nextPlan,
        nextPlanTime: editingTouchpoint.nextPlanTime ? dayjs(editingTouchpoint.nextPlanTime) : undefined,
      });
      // Load patient and demand options
      if (editingTouchpoint.patient) {
        setPatientOptions([{ label: editingTouchpoint.patient.name, value: editingTouchpoint.patientId }]);
      }
      if (editingTouchpoint.demandId) {
        handlePatientSelect(editingTouchpoint.patientId);
      }
    }
  }, [visible, editingTouchpoint, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format dates for API
      const formattedValues = {
        ...values,
        nextPlanTime: values.nextPlanTime ? dayjs(values.nextPlanTime).toISOString() : undefined,
        followupDate: values.followupDate ? dayjs(values.followupDate).toISOString() : undefined,
      };

      setLoading(true);
      if (editingTouchpoint) {
        await touchpointsApi.update(editingTouchpoint.id, formattedValues);
        message.success(t('common.success'));
      } else {
        await touchpointsApi.create(formattedValues);
        message.success(t('common.success'));
        form.resetFields();
      }
      onOk();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingTouchpoint ? (t('touchpoints.edit') || 'Edit Touchpoint') : (t('touchpoints.record') || 'Record Touchpoint')}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={600}
      confirmLoading={loading}
      okText={t('common.save') || 'Save'}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="patientId"
          label={t('patients.patientName') || 'Patient'}
          rules={[{ required: true, message: t('touchpoints.selectPatient') || 'Please select a patient' }]}
        >
          <Select
            showSearch
            placeholder={t('touchpoints.searchPatient') || 'Search patient by name'}
            filterOption={false}
            onSearch={handlePatientSearch}
            onChange={handlePatientSelect}
            options={patientOptions}
            notFoundContent={patientOptions.length === 0 ? null : undefined}
          />
        </Form.Item>

        <Form.Item
          name="demandId"
          label={t('demands.title') || 'Related Demand'}
        >
          <Select
            showSearch
            placeholder={t('demands.selectDemand') || 'Select related demand'}
            filterOption={false}
            onSearch={handleDemandSearch}
            options={demandOptions}
            allowClear
            notFoundContent={demandOptions.length === 0 ? null : undefined}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label={t('common.type') || 'Type'}
          rules={[{ required: true, message: t('touchpoints.selectType') || 'Please select touchpoint type' }]}
        >
          <Select options={typeOptions} placeholder={t('touchpoints.selectType') || 'Select type'} />
        </Form.Item>

        <Form.Item name="channel" label={t('touchpoints.channel') || 'Channel'}>
          <Select options={channelOptions} placeholder={t('touchpoints.selectChannel') || 'Select channel'} allowClear />
        </Form.Item>

        <Form.Item
          name="title"
          label={t('common.name') || 'Title'}
          rules={[{ required: true, message: t('touchpoints.enterTitle') || 'Please enter title' }]}
        >
          <Input placeholder={t('touchpoints.titlePlaceholder') || 'Enter touchpoint title'} />
        </Form.Item>

        <Form.Item name="feedback" label={t('touchpoints.feedback') || 'Feedback'}>
          <Radio.Group options={feedbackOptions} />
        </Form.Item>

        <Form.Item name="satisfactionScore" label={t('touchpoints.satisfactionScore') || 'Satisfaction Score (1-10)'}>
          <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="1-10" />
        </Form.Item>

        <Form.Item name="duration" label={t('touchpoints.durationMinutes') || 'Duration (minutes)'}>
          <InputNumber min={1} style={{ width: '100%' }} placeholder={t('touchpoints.durationPlaceholder') || 'Enter duration in minutes'} />
        </Form.Item>

        <Form.Item name="outcome" label={t('touchpoints.outcome') || 'Outcome'}>
          <TextArea rows={2} placeholder={t('touchpoints.outcomePlaceholder') || 'Enter outcome'} />
        </Form.Item>

        <Form.Item name="nextPlan" label={t('touchpoints.nextPlan') || 'Next Plan'}>
          <TextArea rows={2} placeholder={t('touchpoints.nextPlanPlaceholder') || 'Enter next follow-up plan'} />
        </Form.Item>

        <Form.Item name="nextPlanTime" label={t('touchpoints.nextPlanTime') || 'Next Plan Time'}>
          <DatePicker style={{ width: '100%' }} showTime placeholder={t('touchpoints.nextPlanTimePlaceholder') || 'Select date and time'} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
