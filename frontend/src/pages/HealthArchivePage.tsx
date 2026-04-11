import { useState, useEffect } from 'react';
import { Table, Card, Drawer, Tag, Button, Input, List, Typography, message, Empty } from 'antd';
import { SearchOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { patientsApi, Patient } from '../api/patients';
import { healthApi, HealthArchive, HealthRecord } from '../api/health';

const { Search } = Input;
const { Text } = Typography;

export default function HealthArchivePage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [healthArchive, setHealthArchive] = useState<HealthArchive | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await patientsApi.list({ page: 1, limit: 100 });
      setPatients(data.data);
    } catch (error) {
      message.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleViewArchive = async (patient: Patient) => {
    setSelectedPatient(patient);
    setDrawerVisible(true);
    setHealthLoading(true);
    try {
      const data = await healthApi.getHealthArchive(patient.id);
      setHealthArchive(data);
    } catch (error) {
      message.error('Failed to load health archive');
      setHealthArchive(null);
    } finally {
      setHealthLoading(false);
    }
  };

  const renderRecordList = (records: HealthRecord[], title: string, emptyText: string) => (
    <div style={{ marginBottom: 24 }}>
      <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
        {title} ({records.length})
      </Text>
      {records.length > 0 ? (
        <List
          size="small"
          bordered
          dataSource={records}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.recordDate).format('YYYY-MM-DD')}
                  </Text>
                </div>
                {item.description && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {item.description}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 11 }}>
                  来源: {item.source}
                </Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    p.phone?.includes(searchText)
  );

  const columns = [
    {
      title: t('patient.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('patient.phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('patient.tier'),
      dataIndex: 'tier',
      key: 'tier',
      render: (tier: string) => {
        const colors: Record<string, string> = {
          HIGH_VALUE: 'gold',
          REGULAR: 'blue',
          LOST_RISK: 'red',
        };
        return <Tag color={colors[tier] || 'default'}>{tier}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: Patient) => (
        <Button
          type="link"
          icon={<MedicineBoxOutlined />}
          onClick={() => handleViewArchive(record)}
        >
          {t('health.viewArchive')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{t('menu.healthArchive')}</h1>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder={t('patient.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredPatients}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Drawer
        title={selectedPatient ? `${selectedPatient.name} - ${t('menu.healthArchive')}` : ''}
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {healthLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>{t('common.loading')}</div>
        ) : healthArchive ? (
          <div>
            {renderRecordList(
              healthArchive.allergies,
              t('health.allergies'),
              t('health.noAllergies')
            )}
            {renderRecordList(
              healthArchive.pastHistory,
              t('health.pastHistory'),
              t('health.noPastHistory')
            )}
            {renderRecordList(
              healthArchive.examResults,
              t('health.examResults'),
              t('health.noExamResults')
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            {t('health.noArchive')}
          </div>
        )}
      </Drawer>
    </div>
  );
}
