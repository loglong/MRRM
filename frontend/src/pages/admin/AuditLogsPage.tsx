import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  DatePicker,
  Select,
  message,
  Tag,
  Card,
  Row,
  Col,
} from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { auditApi, type AuditLog, type AuditLogFilters } from '../../api/audit';

const { RangePicker } = DatePicker;

const ACTION_OPTIONS = [
  { value: 'CREATE', label: 'Create' },
  { value: 'READ', label: 'Read' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'Patient', label: 'Patient' },
  { value: 'Demand', label: 'Demand' },
  { value: 'User', label: 'User' },
  { value: 'Organization', label: 'Organization' },
  { value: 'Role', label: 'Role' },
  { value: 'Path', label: 'Path' },
  { value: 'Touchpoint', label: 'Touchpoint' },
  { value: 'Followup', label: 'Followup' },
];

const STATUS_COLORS: Record<string, string> = {
  '2xx': 'green',
  '3xx': 'blue',
  '4xx': 'orange',
  '5xx': 'red',
};

function getStatusColor(status: number | null): string {
  if (!status) return 'default';
  if (status >= 200 && status < 300) return STATUS_COLORS['2xx'] || 'green';
  if (status >= 300 && status < 400) return STATUS_COLORS['3xx'] || 'blue';
  if (status >= 400 && status < 500) return STATUS_COLORS['4xx'] || 'orange';
  return STATUS_COLORS['5xx'] || 'red';
}

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [filters, setFilters] = useState<AuditLogFilters>({});

  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await auditApi.getLogs({ page, limit: 50, filters });
      setLogs(data.data);
      setPagination((prev) => ({ ...prev, ...data.pagination, page }));
    } catch {
      message.error(t('common.error') || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadLogs(1);
  };

  const handleReset = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadLogs(1);
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0]!.format('YYYY-MM-DD'),
        endDate: dates[1]!.format('YYYY-MM-DD'),
      }));
    } else {
      setFilters((prev) => {
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleExport = () => {
    if (!filters.startDate || !filters.endDate) {
      message.warning('Please select a date range for export');
      return;
    }
    const url = auditApi.exportLogs(filters.startDate, filters.endDate);
    window.open(url, '_blank');
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'User',
      key: 'user',
      width: 150,
      render: (_, record) => record.user?.email || record.userId || 'System',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (val: string) => <Tag color={val === 'DELETE' ? 'red' : val === 'CREATE' ? 'green' : 'blue'}>{val}</Tag>,
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
    },
    {
      title: 'Method',
      dataIndex: 'requestMethod',
      key: 'requestMethod',
      width: 80,
    },
    {
      title: 'Path',
      dataIndex: 'requestPath',
      key: 'requestPath',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'responseStatus',
      key: 'responseStatus',
      width: 80,
      render: (val: number | null) => val ? <Tag color={getStatusColor(val)}>{val}</Tag> : '-',
    },
    {
      title: 'Error',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      width: 150,
      ellipsis: true,
      render: (val: string | null) => val ? <span style={{ color: 'red' }}>{val}</span> : '-',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Audit Logs"
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={!filters.startDate || !filters.endDate}
          >
            Export CSV
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
          <Row gutter={16} align="middle">
            <Col flex="none">
              <RangePicker onChange={handleDateChange} />
            </Col>
            <Col flex="none">
              <Select
                placeholder="Action"
                allowClear
                style={{ width: 120 }}
                options={ACTION_OPTIONS}
                value={filters.action}
                onChange={(val) => setFilters((prev) => ({ ...prev, action: val }))}
              />
            </Col>
            <Col flex="none">
              <Select
                placeholder="Entity Type"
                allowClear
                style={{ width: 140 }}
                options={ENTITY_TYPE_OPTIONS}
                value={filters.entityType}
                onChange={(val) => setFilters((prev) => ({ ...prev, entityType: val }))}
              />
            </Col>
            <Col flex="none">
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  Search
                </Button>
                <Button onClick={handleReset}>Reset</Button>
              </Space>
            </Col>
          </Row>
        </Space>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          }}
          onChange={(pag) => loadLogs(pag.current)}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
}
