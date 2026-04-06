import { useState, useEffect } from 'react';
import { List, Typography, Select, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { followupsApi, FollowupRecord } from '@/api/followups';
import MobileFollowupCard from '@/components/mobile/MobileFollowupCard';
import './MobileTasksPage.css';

const { Text } = Typography;

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'PENDING', label: '待执行' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'MISSED', label: '已错过' },
  { value: 'CANCELLED', label: '已取消' },
];

export default function MobileTasksPage() {
  const navigate = useNavigate();
  const [followups, setFollowups] = useState<FollowupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFollowups = async (pageNum: number = 1, status?: string) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 20 };
      if (status) params.status = status;

      const response = await followupsApi.listRecords(params);
      if (pageNum === 1) {
        setFollowups(response.data);
      } else {
        setFollowups(prev => [...prev, ...response.data]);
      }
      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('Failed to fetch followups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchFollowups(1, statusFilter);
  }, [statusFilter]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFollowups(nextPage, statusFilter);
    }
  };

  return (
    <div className="mobile-tasks-page">
      <div className="mobile-tasks-filters">
        <Select
          placeholder="状态筛选"
          value={statusFilter || undefined}
          onChange={handleStatusChange}
          options={statusOptions}
          allowClear
          style={{ width: '100%' }}
        />
      </div>

      <List
        loading={loading && page === 1}
        dataSource={followups}
        loadMore={
          hasMore && !loading ? (
            <div className="load-more" onClick={handleLoadMore}>
              <Text type="secondary">加载更多</Text>
            </div>
          ) : null
        }
        renderItem={(followup: FollowupRecord) => (
          <MobileFollowupCard
            key={followup.id}
            id={followup.id}
            patientName={followup.patient?.name || '-'}
            type={followup.plan?.name || 'ROUTINE'}
            status={followup.status}
            planTime={followup.scheduledAt}
            content={followup.outcome || followup.notes || null}
            onClick={() => navigate('/followups')}
          />
        )}
      />
      {loading && page > 1 && (
        <div className="loading-more">
          <Spin size="small" />
        </div>
      )}
    </div>
  );
}