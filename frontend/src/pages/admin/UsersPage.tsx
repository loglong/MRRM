import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Tag,
  Dropdown,
} from 'antd';
import { PlusOutlined, EditOutlined, DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { usersApi, type User, type CreateUserDto } from '../../api/users';

interface UserFormValues {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  roleIds?: string[];
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormValues>();

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const data = await usersApi.list({ page, limit: 20 });
      setUsers(data.data);
      setPagination((prev) => ({ ...prev, ...data.pagination, page }));
    } catch {
      message.error(t('common.error') || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      phone: user.phone,
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await usersApi.delete(userId);
      message.success(t('users.deactivated') || 'User deactivated');
      loadUsers(pagination.page);
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('common.error'));
    }
  };

  const handleChangeStatus = async (userId: string, status: 'ACTIVE' | 'INACTIVE') => {
    try {
      await usersApi.changeStatus(userId, status);
      message.success(status === 'ACTIVE' ? t('users.activated') : t('users.deactivated'));
      loadUsers(pagination.page);
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('common.error'));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateUserDto = {
        email: editingUser ? (users.find((u) => u.id === editingUser.id)?.email ?? '') : values.email,
        password: values.password ?? '',
        name: values.name,
        phone: values.phone,
      };

      if (editingUser) {
        await usersApi.update(editingUser.id, payload);
        message.success(t('common.success'));
      } else {
        await usersApi.create(payload);
        message.success(t('common.success'));
      }

      setModalVisible(false);
      loadUsers(pagination.page);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || t('common.error'));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'orange';
      case 'LOCKED': return 'red';
      case 'PENDING_VERIFICATION': return 'blue';
      default: return 'default';
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('patients.phone') || 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('roles.title'),
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: User['roles']) =>
        roles && roles.length > 0
          ? roles.map((r) => <Tag key={r.role.id}>{r.role.name}</Tag>)
          : <span style={{ color: '#999' }}>{t('users.noRole') || 'No role'}</span>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: t('users.lastLogin') || 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : <span style={{ color: '#999' }}>{t('users.never') || 'Never'}</span>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, user: User) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(user)} />

          <Dropdown
            menu={{
              items: [
                {
                  key: 'activate',
                  label: t('users.activate') || 'Activate',
                  disabled: user.status === 'ACTIVE',
                  onClick: () => handleChangeStatus(user.id, 'ACTIVE'),
                },
                {
                  key: 'deactivate',
                  label: t('users.deactivate') || 'Deactivate',
                  disabled: user.status === 'INACTIVE',
                  onClick: () => handleChangeStatus(user.id, 'INACTIVE'),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: (
                    <Popconfirm
                      title={t('users.deactivateConfirm') || 'Deactivate this user?'}
                      description={t('users.deactivateDesc') || 'The user will not be able to log in.'}
                      onConfirm={(e) => e?.stopPropagation()}
                      onCancel={(e) => e?.stopPropagation()}
                      okText={t('users.deactivate') || 'Deactivate'}
                      okButtonProps={{ danger: true }}
                    >
                      <span onClick={(e) => { e?.stopPropagation(); handleDelete(user.id); }}>
                        {t('users.deactivate') || 'Deactivate'}
                      </span>
                    </Popconfirm>
                  ),
                  danger: true,
                },
              ],
            }}
          >
            <Button type="text" icon={<DownOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('users.title')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {t('users.addUser')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          pageSize: pagination.limit,
          onChange: (page) => loadUsers(page),
        }}
      />

      <Modal
        title={editingUser ? t('users.editUser') : t('users.addUser')}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        okText={editingUser ? t('common.save') : t('users.createUser')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label={t('common.email')}
            rules={[
              { required: true, message: t('users.enterEmail') || 'Please enter email' },
              { type: 'email', message: t('users.validEmail') || 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="user@example.com" disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label={t('common.password')}
              rules={[
                { required: true, message: t('users.enterPassword') || 'Please enter password' },
                { min: 8, message: t('users.passwordMin') || 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password placeholder={t('users.passwordMin') || 'Min 8 characters'} />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label={t('users.fullName') || 'Full Name'}
            rules={[{ required: true, message: t('users.enterName') || 'Please enter name' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item name="phone" label={t('patients.phone') || 'Phone'}>
            <Input placeholder="+86 138 0000 0000" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
