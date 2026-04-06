import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { touchpointsApi } from '@/api/touchpoints';
import { patientsApi } from '@/api/patients';

const { TextArea } = Input;

interface TouchpointFormModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export default function TouchpointFormModal({ visible, onOk, onCancel }: TouchpointFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patientOptions, setPatientOptions] = useState<{ label: string; value: string }[]>([]);

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

  const sentimentOptions = [
    { label: t('touchpoints.positive') || 'Positive', value: 'POSITIVE' },
    { label: t('touchpoints.neutral') || 'Neutral', value: 'NEUTRAL' },
    { label: t('touchpoints.negative') || 'Negative', value: 'NEGATIVE' },
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

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setPatientOptions([]);
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);
      await touchpointsApi.create(values);
      message.success(t('common.success'));
      form.resetFields();
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
      title={t('touchpoints.record') || 'Record Touchpoint'}
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
            options={patientOptions}
            notFoundContent={patientOptions.length === 0 ? null : undefined}
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

        <Form.Item name="sentiment" label={t('touchpoints.sentiment') || 'Sentiment'}>
          <Radio.Group options={sentimentOptions} />
        </Form.Item>

        <Form.Item name="duration" label={t('touchpoints.durationMinutes') || 'Duration (minutes)'}>
          <Input type="number" placeholder={t('touchpoints.durationPlaceholder') || 'Enter duration in minutes'} />
        </Form.Item>

        <Form.Item name="outcome" label={t('touchpoints.outcome') || 'Outcome'}>
          <TextArea rows={2} placeholder={t('touchpoints.outcomePlaceholder') || 'Enter outcome'} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
