import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Tabs, message } from 'antd';
import { Patient, CreatePatientDto, UpdatePatientDto, patientsApi } from '@/api/patients';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface PatientFormModalProps {
  visible: boolean;
  patient: Patient | null;
  onOk: () => void;
  onCancel: () => void;
}

const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Unknown', value: 'UNKNOWN' },
];

const tierOptions = [
  { label: 'High Value (高价值)', value: 'HIGH_VALUE' },
  { label: 'Regular (普通)', value: 'REGULAR' },
  { label: 'Lost Risk (流失风险)', value: 'LOST_RISK' },
];

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Churned', value: 'CHURNED' },
  { label: 'Deceased', value: 'DECEASED' },
];

export default function PatientFormModal({ visible, patient, onOk, onCancel }: PatientFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && patient) {
      form.setFieldsValue({
        ...patient,
        birthDate: patient.birthDate ? dayjs(patient.birthDate) : undefined,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, patient, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreatePatientDto | UpdatePatientDto = {
        ...values,
        birthDate: values.birthDate?.toISOString(),
      };

      setLoading(true);
      if (patient) {
        await patientsApi.update(patient.id, data as UpdatePatientDto);
        message.success('Patient updated successfully');
      } else {
        await patientsApi.create(data as CreatePatientDto);
        message.success('Patient created successfully');
      }
      onOk();
    } catch (error: any) {
      if (error.errorFields) {
        return; // Form validation error
      }
      message.error(error.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter patient name' }]}
          >
            <Input placeholder="Enter patient name" />
          </Form.Item>
          <Form.Item name="gender" label="Gender">
            <Select options={genderOptions} placeholder="Select gender" />
          </Form.Item>
          <Form.Item name="birthDate" label="Birth Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tier" label="Tier">
            <Select options={tierOptions} placeholder="Select tier" />
          </Form.Item>
          {patient && (
            <Form.Item name="status" label="Status">
              <Select options={statusOptions} placeholder="Select status" />
            </Form.Item>
          )}
        </>
      ),
    },
    {
      key: 'medical',
      label: 'Medical Info',
      children: (
        <>
          <Form.Item name="allergyHistory" label="Allergy History">
            <TextArea rows={4} placeholder="Enter allergy information (will be encrypted)" />
          </Form.Item>
          <Form.Item name="pastHistory" label="Past Medical History">
            <TextArea rows={4} placeholder="Enter past medical history (will be encrypted)" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'contact',
      label: 'Contact Info',
      children: (
        <>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: 'Please enter a valid phone number' },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <TextArea rows={3} placeholder="Enter address" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={patient ? 'Edit Patient' : 'Add Patient'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      confirmLoading={loading}
      okText={patient ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Tabs items={tabItems} />
      </Form>
    </Modal>
  );
}
