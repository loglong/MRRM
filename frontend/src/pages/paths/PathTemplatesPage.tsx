import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Select, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { pathsApi, PathTemplate } from '@/api/paths';
import PathTemplateFormModal from './PathTemplateFormModal';
import PathTemplateDetailDrawer from './PathTemplateDetailDrawer';

const { Title } = Typography;
const { Search } = Input;

const statusColors: Record<string, string> = {
  DRAFT: 'orange',
  ACTIVE: 'green',
  ARCHIVED: 'default',
};

export default function PathTemplatesPage() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<PathTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PathTemplate | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PathTemplate | null>(null);

  const statusLabels: Record<string, string> = {
    DRAFT: t('paths.draft') || 'Draft',
    ACTIVE: t('paths.active') || 'Active',
    ARCHIVED: t('paths.archived') || 'Archived',
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await pathsApi.list({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter,
        search: searchText || undefined,
      });
      setTemplates(response.data);
      setPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch (error) {
      message.error(t('common.error') || 'Failed to fetch path templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [pagination.current, pagination.pageSize, statusFilter, searchText]);

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setModalVisible(true);
  };

  const handleEdit = (template: PathTemplate) => {
    setEditingTemplate(template);
    setModalVisible(true);
  };

  const handleView = (template: PathTemplate) => {
    setSelectedTemplate(template);
    setDetailVisible(true);
  };

  const handleDuplicate = async (template: PathTemplate) => {
    try {
      await pathsApi.duplicate(template.id);
      message.success(t('common.success') || 'Template duplicated');
      fetchTemplates();
    } catch (error) {
      message.error(t('common.error') || 'Failed to duplicate template');
    }
  };

  const handleDelete = async (template: PathTemplate) => {
    try {
      await pathsApi.delete(template.id);
      message.success(t('common.success') || 'Template deleted');
      fetchTemplates();
    } catch (error) {
      message.error(t('common.error') || 'Failed to delete template');
    }
  };

  const handleModalOk = () => {
    setModalVisible(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const columns: ColumnsType<PathTemplate> = [
    {
      title: t('common.name') || 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a onClick={() => handleView(record)}>{name}</a>
      ),
    },
    {
      title: t('paths.description') || 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string | null) => desc || '-',
    },
    {
      title: t('paths.steps') || 'Steps',
      dataIndex: 'stepCount',
      key: 'stepCount',
      width: 80,
      render: (count: number) => count || 0,
    },
    {
      title: t('common.status') || 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: t('common.createTime') || 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('common.actions') || 'Action',
      key: 'action',
      width: 150,
      render: (_: any, record: PathTemplate) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(record)} />
          <Popconfirm
            title={t('paths.deleteConfirmTitle') || 'Delete template'}
            description={t('paths.deleteConfirm') || 'Are you sure?'}
            onConfirm={() => handleDelete(record)}
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
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>{t('paths.templates')}</Title>
      </div>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Search
            placeholder={t('paths.searchTemplate') || 'Search templates'}
            onSearch={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder={t('paths.filterByStatus') || 'Filter by status'}
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusChange}
            options={[
              { label: t('paths.allStatuses') || 'All Statuses', value: undefined },
              { label: statusLabels['DRAFT'], value: 'DRAFT' },
              { label: statusLabels['ACTIVE'], value: 'ACTIVE' },
              { label: statusLabels['ARCHIVED'], value: 'ARCHIVED' },
            ]}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('paths.createTemplate') || 'Create Template'}
        </Button>
      </div>

      {/* Templates Table */}
      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `${t('common.total') || 'Total'} ${total}`,
        }}
        onChange={handleTableChange}
      />

      {/* Add/Edit Modal */}
      <PathTemplateFormModal
        visible={modalVisible}
        template={editingTemplate}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          setEditingTemplate(null);
        }}
      />

      {/* Detail Drawer */}
      <PathTemplateDetailDrawer
        visible={detailVisible}
        template={selectedTemplate}
        onClose={() => {
          setDetailVisible(false);
          setSelectedTemplate(null);
        }}
        onUpdated={fetchTemplates}
      />
    </div>
  );
}
