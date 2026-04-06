import { useState, useEffect } from 'react';
import { List, Card, Tag, Typography, Select, Spin, PullToRefresh } from 'antd';
import { useNavigate } from 'react-router-dom';
import { demandsApi, Demand, DemandStatus, DemandType, DemandPriority } from '@/api/demands';
import MobileDemandCard from '@/components/mobile/MobileDemandCard';
import './MobileDemandsPage.css';

const { Text } = Typography;

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'OPEN', label: '开放' },
  { value: 'IN_PROGRESS', label: '进行中' },
  { value: 'PENDING', label: '待成交' },
  { value: 'FULFILLED', label: '已成交' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'LOST', label: '已流失' },
];

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'CONSULTATION', label: '咨询' },
  { value: 'TREATMENT', label: '治疗' },
  { value: 'FOLLOWUP', label: '随访' },
  { value: 'OTHER', label: '其他' },
];

export default function MobileDemandsPage() {
  const navigate = useNavigate();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDemands = async (pageNum: number = 1, status?: string, type?: string) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 20 };
      if (status) params.status = status;
      if (type) params.type = type;

      const response = await demandsApi.list(params);
      if (pageNum === 1) {
        setDemands(response.data);
      } else {
        setDemands(prev => [...prev, ...response.data]);
      }
      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('Failed to fetch demands', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchDemands(1, statusFilter, typeFilter);
  }, [statusFilter, typeFilter]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDemands(nextPage, statusFilter, typeFilter);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchDemands(1, statusFilter, typeFilter);
  };

  return (
    <div className="mobile-demands-page">
      <div className="mobile-demands-filters">
        <Select
          placeholder="状态筛选"
          value={statusFilter || undefined}
          onChange={handleStatusChange}
          options={statusOptions}
          allowClear
          style={{ flex: 1 }}
        />
        <Select
          placeholder="类型筛选"
          value={typeFilter || undefined}
          onChange={handleTypeChange}
          options={typeOptions}
          allowClear
          style={{ flex: 1 }}
        />
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <List
          loading={loading && page === 1}
          dataSource={demands}
          loadMore={
            hasMore && !loading ? (
              <div className="load-more" onClick={handleLoadMore}>
                <Text type="secondary">加载更多</Text>
              </div>
            ) : null
          }
          renderItem={(demand: Demand) => (
            <MobileDemandCard
              key={demand.id}
              id={demand.id}
              patientName={demand.patient?.name || '-'}
              type={demand.type}
              title={demand.title}
              status={demand.status}
              priority={demand.priority}
              createdAt={demand.createdAt}
              onClick={() => navigate(`/demands`)}
            />
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
