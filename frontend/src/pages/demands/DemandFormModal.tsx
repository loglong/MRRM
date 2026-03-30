import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  Demand,
  CreateDemandDto,
  UpdateDemandDto,
  demandsApi,
  demandTypeLabels,
  demandPriorityLabels,
  demandSourceLabels,
} from '@/api/demands';
import { patientsApi, Patient } from '@/api/patients';

const { TextArea } = Input;

interface DemandFormModalProps {
  visible: boolean;
  demand: Demand | null;
  patientId?: string;
  onOk: () => void;
  onCancel: () => void;
}

export default function DemandFormModal({
  visible,
  demand,
  patientId,
  onOk,
  onCancel,
}: DemandFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);

  const typeOptions = Object.entries(demandTypeLabels).map(([value, label]) => ({
    label,
    value,
  }));

  const priorityOptions = Object.entries(demandPriorityLabels).map(([value, label]) => ({
    label,
    value,
  }));

  const sourceOptions = Object.entries(demandSourceLabels).map(([value, label]) => ({
    label,
    value,
  }));

  // Search patients when modal opens
  useEffect(() => {
    if (visible) {
      searchPatients('');
    }
  }, [visible]);

  // Set form values when editing
  useEffect(() => {
    if (visible && demand) {
      form.setFieldsValue({
        patientId: demand.patientId,
        type: demand.type,
        title: demand.title,
        description: demand.description,
        priority: demand.priority,
        source: demand.source,
        estimatedAmount: demand.estimatedAmount,
      });
    } else if (visible && patientId) {
      form.setFieldsValue({ patientId });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, demand, patientId, form]);

  const searchPatients = async (query: string) => {
    setSearching(true);
    try {
      const results = await patientsApi.search(query || '', 'all');
      setPatients(results);
    } catch (error) {
      console.error('Failed to search patients:', error);
    } finally {
      setSearching(false);
    }
  };

  const handlePatientSearch = (value: string) => {
    searchPatients(value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (demand) {
        const data: UpdateDemandDto = {
          title: values.title,
          description: values.description,
          priority: values.priority,
          source: values.source,
          estimatedAmount: values.estimatedAmount,
        };
        await demandsApi.update(demand.id, data);
        message.success(t('common.success'));
      } else {
        const data: CreateDemandDto = {
          patientId: values.patientId,
          type: values.type,
          title: values.title,
          description: values.description,
          priority: values.priority,
          source: values.source,
          estimatedAmount: values.estimatedAmount,
        };
        await demandsApi.create(data);
        message.success(t('common.success'));
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

  const patientOptions = patients.map((p) => ({
    label: `${p.name} ${p.phone ? `(${p.phone})` : ''}`,
    value: p.id,
  }));

  return (
    <Modal
      title={demand ? t('demands.editDemand') : t('demands.addDemand')}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      confirmLoading={loading}
      okText={demand ? t('common.save') : t('common.add')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {!demand && (
          <Form.Item
            name="patientId"
            label={t('demands.patient')}
            rules={[{ required: true, message: t('demands.selectPatient') || 'Please select a patient' }]}
          >
            <Select
              showSearch
              placeholder={t('demands.searchPatient') || 'Search patient...'}
              options={patientOptions}
              onSearch={handlePatientSearch}
              onFocus={() => searchPatients('')}
              loading={searching}
              filterOption={false}
              notFoundContent={null}
            />
          </Form.Item>
        )}

        <Form.Item
          name="type"
          label={t('demands.type')}
          rules={[{ required: true, message: t('demands.selectType') || 'Please select demand type' }]}
        >
          <Select
            placeholder={t('demands.selectType') || 'Select type'}
            options={typeOptions}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label={t('demands.title')}
          rules={[
            { required: true, message: t('demands.enterTitle') || 'Please enter title' },
            { max: 100, message: t('demands.titleMaxLength') || 'Title must be 100 characters or less' },
          ]}
        >
          <Input placeholder={t('demands.enterTitle') || 'Enter demand title'} />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('demands.description')}
          rules={[
            { required: true, message: t('demands.enterDescription') || 'Please enter description' },
            { max: 1000, message: t('demands.descMaxLength') || 'Description must be 1000 characters or less' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t('demands.enterDescription') || 'Enter demand description'}
          />
        </Form.Item>

        <Form.Item name="priority" label={t('demands.priority')}>
          <Select
            placeholder={t('demands.selectPriority') || 'Select priority'}
            options={priorityOptions}
            defaultValue="MEDIUM"
          />
        </Form.Item>

        <Form.Item name="source" label={t('demands.source')}>
          <Select
            placeholder={t('demands.selectSource') || 'Select source'}
            options={sourceOptions}
            defaultValue="WALK_IN"
          />
        </Form.Item>

        <Form.Item name="estimatedAmount" label={t('demands.estimatedAmount')}>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={2}
            placeholder={t('demands.enterAmount') || 'Enter estimated amount'}
            addonAfter="¥"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
