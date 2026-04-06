import { useState } from 'react';
import { Form, Radio, Input, DatePicker, Button, message, List, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { healthApi, HealthReminder } from '@/api/health';

const { TextArea } = Input;

interface Props {
  patientId: string;
  onReminderCreated?: () => void;
}

export default function HealthReminderForm({ patientId, onReminderCreated }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);

  const fetchReminders = async () => {
    try {
      const data = await healthApi.getReminders(patientId);
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders', err);
    } finally {
      setLoadingReminders(false);
    }
  };

  // Load reminders on mount
  useState(() => {
    fetchReminders();
  });

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await healthApi.createReminder({
        patientId,
        type: values.type,
        title: values.title,
        content: values.content,
        remindAt: values.remindAt.toISOString(),
      });
      message.success(t('health.reminderCreated') || 'Reminder created');
      form.resetFields();
      fetchReminders();
      onReminderCreated?.();
    } catch (err) {
      console.error('Failed to create reminder', err);
      message.error(t('health.reminderError') || 'Failed to create reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await healthApi.completeReminder(id);
      message.success(t('health.reminderCompleted') || 'Reminder completed');
      fetchReminders();
    } catch (err) {
      console.error('Failed to complete reminder', err);
      message.error(t('common.error') || 'Failed to complete');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await healthApi.deleteReminder(id);
      message.success(t('health.reminderDeleted') || 'Reminder deleted');
      fetchReminders();
    } catch (err) {
      console.error('Failed to delete reminder', err);
      message.error(t('common.error') || 'Failed to delete');
    }
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="type"
          label={t('health.reminderType') || 'Reminder Type'}
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value="REVIEW">{t('health.review') || 'Review'}</Radio>
            <Radio value="MEDICATION">{t('health.medication') || 'Medication'}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="title"
          label={t('health.reminderTitle') || 'Title'}
          rules={[{ required: true, message: t('health.titleRequired') || 'Title is required' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="content"
          label={t('health.reminderContent') || 'Content'}
        >
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item
          name="remindAt"
          label={t('health.remindAt') || 'Remind At'}
          rules={[{ required: true, message: t('health.dateRequired') || 'Date is required' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {t('common.create') || 'Create'}
          </Button>
        </Form.Item>
      </Form>

      <div>
        <h4>{t('health.pendingReminders') || 'Pending Reminders'}</h4>
        {loadingReminders ? (
          <div>{t('common.loading') || 'Loading...'}</div>
        ) : reminders.length === 0 ? (
          <div style={{ color: '#999' }}>{t('health.noReminders') || 'No pending reminders'}</div>
        ) : (
          <List
            size="small"
            dataSource={reminders}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button size="small" onClick={() => handleComplete(item.id)}>
                    {t('common.complete') || 'Complete'}
                  </Button>,
                  <Button size="small" danger onClick={() => handleDelete(item.id)}>
                    {t('common.delete') || 'Delete'}
                  </Button>,
                ]}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  {item.content && <div style={{ fontSize: 12 }}>{item.content}</div>}
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {dayjs(item.remindAt).format('YYYY-MM-DD HH:mm')} - {item.type}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
