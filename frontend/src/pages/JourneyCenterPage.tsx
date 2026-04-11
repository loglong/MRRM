import { useState, useEffect } from 'react';
import { Table, Card, Drawer, Button, Input, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { patientsApi, Patient } from '../api/patients';
import { journeyApi, JourneyEvent } from '../api/journey';
import { Timeline } from '../components/Timeline';

const { Search } = Input;

export default function JourneyCenterPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
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

  const handleViewJourney = async (patient: Patient) => {
    setSelectedPatient(patient);
    setDrawerVisible(true);
    setJourneyLoading(true);
    try {
      const data = await journeyApi.getPatientJourney(patient.id, { page: 1, limit: 50 });
      setJourneyEvents(data.events);
    } catch (error) {
      message.error('Failed to load journey');
      setJourneyEvents([]);
    } finally {
      setJourneyLoading(false);
    }
  };

  const handleEventClick = (event: JourneyEvent) => {
    console.log('Event clicked:', event);
  };

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
        return <Button type="link" style={{ padding: 0 }}>{tier}</Button>;
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: Patient) => (
        <Button
          type="link"
          icon={<UserOutlined />}
          onClick={() => handleViewJourney(record)}
        >
          {t('journey.viewJourney')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{t('menu.journeyCenter')}</h1>
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
        title={selectedPatient ? `${selectedPatient.name} - ${t('menu.journeyCenter')}` : ''}
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <Timeline
          events={journeyEvents}
          loading={journeyLoading}
          onEventClick={handleEventClick}
          showFilters={true}
        />
      </Drawer>
    </div>
  );
}
