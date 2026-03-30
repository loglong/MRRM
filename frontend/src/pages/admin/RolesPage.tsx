import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Tag,
  Card,
  Typography,
  Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { rolesApi, type Role, type CreateRoleDto } from '../../api/roles';
import { permissionsApi, type Permission } from '../../api/permissions';

const { Text } = Typography;

interface RoleFormValues {
  name: string;
  code: string;
  description?: string;
  permissionIds?: string[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm<RoleFormValues>();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        rolesApi.list(),
        permissionsApi.list(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error: any) {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useState(() => {
    loadData();
  });

  const handleCreate = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (roleId: string) => {
    try {
      await rolesApi.delete(roleId);
      message.success('Role deleted');
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateRoleDto = {
        ...values,
        permissionIds: selectedPermissions,
      };

      if (editingRole) {
        await rolesApi.update(editingRole.id, payload);
        message.success('Role updated');
      } else {
        await rolesApi.create(payload);
        message.success('Role created');
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Failed to save role');
      }
    }
  };

  const groupedPermissions = {
    MENU: permissions.filter((p) => p.type === 'MENU'),
    BUTTON: permissions.filter((p) => p.type === 'BUTTON'),
  };

  const columns: ColumnsType<Role> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Users',
      key: 'users',
      render: (_: any, role: Role) => role._count?.users ?? 0,
    },
    {
      title: 'System',
      dataIndex: 'isSystem',
      key: 'isSystem',
      render: (isSystem: boolean) => (isSystem ? <Tag color="blue">System</Tag> : <Tag>Custom</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, role: Role) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(role)}
            disabled={role.isSystem}
          />
          <Popconfirm
            title="Delete this role?"
            description="This will remove all permissions from users with this role."
            onConfirm={() => handleDelete(role.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            disabled={role.isSystem}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={role.isSystem}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (role: Role) => {
    const rolePerms = role.permissions || [];
    return (
      <Card size="small" title="Assigned Permissions">
        {rolePerms.length === 0 ? (
          <Text type="secondary">No permissions assigned</Text>
        ) : (
          <Space wrap>
            {rolePerms.map((p) => (
              <Tag key={p.id} color={p.type === 'MENU' ? 'blue' : 'green'}>
                {p.name} ({p.code})
              </Tag>
            ))}
          </Space>
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Roles Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Role
        </Button>
      </div>

      <Alert
        message="Role Permissions"
        description="Click on a row to expand and view assigned permissions. System roles cannot be modified or deleted."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingRole ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" initialValues={{ code: '' }}>
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="e.g., Doctor" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Role Code"
            rules={[
              { required: true, message: 'Please enter role code' },
              { pattern: /^[A-Z0-9_]+$/, message: 'Code must be uppercase letters, numbers, and underscores only' },
            ]}
            extra="Unique identifier for the role (e.g., DOCTOR, ORG_ADMIN)"
          >
            <Input
              placeholder="e.g., DOCTOR"
              disabled={!!editingRole}
              onChange={(e) => {
                form.setFieldValue('code', e.target.value.toUpperCase());
              }}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Optional description" rows={2} />
          </Form.Item>

          <Form.Item label="Permissions">
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, maxHeight: 300, overflowY: 'auto' }}>
              {editingRole?.isSystem && (
                <Alert
                  message="System roles have fixed permissions"
                  type="warning"
                  style={{ marginBottom: 12 }}
                />
              )}

              <div style={{ marginBottom: 16 }}>
                <Typography.Title level={5}>Menu Permissions</Typography.Title>
                <Select
                  mode="multiple"
                  placeholder="Select menu permissions"
                  value={selectedPermissions.filter((id) =>
                    groupedPermissions.MENU.find((p) => p.id === id)
                  )}
                  onChange={(ids) => {
                    const otherPerms = selectedPermissions.filter(
                      (id) => !groupedPermissions.MENU.find((p) => p.id === id)
                    );
                    setSelectedPermissions([...otherPerms, ...ids]);
                  }}
                  style={{ width: '100%' }}
                  disabled={editingRole?.isSystem}
                >
                  {groupedPermissions.MENU.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <Typography.Title level={5}>Button Permissions</Typography.Title>
                <Select
                  mode="multiple"
                  placeholder="Select button permissions"
                  value={selectedPermissions.filter((id) =>
                    groupedPermissions.BUTTON.find((p) => p.id === id)
                  )}
                  onChange={(ids) => {
                    const otherPerms = selectedPermissions.filter(
                      (id) => !groupedPermissions.BUTTON.find((p) => p.id === id)
                    );
                    setSelectedPermissions([...otherPerms, ...ids]);
                  }}
                  style={{ width: '100%' }}
                  disabled={editingRole?.isSystem}
                >
                  {groupedPermissions.BUTTON.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
