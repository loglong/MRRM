import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { followupsApi, FollowupRecord } from '@/api/followups';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ExecuteFollowupModalProps {
  visible: boolean;
  record: FollowupRecord | null;
  onOk: () => void;
  onCancel: () => void;
}

export default function ExecuteFollowupModal({ visible, record, onOk, onCancel }: ExecuteFollowupModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!record) return;

      setLoading(true);
      await followupsApi.executeRecord(record.id, {
        outcome: values.outcome,
        notes: values.notes,
      });
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

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!record) return null;

  return (
    <Modal
      title={t('followups.executeFollowup') || '执行随访'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={500}
      confirmLoading={loading}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label={t('patients.patientName')}>
          <Input value={record.patient.name} disabled />
        </Form.Item>

        <Form.Item label={t('followups.planName')}>
          <Input value={record.plan.name} disabled />
        </Form.Item>

        <Form.Item label={t('followups.scheduled')}>
          <Input value={dayjs(record.scheduledAt).format('YYYY-MM-DD')} disabled />
        </Form.Item>

        <Form.Item
          name="outcome"
          label={t('followups.outcome')}
        >
          <TextArea rows={3} placeholder={t('followups.outcomePlaceholder') || '输入随访结果'} />
        </Form.Item>

        <Form.Item
          name="notes"
          label={t('common.description')}
        >
          <TextArea rows={2} placeholder={t('followups.notesPlaceholder') || '输入备注'} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
