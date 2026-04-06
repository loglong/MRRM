import { useState, useEffect } from 'react';
import { List, Card, Tag, Typography, Search, Spin, PullToRefresh } from 'antd';
import { useNavigate } from 'react-router-dom';
import { patientsApi, Patient } from '@/api/patients';
import './MobilePatientList.css';

const { Text } = Typography;

const tierColors: Record<string, string> = {
  HIGH_VALUE: 'gold',
  REGULAR: 'default',
  LOST_RISK: 'red',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  CHURNED: 'red',
  DECEASED: 'default',
};

export default function MobilePatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = async (pageNum: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const response = await patientsApi.list({
        page: pageNum,
        limit: 20,
        search: search || undefined,
      });
      if (pageNum === 1) {
        setPatients(response.data);
      } else {
        setPatients(prev => [...prev, ...response.data]);
      }
      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatients(1, searchText);
  }, [searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPatients(nextPage, searchText);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPatients(1, searchText);
  };

  const tierLabels: Record<string, string> = {
    HIGH_VALUE: '高价值',
    REGULAR: '普通',
    LOST_RISK: '流失风险',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: '活跃',
    INACTIVE: '非活跃',
    CHURNED: '已流失',
    DECEASED: '已故',
  };

  return (
    <div className="mobile-patient-list">
      <div className="mobile-patient-search">
        <Search
          placeholder="搜索患者姓名或电话"
          onSearch={handleSearch}
          allowClear
        />
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <List
          loading={loading && page === 1}
          dataSource={patients}
          loadMore={
            hasMore && !loading ? (
              <div className="load-more" onClick={handleLoadMore}>
                <Text type="secondary">加载更多</Text>
              </div>
            ) : null
          }
          renderItem={(patient: Patient) => (
            <Card
              className="mobile-patient-card"
              size="small"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <div className="mobile-patient-header">
                <Text strong className="patient-name">{patient.name}</Text>
                <Tag color={tierColors[patient.tier]}>{tierLabels[patient.tier]}</Tag>
              </div>
              <div className="mobile-patient-info">
                <Text type="secondary">{patient.phone || '-'}</Text>
                <Tag color={statusColors[patient.status]}>{statusLabels[patient.status]}</Tag>
              </div>
              {patient.lastVisitAt && (
                <Text type="secondary" className="last-visit">
                  最后就诊: {new Date(patient.lastVisitAt).toLocaleDateString()}
                </Text>
              )}
            </Card>
          )}
        />
        {loading && page > 1 && (
          <div className="loading-more">
            <Spin size="small" />
          </div>
        )}
      </PullToRefresh>
    </div>
  );
}
