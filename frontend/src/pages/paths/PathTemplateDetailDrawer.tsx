import { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
  Divider,
  Modal,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { pathsApi, PathTemplate, PathStep, CreatePathStepDto } from '@/api/paths';
import PathAssignmentModal from './PathAssignmentModal';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  visible: boolean;
  template: PathTemplate | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function PathTemplateDetailDrawer({ visible, template, onClose, onUpdated }: Props) {
  const { t } = useTranslation();
  const [templateData, setTemplateData] = useState<PathTemplate | null>(null);
  const [steps, setSteps] = useState<PathStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<PathStep | null>(null);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [stepForm] = Form.useForm();

  useEffect(() => {
    if (visible && template?.id) {
      fetchTemplateDetails(template.id);
    }
  }, [visible, template]);

  const fetchTemplateDetails = async (id: string) => {
    setLoading(true);
    try {
      const data = await pathsApi.getById(id);
      setTemplateData(data);
      setSteps(data.steps || []);
    } catch (error) {
      message.error(t('common.error') || 'Failed to fetch template details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    setEditingStep(null);
    stepForm.resetFields();
    // Set next step order
    const maxOrder = steps.reduce((max, s) => Math.max(max, s.stepOrder), 0);
    stepForm.setFieldsValue({ stepOrder: maxOrder + 1, stepType: 'TASK' });
    setStepModalVisible(true);
  };

  const handleEditStep = (step: PathStep) => {
    setEditingStep(step);
    stepForm.setFieldsValue({
      name: step.name,
      description: step.description,
      stepOrder: step.stepOrder,
      stepType: step.stepType,
      estimatedDays: step.estimatedDays,
      timeoutHours: step.timeoutHours,
    });
    setStepModalVisible(true);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!templateData) return;
    try {
      await pathsApi.deleteStep(templateData.id, stepId);
      message.success(t('common.success') || 'Step deleted');
      fetchTemplateDetails(templateData.id);
      onUpdated();
    } catch (error) {
      message.error(t('common.error') || 'Failed to delete step');
    }
  };

  const handleStepSubmit = async () => {
    if (!templateData) return;
    try {
      const values = await stepForm.validateFields();
      setLoading(true);

      if (editingStep) {
        await pathsApi.updateStep(templateData.id, editingStep.id, values);
        message.success(t('common.success') || 'Step updated');
      } else {
        await pathsApi.addStep(templateData.id, values as CreatePathStepDto);
        message.success(t('common.success') || 'Step added');
      }

      setStepModalVisible(false);
      stepForm.resetFields();
      fetchTemplateDetails(templateData.id);
      onUpdated();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || t('common.error') || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSuccess = () => {
    setAssignmentModalVisible(false);
    message.success(t('paths.assignedSuccess') || 'Path assigned to patient');
  };

  const stepTypeLabels: Record<string, string> = {
    START: t('paths.stepType.start') || 'Start',
    TASK: t('paths.stepType.task') || 'Task',
    AUTOMATED_ACTION: t('paths.stepType.automated') || 'Automated',
    WAIT: t('paths.stepType.wait') || 'Wait',
    DECISION: t('paths.stepType.decision') || 'Decision',
    END: t('paths.stepType.end') || 'End',
  };

  const stepColumns: ColumnsType<PathStep> = [
    {
      title: t('paths.stepOrder') || '#',
      dataIndex: 'stepOrder',
      key: 'stepOrder',
      width: 60,
    },
    {
      title: t('common.name') || 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('paths.stepType.label') || 'Type',
      dataIndex: 'stepType',
      key: 'stepType',
      width: 100,
      render: (type: string) => stepTypeLabels[type] || type,
    },
    {
      title: t('paths.estimatedDays') || 'Days',
      dataIndex: 'estimatedDays',
      key: 'estimatedDays',
      width: 70,
      render: (days: number | null) => days || '-',
    },
    {
      title: t('common.actions') || 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: PathStep) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditStep(record)} />
          <Popconfirm
            title={t('paths.deleteStepConfirm') || 'Delete this step?'}
            onConfirm={() => handleDeleteStep(record.id)}
            okText={t('common.confirm') || 'Yes'}
            cancelText={t('common.cancel') || 'No'}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={templateData?.name || t('paths.templateDetails') || 'Template Details'}
        open={visible}
        onClose={onClose}
        width={700}
        extra={
          <Button
            type="primary"
            onClick={() => setAssignmentModalVisible(true)}
            disabled={!templateData || templateData.status !== 'ACTIVE' || steps.length === 0}
          >
            {t('paths.assignToPatient') || 'Assign to Patient'}
          </Button>
        }
      >
        {templateData && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">{t('paths.description') || 'Description'}</Text>
              <div>{templateData.description || '-'}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">{t('common.status') || 'Status'}</Text>
              <div>
                <Tag color={templateData.status === 'ACTIVE' ? 'green' : templateData.status === 'DRAFT' ? 'orange' : 'default'}>
                  {templateData.status === 'ACTIVE' ? t('paths.active') : templateData.status === 'DRAFT' ? t('paths.draft') : templateData.status === 'ARCHIVED' ? t('paths.archived') : templateData.status}
                </Tag>
              </div>
            </div>

            <Divider>{t('paths.steps') || 'Steps'}</Divider>

            <div style={{ marginBottom: 16 }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddStep} block>
                {t('paths.addStep') || 'Add Step'}
              </Button>
            </div>

            <Table
              columns={stepColumns}
              dataSource={steps}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Drawer>

      {/* Step Form Modal */}
      <Modal
        title={editingStep ? (t('paths.editStep') || 'Edit Step') : (t('paths.addStep') || 'Add Step')}
        open={stepModalVisible}
        onCancel={() => {
          setStepModalVisible(false);
          stepForm.resetFields();
        }}
        footer={
          <Space>
            <Button onClick={() => setStepModalVisible(false)}>{t('common.cancel')}</Button>
            <Button type="primary" loading={loading} onClick={handleStepSubmit}>
              {t('common.confirm')}
            </Button>
          </Space>
        }
        width={500}
      >
        <Form form={stepForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={t('common.name') || 'Name'}
            rules={[{ required: true, message: t('paths.nameRequired') || 'Name is required' }]}
          >
            <Input placeholder={t('paths.stepNamePlaceholder') || 'Enter step name'} />
          </Form.Item>

          <Form.Item name="description" label={t('paths.description') || 'Description'}>
            <TextArea placeholder={t('paths.stepDescPlaceholder') || 'Enter step description'} rows={2} />
          </Form.Item>

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="stepOrder" label={t('paths.stepOrder') || 'Order'} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 80 }} />
            </Form.Item>

            <Form.Item name="stepType" label={t('paths.stepType.label') || 'Type'} initialValue="TASK">
              <Select style={{ width: 140 }}>
                <Select.Option value="START">Start</Select.Option>
                <Select.Option value="TASK">Task</Select.Option>
                <Select.Option value="AUTOMATED_ACTION">Automated</Select.Option>
                <Select.Option value="WAIT">Wait</Select.Option>
                <Select.Option value="DECISION">Decision</Select.Option>
                <Select.Option value="END">End</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="estimatedDays" label={t('paths.estimatedDays') || 'Days'}>
              <InputNumber min={1} placeholder="7" style={{ width: 80 }} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* Assignment Modal */}
      {templateData && (
        <PathAssignmentModal
          visible={assignmentModalVisible}
          template={templateData}
          onOk={handleAssignmentSuccess}
          onCancel={() => setAssignmentModalVisible(false)}
        />
      )}
    </>
  );
}
