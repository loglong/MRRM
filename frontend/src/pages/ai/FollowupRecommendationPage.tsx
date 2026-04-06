import { Card, Typography, Tag, Button, List, Empty, Space, Divider } from 'antd';
import { ClockCircleOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { followupRecommendationApi, FollowupRecommendation } from '@/api/followup-recommendation';

const { Title, Text, Paragraph } = Typography;

interface Props {
  patientId: string;
  onCreateFollowup?: () => void;
}

export default function FollowupRecommendationPage({ patientId, onCreateFollowup }: Props) {
  const [recommendation, setRecommendation] = useState<FollowupRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendation();
  }, [patientId]);

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await followupRecommendationApi.get(patientId);
      setRecommendation(data);
    } catch (err: any) {
      console.error('Failed to load recommendation', err);
      if (err.response?.status === 404) {
        setError('患者未找到');
      } else {
        setError('加载推荐失败');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card loading />;
  }

  if (error || !recommendation) {
    return (
      <Card title="个性化随访推荐">
        <Empty description={error || '暂无推荐数据'} />
      </Card>
    );
  }

  return (
    <Card
      title="个性化随访推荐"
      extra={
        <Button type="primary" onClick={onCreateFollowup}>
          创建随访任务
        </Button>
      }
    >
      {/* 推荐内容 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>
          <MessageOutlined style={{ marginRight: 8 }} />
          推荐随访内容
        </Title>
        <List
          size="small"
          dataSource={recommendation.recommendedContent}
          renderItem={(content, index) => (
            <List.Item style={{ padding: '8px 0' }}>
              <Text>{index + 1}. {content}</Text>
            </List.Item>
          )}
        />
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 推荐理由 */}
      {recommendation.reasons && recommendation.reasons.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 12 }}>
            推荐理由
          </Title>
          <Space size={[8, 8]} wrap>
            {recommendation.reasons.map((reason, i) => (
              <Tag key={i} color="blue">{reason}</Tag>
            ))}
          </Space>
        </div>
      )}

      <Divider style={{ margin: '16px 0' }} />

      {/* 最佳联系时机 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          最佳联系时机
        </Title>
        <Tag color="green" style={{ fontSize: 16, padding: '4px 12px' }}>
          {recommendation.optimalTime}
        </Tag>
        <Text type="secondary" style={{ marginLeft: 12 }}>
          基于历史响应率分析
        </Text>
      </div>

      {/* 季节/节日调整 */}
      {recommendation.seasonalAdjustment && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 12 }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {recommendation.seasonalAdjustment.festival ? '节日关怀' : '季节关怀'}
            </Title>
            {recommendation.seasonalAdjustment.festival && (
              <Tag color="gold" style={{ marginBottom: 8 }}>
                {recommendation.seasonalAdjustment.festival}
              </Tag>
            )}
            <Paragraph>
              <Text strong>{recommendation.seasonalAdjustment.topic}</Text>
            </Paragraph>
          </div>
        </>
      )}

      {/* 置信度 */}
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          推荐置信度: {(recommendation.confidence * 100).toFixed(0)}%
          {recommendation.confidence < 0.6 && ' (数据不足，建议人工确认)'}
        </Text>
      </div>
    </Card>
  );
}
