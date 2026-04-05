import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Tabs, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Patient, CreatePatientDto, UpdatePatientDto, patientsApi } from '@/api/patients';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface PatientFormModalProps {
  visible: boolean;
  patient: Patient | null;
  onOk: () => void;
  onCancel: () => void;
}

export default function PatientFormModal({ visible, patient, onOk, onCancel }: PatientFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { label: t('patients.male') || 'Male', value: 'MALE' },
    { label: t('patients.female') || 'Female', value: 'FEMALE' },
    { label: t('patients.other') || 'Other', value: 'OTHER' },
    { label: t('patients.unknown') || 'Unknown', value: 'UNKNOWN' },
  ];

  const tierOptions = [
    { label: t('patients.highValue') || 'High Value', value: 'HIGH_VALUE' },
    { label: t('patients.regular') || 'Regular', value: 'REGULAR' },
    { label: t('patients.lostRisk') || 'Lost Risk', value: 'LOST_RISK' },
  ];

  const statusOptions = [
    { label: t('patients.active') || 'Active', value: 'ACTIVE' },
    { label: t('patients.inactive') || 'Inactive', value: 'INACTIVE' },
    { label: t('patients.churned') || 'Churned', value: 'CHURNED' },
    { label: t('patients.deceased') || 'Deceased', value: 'DECEASED' },
  ];

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
        message.success(t('common.success'));
      } else {
        await patientsApi.create(data as CreatePatientDto);
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

  const tabItems = [
    {
      key: 'basic',
      label: t('patients.basicInfo') || 'Basic Info',
      children: (
        <>
          <Form.Item
            name="name"
            label={t('patients.patientName')}
            rules={[{ required: true, message: t('patients.enterName') || 'Please enter patient name' }]}
          >
            <Input placeholder={t('patients.enterName') || 'Enter patient name'} />
          </Form.Item>
          <Form.Item name="gender" label={t('patients.gender')}>
            <Select options={genderOptions} placeholder={t('patients.selectGender') || 'Select gender'} />
          </Form.Item>
          <Form.Item name="birthDate" label={t('patients.birthday')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tier" label={t('patients.tier')}>
            <Select options={tierOptions} placeholder={t('patients.selectTier') || 'Select tier'} />
          </Form.Item>
          {patient && (
            <Form.Item name="status" label={t('common.status')}>
              <Select options={statusOptions} placeholder={t('patients.selectStatus') || 'Select status'} />
            </Form.Item>
          )}
        </>
      ),
    },
    {
      key: 'medical',
      label: t('patients.medicalInfo') || 'Medical Info',
      children: (
        <>
          <Form.Item name="allergyHistory" label={t('patients.allergies')}>
            <TextArea rows={4} placeholder={t('patients.allergyPlaceholder') || 'Enter allergy information (will be encrypted)'} />
          </Form.Item>
          <Form.Item name="pastHistory" label={t('patients.medicalHistory')}>
            <TextArea rows={4} placeholder={t('patients.historyPlaceholder') || 'Enter past medical history (will be encrypted)'} />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'contact',
      label: t('patients.contactInfo') || 'Contact Info',
      children: (
        <>
          <Form.Item
            name="phone"
            label={t('patients.phone')}
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: t('patients.validPhone') || 'Please enter a valid phone number' },
            ]}
          >
            <Input placeholder={t('patients.enterPhone') || 'Enter phone number'} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('common.email')}
            rules={[{ type: 'email', message: t('patients.validEmail') || 'Please enter a valid email' }]}
          >
            <Input placeholder={t('patients.enterEmail') || 'Enter email address'} />
          </Form.Item>
          <Form.Item name="address" label={t('patients.address')}>
            <TextArea rows={3} placeholder={t('patients.enterAddress') || 'Enter address'} />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={patient ? t('patients.editPatient') : t('patients.addPatient')}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      confirmLoading={loading}
      okText={patient ? t('common.save') : t('common.add')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Tabs items={tabItems} />
      </Form>
    </Modal>
  );
}
