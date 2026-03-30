import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { organizationsApi, Organization, CreateOrganizationDto, UpdateOrganizationDto } from '../../api/organizations';

const { Option } = Select;

const OrganizationsPage: React.FC = () => {
  const [data, setData] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [form] = Form.useForm();

  const fetchOrganizations = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await organizationsApi.list(page, pageSize);
      setData(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleTableChange = (paginationConfig: any) => {
    fetchOrganizations(paginationConfig.current, paginationConfig.pageSize);
  };

  const handleCreate = () => {
    setEditingOrg(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Organization) => {
    setEditingOrg(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      domain: record.domain,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await organizationsApi.delete(id);
      message.success('Organization deleted successfully');
      fetchOrganizations(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to delete organization');
    }
  };

  const handleSubmit = async (values: CreateOrganizationDto | UpdateOrganizationDto) => {
    try {
      if (editingOrg) {
        await organizationsApi.update(editingOrg.id, values as UpdateOrganizationDto);
        message.success('Organization updated successfully');
      } else {
        await organizationsApi.create(values as CreateOrganizationDto);
        message.success('Organization created successfully');
      }
      setModalVisible(false);
      fetchOrganizations(pagination.current, pagination.pageSize);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Operation failed';
      message.error(errorMsg);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'SUSPENDED':
        return 'red';
      case 'PENDING_VERIFICATION':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Organization> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColor(status)}>{status.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Organizations</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Organization
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingOrg ? 'Edit Organization' : 'Create Organization'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            <Input placeholder="e.g., ORG-001" disabled={!!editingOrg} />
          </Form.Item>

          <Form.Item name="domain" label="Domain">
            <Input placeholder="e.g., clinic-a.example.com" />
          </Form.Item>

          {editingOrg && (
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="ACTIVE">Active</Option>
                <Option value="SUSPENDED">Suspended</Option>
                <Option value="PENDING_VERIFICATION">Pending Verification</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingOrg ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationsPage;
