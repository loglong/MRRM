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
import { usersApi, type User, type CreateUserDto } from '../../api/users';

interface UserFormValues {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  roleIds?: string[];
}

export default function UsersPage() {
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
      message.error('Failed to load users');
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
      message.success('User deactivated');
      loadUsers(pagination.page);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleChangeStatus = async (userId: string, status: 'ACTIVE' | 'INACTIVE') => {
    try {
      await usersApi.changeStatus(userId, status);
      message.success(`User ${status === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      loadUsers(pagination.page);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to change status');
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
        message.success('User updated');
      } else {
        await usersApi.create(payload);
        message.success('User created');
      }

      setModalVisible(false);
      loadUsers(pagination.page);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Failed to save user');
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: User['roles']) =>
        roles && roles.length > 0
          ? roles.map((r) => <Tag key={r.role.id}>{r.role.name}</Tag>)
          : <span style={{ color: '#999' }}>No role</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : <span style={{ color: '#999' }}>Never</span>,
    },
    {
      title: 'Actions',
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
                  label: 'Activate',
                  disabled: user.status === 'ACTIVE',
                  onClick: () => handleChangeStatus(user.id, 'ACTIVE'),
                },
                {
                  key: 'deactivate',
                  label: 'Deactivate',
                  disabled: user.status === 'INACTIVE',
                  onClick: () => handleChangeStatus(user.id, 'INACTIVE'),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: (
                    <Popconfirm
                      title="Deactivate this user?"
                      description="The user will not be able to log in."
                      onConfirm={(e) => e?.stopPropagation()}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="Deactivate"
                      okButtonProps={{ danger: true }}
                    >
                      <span onClick={(e) => { e?.stopPropagation(); handleDelete(user.id); }}>
                        Deactivate
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
        <h2>User Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add User
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
        title={editingUser ? 'Edit User' : 'Create User'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        okText={editingUser ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="user@example.com" disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password placeholder="Min 8 characters" />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="+86 138 0000 0000" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
