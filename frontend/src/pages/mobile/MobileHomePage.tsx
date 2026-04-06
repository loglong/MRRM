import { useState, useEffect } from 'react';
import { Card, Typography, Spin, Statistic, Row, Col } from 'antd';
import { TeamOutlined, FileTextOutlined, BellOutlined, AlertOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { patientsApi } from '@/api/patients';
import { demandsApi } from '@/api/demands';
import { followupsApi } from '@/api/followups';
import MobileDemandCard from '@/components/mobile/MobileDemandCard';
import MobileFollowupCard from '@/components/mobile/MobileFollowupCard';
import './MobileHomePage.css';

const { Title, Text } = Typography;

export default function MobileHomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPatients: 0, activeDemands: 0, pendingFollowups: 0, highRiskPatients: 0 });
  const [recentDemands, setRecentDemands] = useState<any[]>([]);
  const [pendingFollowups, setPendingFollowups] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientStats, demandRes, followupRes] = await Promise.all([
        patientsApi.getStats().catch(() => ({ total: 0, byTier: { HIGH_VALUE: 0, REGULAR: 0, LOST_RISK: 0 } })),
        demandsApi.list({ page: 1, limit: 5 }).catch(() => ({ data: [] })),
        followupsApi.listPending({ page: 1, limit: 5 }).catch(() => ({ data: [] })),
      ]);

      setStats({
        totalPatients: patientStats.total || 0,
        activeDemands: demandRes.data?.length || 0,
        pendingFollowups: followupRes.data?.length || 0,
        highRiskPatients: patientStats.byTier?.LOST_RISK || 0,
      });

      if (demandRes.data) {
        setRecentDemands(demandRes.data.slice(0, 5));
      }
      if (followupRes.data) {
        setPendingFollowups(followupRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load mobile home data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-home-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mobile-home">
      <div className="mobile-home-header">
        <Title level={4}>医疗患者关系管理</Title>
        <Text type="secondary">移动端工作台</Text>
      </div>

      <Row gutter={[8, 8]} className="mobile-stats">
        <Col span={12}>
          <Card size="small" className="stat-card" onClick={() => navigate('/mobile/patients')}>
            <Statistic
              title="患者总数"
              value={stats.totalPatients}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="stat-card" onClick={() => navigate('/mobile/demands')}>
            <Statistic
              title="活跃需求"
              value={stats.activeDemands}
              prefix={<FileTextOutlined />}
              valueStyle={{ fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="stat-card" onClick={() => navigate('/mobile/tasks')}>
            <Statistic
              title="待执行随访"
              value={stats.pendingFollowups}
              prefix={<BellOutlined />}
              valueStyle={{ fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="stat-card risk" onClick={() => navigate('/churn-risk')}>
            <Statistic
              title="高风险患者"
              value={stats.highRiskPatients}
              prefix={<AlertOutlined />}
              valueStyle={{ fontSize: '20px', color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mobile-section">
        <div className="section-header">
          <Text strong>最近需求</Text>
          <Text type="secondary" onClick={() => navigate('/mobile/demands')}>查看更多</Text>
        </div>
        {recentDemands.length > 0 ? (
          recentDemands.map(demand => (
            <MobileDemandCard
              key={demand.id}
              id={demand.id}
              patientName={demand.patientName}
              type={demand.type}
              title={demand.title}
              status={demand.status}
              priority={demand.priority}
              createdAt={demand.createdAt}
              onClick={() => navigate(`/demands`)}
            />
          ))
        ) : (
          <Text type="secondary">暂无数据</Text>
        )}
      </div>

      <div className="mobile-section">
        <div className="section-header">
          <Text strong>待执行随访</Text>
          <Text type="secondary" onClick={() => navigate('/mobile/tasks')}>查看更多</Text>
        </div>
        {pendingFollowups.length > 0 ? (
          pendingFollowups.map(followup => (
            <MobileFollowupCard
              key={followup.id}
              id={followup.id}
              patientName={followup.patientName}
              type={followup.type}
              status={followup.status}
              planTime={followup.planTime}
              content={followup.content}
              onClick={() => navigate('/followups')}
            />
          ))
        ) : (
          <Text type="secondary">暂无待执行随访</Text>
        )}
      </div>
    </div>
  );
}
