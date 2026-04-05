import { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { followupsApi } from '@/api/followups';
import { patientsApi } from '@/api/patients';

interface FollowupPlanFormModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export default function FollowupPlanFormModal({ visible, onOk, onCancel }: FollowupPlanFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const typeOptions = [
    { label: t('followups.typeRoutine') || '常规随访', value: 'ROUTINE' },
    { label: t('followups.typePostTreatment') || '治疗后随访', value: 'POST_TREATMENT' },
    { label: t('followups.typePreAppointment') || '预约前随访', value: 'PRE_APPOINTMENT' },
    { label: t('followups.typeCustom') || '自定义', value: 'CUSTOM' },
  ];

  const handlePatientSearch = async (query: string) => {
    if (!query || query.length < 1) return [];
    try {
      const patients = await patientsApi.search(query);
      return patients.map((p: any) => ({ label: p.name, value: p.id }));
    } catch {
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString() || undefined,
      };

      setLoading(true);
      await followupsApi.createPlan(data);
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

  return (
    <Modal
      title={t('followups.createPlan')}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={600}
      confirmLoading={loading}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="patientId"
          label={t('patients.patientName')}
          rules={[{ required: true, message: t('followups.selectPatient') || '请选择患者' }]}
        >
          <Select
            showSearch
            placeholder={t('followups.searchPatient') || '搜索患者'}
            filterOption={false}
            onSearch={handlePatientSearch}
            options={[]}
            notFoundContent={null}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={t('followups.planName')}
          rules={[{ required: true, message: t('followups.enterPlanName') || '请输入计划名称' }]}
        >
          <Input placeholder={t('followups.planNamePlaceholder') || '输入随访计划名称'} />
        </Form.Item>

        <Form.Item
          name="type"
          label={t('common.type')}
          initialValue="ROUTINE"
        >
          <Select options={typeOptions} placeholder={t('followups.selectType') || '选择类型'} />
        </Form.Item>

        <Form.Item
          name="frequencyDays"
          label={t('followups.frequencyDays')}
          extra={t('followups.frequencyDaysHelp') || '两次随访之间的天数间隔'}
        >
          <InputNumber min={1} max={365} style={{ width: '100%' }} placeholder={t('followups.frequencyDaysPlaceholder') || '输入天数'} />
        </Form.Item>

        <Form.Item
          name="startDate"
          label={t('followups.startDate')}
          rules={[{ required: true, message: t('followups.selectStartDate') || '请选择开始日期' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="endDate"
          label={t('followups.endDate')}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="assignedUserId"
          label={t('followups.assignedUser')}
        >
          <Input placeholder={t('followups.assignedUserPlaceholder') || '留空则使用患者的负责人员'} disabled />
        </Form.Item>

        <Form.Item
          name="pathInstanceStepId"
          label={t('followups.linkedPathStep')}
        >
          <Input placeholder={t('followups.linkedPathStepPlaceholder') || '关联的技术路径步骤（可选）'} disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
}
