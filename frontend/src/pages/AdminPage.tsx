import { Tabs, Table, Button, Tag, Card, Typography, Space, Descriptions, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, UserOutlined, TeamOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { organizationsApi, Organization, CreateOrganizationDto } from '../api/organizations';

const { Title } = Typography;

export default function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orgModalVisible, setOrgModalVisible] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchOrganizations = async () => {
    setOrgLoading(true);
    try {
      const response = await organizationsApi.list(1, 100);
      setOrganizations(response.data);
    } catch (error) {
      message.error('Failed to load organizations');
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleAddOrg = () => {
    form.resetFields();
    setOrgModalVisible(true);
  };

  const handleOrgSubmit = async (values: CreateOrganizationDto) => {
    try {
      await organizationsApi.create(values);
      message.success('Organization created successfully');
      setOrgModalVisible(false);
      fetchOrganizations();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to create organization';
      message.error(errorMsg);
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: <span><UserOutlined /> {t('admin.overview') || 'Overview'}</span>,
      children: (
        <div>
          <Title level={4}>{t('admin.adminOverview') || 'Administration Overview'}</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card
              title={t('users.title')}
              extra={<Button type="link" onClick={() => navigate('/admin/users')}>{t('admin.manageUsers')} <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label={t('users.title')}>
                  {t('admin.userManagementDesc') || 'Create, edit, and deactivate user accounts within your organization.'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title={t('roles.title')}
              extra={<Button type="link" onClick={() => navigate('/admin/roles')}>{t('admin.manageRoles')} <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label={t('roles.permissions')}>
                  {t('admin.roleDesc') || 'Configure roles with menu and button-level permissions.'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title={t('permissions.title')}
              extra={<Button type="link" onClick={() => navigate('/admin/permissions')}>{t('admin.viewPermissions')} <ArrowRightOutlined /></Button>}
            >
              <Descriptions>
                <Descriptions.Item label={t('permissions.title')}>
                  {t('admin.permissionDesc') || 'Reference list of all available menu and button permissions.'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </div>
      ),
    },
    {
      key: 'users',
      label: <span><UserOutlined /> {t('users.title')}</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>{t('users.addUser')}</Button>
          </div>
          <Table
            dataSource={[]}
            rowKey="id"
            columns={[
              { title: t('common.name'), dataIndex: 'name', key: 'name' },
              { title: t('common.email'), dataIndex: 'email', key: 'email' },
              { title: t('roles.title'), dataIndex: 'role', key: 'role' },
              { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'orange'}>{s}</Tag> },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'organizations',
      label: <span><TeamOutlined /> {t('admin.organizations') || 'Organizations'}</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddOrg}>
              {t('admin.addOrg') || 'Add Organization'}
            </Button>
          </div>
          <Table
            dataSource={organizations}
            rowKey="id"
            loading={orgLoading}
            columns={[
              { title: t('common.name'), dataIndex: 'name', key: 'name' },
              { title: t('common.code'), dataIndex: 'code', key: 'code' },
              { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : s === 'SUSPENDED' ? 'red' : 'orange'}>{s}</Tag> },
              { title: t('common.createTime'), dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'audit',
      label: <span><FileTextOutlined /> {t('admin.auditLogs') || 'Audit Logs'}</span>,
      children: (
        <Table
          dataSource={[]}
          rowKey="id"
          columns={[
            { title: t('admin.user'), dataIndex: 'userName', key: 'userName' },
            { title: t('admin.action'), dataIndex: 'action', key: 'action' },
            { title: t('admin.entity'), dataIndex: 'entityType', key: 'entityType' },
            { title: t('common.time'), dataIndex: 'createdAt', key: 'createdAt' },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>{t('menu.admin')}</h1>
      <Tabs items={tabItems} />

      <Modal
        title={t('admin.addOrg') || 'Add Organization'}
        open={orgModalVisible}
        onCancel={() => setOrgModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleOrgSubmit}>
          <Form.Item
            name="name"
            label="Organization Name"
            rules={[{ required: true, message: 'Please enter organization name' }]}
          >
            <Input placeholder="e.g., Dental Clinic A" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Organization Code"
            rules={[
              { required: true, message: 'Please enter organization code' },
              { pattern: /^[A-Z0-9_-]+$/i, message: 'Code must be alphanumeric' },
            ]}
            extra="Unique identifier, e.g., ORG-001"
          >
            <Input placeholder="e.g., ORG-001" />
          </Form.Item>

          <Form.Item name="domain" label="Domain">
            <Input placeholder="e.g., clinic-a.example.com" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setOrgModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Create</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
