import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { pathsApi, PathTemplate } from '@/api/paths';

interface Props {
  visible: boolean;
  template: PathTemplate | null;
  onOk: () => void;
  onCancel: () => void;
}

export default function PathTemplateFormModal({ visible, template, onOk, onCancel }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && template) {
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        status: template.status,
        icd10Code: template.icd10Code,
        icd9Code: template.icd9Code,
        diagnosisName: template.diagnosisName,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, template, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (template) {
        await pathsApi.update(template.id, values);
        message.success(t('common.success') || 'Template updated');
      } else {
        await pathsApi.create(values);
        message.success(t('common.success') || 'Template created');
      }

      form.resetFields();
      onOk();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || t('common.error') || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={template ? (t('paths.editTemplate') || 'Edit Template') : (t('paths.createTemplate') || 'Create Template')}
      open={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.cancel') || 'Cancel'}</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {t('common.confirm') || 'Confirm'}
          </Button>
        </Space>
      }
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label={t('common.name') || 'Name'}
          rules={[{ required: true, message: t('paths.nameRequired') || 'Name is required' }]}
        >
          <Input placeholder={t('paths.templateNamePlaceholder') || 'Enter template name'} />
        </Form.Item>

        <Form.Item name="description" label={t('paths.description') || 'Description'}>
          <Input.TextArea
            placeholder={t('paths.descriptionPlaceholder') || 'Enter description'}
            rows={3}
          />
        </Form.Item>

        <Form.Item name="status" label={t('common.status') || 'Status'} initialValue="DRAFT">
          <Select>
            <Select.Option value="DRAFT">{t('paths.draft') || 'Draft'}</Select.Option>
            <Select.Option value="ACTIVE">{t('paths.active') || 'Active'}</Select.Option>
            <Select.Option value="ARCHIVED">{t('paths.archived') || 'Archived'}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="diagnosisName" label={t('paths.diagnosisName') || 'Diagnosis Name'}>
          <Input placeholder={t('paths.diagnosisNamePlaceholder') || 'Enter diagnosis name'} />
        </Form.Item>

        <Form.Item name="icd10Code" label={t('paths.icd10Code') || 'ICD-10 Code'}>
          <Input placeholder={t('paths.icd10Placeholder') || 'e.g., K02.3'} />
        </Form.Item>

        <Form.Item name="icd9Code" label={t('paths.icd9Code') || 'ICD-9 Code'}>
          <Input placeholder={t('paths.icd9Placeholder') || 'e.g., 521.03'} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
