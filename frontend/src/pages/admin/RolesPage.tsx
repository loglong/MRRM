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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      message.error(t('common.error') || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

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
      message.success(t('common.success'));
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('common.error'));
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
        message.success(t('common.success'));
      } else {
        await rolesApi.create(payload);
        message.success(t('common.success'));
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || t('common.error'));
      }
    }
  };

  const groupedPermissions = {
    MENU: permissions.filter((p) => p.type === 'MENU'),
    BUTTON: permissions.filter((p) => p.type === 'BUTTON'),
  };

  const columns: ColumnsType<Role> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.code'),
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('users.title'),
      key: 'users',
      render: (_: any, role: Role) => role._count?.users ?? 0,
    },
    {
      title: t('roles.system') || 'System',
      dataIndex: 'isSystem',
      key: 'isSystem',
      render: (isSystem: boolean) => (isSystem ? <Tag color="blue">{t('roles.system') || 'System'}</Tag> : <Tag>{t('roles.custom') || 'Custom'}</Tag>),
    },
    {
      title: t('common.actions'),
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
            title={t('roles.deleteConfirm') || 'Delete this role?'}
            description={t('roles.deleteDesc') || 'This will remove all permissions from users with this role.'}
            onConfirm={() => handleDelete(role.id)}
            okText={t('common.delete')}
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
      <Card size="small" title={t('roles.assignedPermissions') || 'Assigned Permissions'}>
        {rolePerms.length === 0 ? (
          <Text type="secondary">{t('roles.noPermissions') || 'No permissions assigned'}</Text>
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
        <h2>{t('roles.title')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {t('roles.addRole')}
        </Button>
      </div>

      <Alert
        message={t('roles.rolePermissions') || 'Role Permissions'}
        description={t('roles.roleAlertDesc') || 'Click on a row to expand and view assigned permissions. System roles cannot be modified or deleted.'}
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
        title={editingRole ? t('roles.editRole') : t('roles.addRole')}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingRole ? t('common.save') : t('roles.createRole')}
      >
        <Form form={form} layout="vertical" initialValues={{ code: '' }}>
          <Form.Item
            name="name"
            label={t('roles.roleName') || 'Role Name'}
            rules={[{ required: true, message: t('roles.enterRoleName') || 'Please enter role name' }]}
          >
            <Input placeholder="e.g., Doctor" />
          </Form.Item>

          <Form.Item
            name="code"
            label={t('roles.roleCode') || 'Role Code'}
            rules={[
              { required: true, message: t('roles.enterRoleCode') || 'Please enter role code' },
              { pattern: /^[A-Z0-9_]+$/, message: t('roles.codePattern') || 'Code must be uppercase letters, numbers, and underscores only' },
            ]}
            extra={t('roles.codeExtra') || 'Unique identifier for the role (e.g., DOCTOR, ORG_ADMIN)'}
          >
            <Input
              placeholder="e.g., DOCTOR"
              disabled={!!editingRole}
              onChange={(e) => {
                form.setFieldValue('code', e.target.value.toUpperCase());
              }}
            />
          </Form.Item>

          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea placeholder={t('roles.descriptionPlaceholder') || 'Optional description'} rows={2} />
          </Form.Item>

          <Form.Item label={t('roles.permissions')}>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, maxHeight: 300, overflowY: 'auto' }}>
              {editingRole?.isSystem && (
                <Alert
                  message={t('roles.systemFixed') || 'System roles have fixed permissions'}
                  type="warning"
                  style={{ marginBottom: 12 }}
                />
              )}

              <div style={{ marginBottom: 16 }}>
                <Typography.Title level={5}>{t('permissions.menuPermissions') || 'Menu Permissions'}</Typography.Title>
                <Select
                  mode="multiple"
                  placeholder={t('permissions.selectMenu') || 'Select menu permissions'}
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
                <Typography.Title level={5}>{t('permissions.buttonPermissions') || 'Button Permissions'}</Typography.Title>
                <Select
                  mode="multiple"
                  placeholder={t('permissions.selectButton') || 'Select button permissions'}
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
