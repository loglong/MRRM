import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Alert, Divider, Tag, Card, List, Radio, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { followupsApi, SuggestedPath, AvailablePath } from '@/api/followups';
import { patientsApi } from '@/api/patients';

interface FollowupPlanFormModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

type CreateMode = 'manual' | 'fromPath';

export default function FollowupPlanFormModal({ visible, onOk, onCancel }: FollowupPlanFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('manual');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [suggestedPaths, setSuggestedPaths] = useState<SuggestedPath[]>([]);
  const [availablePaths, setAvailablePaths] = useState<AvailablePath[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [loadingPaths, setLoadingPaths] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState<string | undefined>();

  const typeOptions = [
    { label: t('followups.typeRoutine') || '常规随访', value: 'ROUTINE' },
    { label: t('followups.typePostTreatment') || '治疗后随访', value: 'POST_TREATMENT' },
    { label: t('followups.typePreAppointment') || '预约前随访', value: 'PRE_APPOINTMENT' },
    { label: t('followups.typeCustom') || '自定义', value: 'CUSTOM' },
  ];

  const specialtyColors: Record<string, string> = {
    ORAL: 'blue',
    OPHTHALMIC: 'purple',
    ORTHOPEDIC: 'cyan',
    DERMATOLOGY: 'magenta',
    TCM: 'green',
  };

  // Load suggested paths when patient is selected
  useEffect(() => {
    if (!selectedPatientId) {
      setSuggestedPaths([]);
      return;
    }

    const loadSuggestedPaths = async () => {
      setLoadingPaths(true);
      try {
        const result = await followupsApi.getSuggestedPathsForPatient(selectedPatientId);
        setSuggestedPaths(result.suggestedPaths || []);
      } catch (error) {
        console.error('Failed to load suggested paths:', error);
        setSuggestedPaths([]);
      } finally {
        setLoadingPaths(false);
      }
    };

    loadSuggestedPaths();
  }, [selectedPatientId]);

  // Load available paths when switching to fromPath mode or changing specialty filter
  useEffect(() => {
    if (createMode !== 'fromPath') return;

    const loadAvailablePaths = async () => {
      setLoadingPaths(true);
      try {
        const result = await followupsApi.getAvailablePaths({ specialty: specialtyFilter });
        setAvailablePaths(result || []);
      } catch (error) {
        console.error('Failed to load available paths:', error);
        setAvailablePaths([]);
      } finally {
        setLoadingPaths(false);
      }
    };

    loadAvailablePaths();
  }, [createMode, specialtyFilter]);

  const handlePatientSearch = async (query: string) => {
    if (!query || query.length < 1) return [];
    try {
      const patients = await patientsApi.search(query);
      return patients.map((p: any) => ({ label: p.name, value: p.id }));
    } catch {
      return [];
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedPathId(null);
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

      if (createMode === 'fromPath' && selectedPatientId && selectedPathId) {
        // Create follow-up plan from path template
        await followupsApi.createPlanFromPath(selectedPatientId, selectedPathId, {
          name: values.name,
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString() || undefined,
          assignedUserId: values.assignedUserId,
        });
      } else {
        // Manual creation
        await followupsApi.createPlan(data);
      }

      message.success(t('common.success'));
      form.resetFields();
      setSelectedPatientId(null);
      setSelectedPathId(null);
      setCreateMode('manual');
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
    setSelectedPatientId(null);
    setSelectedPathId(null);
    setCreateMode('manual');
    setSuggestedPaths([]);
    setAvailablePaths([]);
    onCancel();
  };

  return (
    <Modal
      title={t('followups.createPlan')}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={700}
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
            onSelect={handlePatientSelect}
            options={[]}
            notFoundContent={null}
          />
        </Form.Item>

        <Divider orientation="left">{t('followups.createMode') || '创建方式'}</Divider>

        <Radio.Group
          value={createMode}
          onChange={(e) => {
            setCreateMode(e.target.value);
            setSelectedPathId(null);
          }}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="manual">{t('followups.manualCreate') || '手动创建'}</Radio.Button>
          <Radio.Button value="fromPath">{t('followups.fromPath') || '从路径创建'}</Radio.Button>
        </Radio.Group>

        {createMode === 'fromPath' && (
          <>
            <Card size="small" style={{ marginBottom: 16, background: '#f5f5f5' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>{t('followups.selectSpecialty') || '选择专科'}:</strong>
                  <Select
                    placeholder={t('followups.allSpecialties') || '全部专科'}
                    style={{ width: 200, marginLeft: 8 }}
                    allowClear
                    value={specialtyFilter}
                    onChange={(val) => setSpecialtyFilter(val)}
                  >
                    <Select.Option value="ORAL">{t('specialty.ORAL') || '口腔科'}</Select.Option>
                    <Select.Option value="OPHTHALMIC">{t('specialty.OPHTHALMIC') || '眼科'}</Select.Option>
                    <Select.Option value="ORTHOPEDIC">{t('specialty.ORTHOPEDIC') || '骨科'}</Select.Option>
                    <Select.Option value="DERMATOLOGY">{t('specialty.DERMATOLOGY') || '皮肤科'}</Select.Option>
                    <Select.Option value="TCM">{t('specialty.TCM') || '中医科'}</Select.Option>
                  </Select>
                </div>
              </Space>
            </Card>

            {loadingPaths ? (
              <Alert message={t('common.loading') || '加载中...'} type="info" showIcon />
            ) : (
              <>
                {suggestedPaths.length > 0 && !selectedPathId && (
                  <>
                    <h4>{t('followups.suggestedPaths') || '推荐路径'}</h4>
                    <List
                      size="small"
                      bordered
                      dataSource={suggestedPaths}
                      style={{ marginBottom: 16, maxHeight: 200, overflow: 'auto' }}
                      renderItem={(path) => (
                        <List.Item
                          onClick={() => setSelectedPathId(path.id)}
                          style={{ cursor: 'pointer', padding: '8px 12px' }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                              <Tag color={specialtyColors[path.specialty || ''] || 'default'}>
                                {path.specialty || '未知'}
                              </Tag>
                              <strong>{path.name}</strong>
                              <Tag>{path.stepCount} {t('paths.steps') || '步'}</Tag>
                            </Space>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              {'matchReason' in path && path.matchReason && <span>{path.matchReason}</span>}
                              {path.diagnosisName && <span> · {path.diagnosisName}</span>}
                            </div>
                          </Space>
                        </List.Item>
                      )}
                    />
                    <Divider>{t('common.or') || '或'}</Divider>
                  </>
                )}

                {selectedPathId && (
                  <Alert
                    message={
                      <Space>
                        <span>{t('followups.selectedPath') || '已选择路径'}:</span>
                        <Tag color="green">
                          {suggestedPaths.find(p => p.id === selectedPathId)?.name ||
                           availablePaths.find(p => p.id === selectedPathId)?.name}
                        </Tag>
                        <a onClick={() => setSelectedPathId(null)}>{t('common.clear') || '清除'}</a>
                      </Space>
                    }
                    type="success"
                    style={{ marginBottom: 16 }}
                  />
                )}

                {!selectedPathId && (
                  <>
                    <h4>{t('followups.allPaths') || '所有可用路径'}</h4>
                    <List
                      size="small"
                      bordered
                      dataSource={availablePaths}
                      style={{ maxHeight: 200, overflow: 'auto' }}
                      renderItem={(path) => (
                        <List.Item
                          onClick={() => setSelectedPathId(path.id)}
                          style={{ cursor: 'pointer', padding: '8px 12px' }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                              <Tag color={specialtyColors[path.specialty || ''] || 'default'}>
                                {path.specialty || '未知'}
                              </Tag>
                              <strong>{path.name}</strong>
                              <Tag>{path.stepCount} {t('paths.steps') || '步'}</Tag>
                            </Space>
                            {path.description && (
                              <div style={{ fontSize: 12, color: '#666' }}>{path.description}</div>
                            )}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}

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
      </Form>
    </Modal>
  );
}
