import { Button, List, Empty, Space, Progress, Typography } from 'antd';
import {
  ClockCircleOutlined,
  MessageOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { followupRecommendationApi, FollowupRecommendation } from '@/api/followup-recommendation';

const { Text, Title } = Typography;

// Apple Design System Colors
const APPLE_BLUE = '#0071e3';
const APPLE_LIGHT_BG = '#f5f5f7';
const APPLE_NEAR_BLACK = '#1d1d1f';
const APPLE_TEXT_SECONDARY = 'rgba(0, 0, 0, 0.48)';

// Support both string and object formats for recommendedContent
interface RecommendedItem {
  type?: string;
  content: string;
}

function isRecommendedObject(item: any): item is RecommendedItem {
  return item && typeof item === 'object' && item.content;
}

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

  // Loading State - Apple Skeleton
  if (loading) {
    return (
      <div
        style={{
          background: APPLE_LIGHT_BG,
          borderRadius: 12,
          padding: 32,
          minHeight: 400,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Space align="center" size={12}>
            <RobotOutlined style={{ fontSize: 24, color: APPLE_BLUE }} />
            <Title
              level={3}
              style={{
                margin: 0,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontWeight: 600,
                fontSize: 21,
                lineHeight: 1.19,
                letterSpacing: 0.231,
                color: APPLE_NEAR_BLACK,
              }}
            >
              个性化随访推荐
            </Title>
          </Space>
        </div>

        {/* AI Processing State */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 8,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Space size={12}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `${APPLE_BLUE}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RobotOutlined style={{ fontSize: 20, color: APPLE_BLUE }} />
              </div>
              <div>
                <Text
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, Arial, sans-serif',
                    fontSize: 17,
                    fontWeight: 600,
                    color: APPLE_NEAR_BLACK,
                  }}
                >
                  AI 正在分析
                </Text>
                <br />
                <Text
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, Arial, sans-serif',
                    fontSize: 14,
                    color: APPLE_TEXT_SECONDARY,
                  }}
                >
                  正在生成个性化随访建议...
                </Text>
              </div>
            </Space>
            <Progress percent={75} strokeColor={APPLE_BLUE} showInfo={false} />
          </Space>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !recommendation) {
    return (
      <div
        style={{
          background: APPLE_LIGHT_BG,
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <Empty
          description={
            <Text
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, Arial, sans-serif',
                fontSize: 17,
                color: APPLE_TEXT_SECONDARY,
              }}
            >
              {error || '暂无推荐数据'}
            </Text>
          }
        />
      </div>
    );
  }

  // Success State - Apple Design
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, Arial, sans-serif' }}>
      {/* Header Section */}
      <div
        style={{
          background: '#000000',
          borderRadius: '12px 12px 0 0',
          padding: '24px 24px 20px',
        }}
      >
        <Space align="center" size={12}>
          <RobotOutlined style={{ fontSize: 24, color: '#ffffff' }} />
          <Title
            level={3}
            style={{
              margin: 0,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 600,
              fontSize: 21,
              lineHeight: 1.19,
              letterSpacing: 0.231,
              color: '#ffffff',
            }}
          >
            个性化随访推荐
          </Title>
        </Space>
      </div>

      {/* Main Content */}
      <div
        style={{
          background: APPLE_LIGHT_BG,
          borderRadius: '0 0 12px 12px',
          padding: 24,
        }}
      >
        {/* Recommended Content Section */}
        <div style={{ marginBottom: 24 }}>
          <Space size={8} style={{ marginBottom: 16 }}>
            <MessageOutlined style={{ color: APPLE_BLUE, fontSize: 16 }} />
            <Text
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", Helvetica, Arial, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                color: APPLE_NEAR_BLACK,
                letterSpacing: -0.24,
              }}
            >
              推荐随访内容
            </Text>
          </Space>

          <List
            dataSource={recommendation.recommendedContent}
            renderItem={(item: any, index: number) => {
              const content = isRecommendedObject(item) ? item.content : String(item);
              const type = isRecommendedObject(item) ? item.type : null;
              return (
                <List.Item
                  style={{
                    background: '#ffffff',
                    borderRadius: 8,
                    padding: '16px',
                    marginBottom: 8,
                    border: 'none',
                  }}
                >
                  <Space size={12} style={{ width: '100%' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: `${APPLE_BLUE}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: APPLE_BLUE,
                        }}
                      >
                        {index + 1}
                      </Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      {type && (
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: APPLE_TEXT_SECONDARY,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          {type}
                        </Text>
                      )}
                      <Text
                        style={{
                          fontSize: 17,
                          color: APPLE_NEAR_BLACK,
                          lineHeight: 1.4,
                        }}
                      >
                        {content}
                      </Text>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>

        {/* Reasons Section */}
        {recommendation.reasons && recommendation.reasons.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Space size={8} style={{ marginBottom: 16 }}>
              <CheckCircleOutlined style={{ color: APPLE_BLUE, fontSize: 16 }} />
              <Text
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", Helvetica, Arial, sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  color: APPLE_NEAR_BLACK,
                  letterSpacing: -0.24,
                }}
              >
                推荐理由
              </Text>
            </Space>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recommendation.reasons.map((reason, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    borderRadius: 980,
                    padding: '6px 14px',
                    fontSize: 14,
                    color: APPLE_BLUE,
                    fontWeight: 500,
                  }}
                >
                  {reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimal Time Section */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Space size={12}>
            <ClockCircleOutlined style={{ color: '#34c759', fontSize: 20 }} />
            <div>
              <Text
                style={{
                  fontSize: 14,
                  color: APPLE_TEXT_SECONDARY,
                  display: 'block',
                  marginBottom: 2,
                }}
              >
                最佳联系时机
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: APPLE_NEAR_BLACK,
                }}
              >
                {recommendation.optimalTime}
              </Text>
            </div>
          </Space>
        </div>

        {/* Seasonal Adjustment Section */}
        {recommendation.seasonalAdjustment && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Space size={12}>
              <CalendarOutlined style={{ color: '#ff9500', fontSize: 20 }} />
              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: APPLE_TEXT_SECONDARY,
                    display: 'block',
                    marginBottom: 2,
                  }}
                >
                  {recommendation.seasonalAdjustment.festival ? '节日关怀' : '季节关怀'}
                </Text>
                {recommendation.seasonalAdjustment.festival && (
                  <div
                    style={{
                      background: 'rgba(255, 149, 0, 0.12)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      display: 'inline-block',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#ff9500', fontWeight: 600 }}>
                      {recommendation.seasonalAdjustment.festival}
                    </Text>
                  </div>
                )}
                <Text
                  style={{
                    fontSize: 17,
                    color: APPLE_NEAR_BLACK,
                    display: 'block',
                  }}
                >
                  {recommendation.seasonalAdjustment.topic}
                </Text>
              </div>
            </Space>
          </div>
        )}

        {/* Confidence Score */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTop: `1px solid rgba(0, 0, 0, 0.06)`,
          }}
        >
          <Space size={8}>
            <ThunderboltOutlined style={{ color: APPLE_BLUE }} />
            <Text
              style={{
                fontSize: 14,
                color: APPLE_TEXT_SECONDARY,
              }}
            >
              推荐置信度
            </Text>
          </Space>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Progress
              percent={Math.round(recommendation.confidence * 100)}
              size="small"
              strokeColor={recommendation.confidence < 0.6 ? '#ff9500' : APPLE_BLUE}
              style={{ width: 80, margin: 0 }}
            />
            <Text
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: recommendation.confidence < 0.6 ? '#ff9500' : APPLE_NEAR_BLACK,
              }}
            >
              {(recommendation.confidence * 100).toFixed(0)}%
            </Text>
          </div>
        </div>

        {recommendation.confidence < 0.6 && (
          <Text
            style={{
              fontSize: 13,
              color: '#ff9500',
              display: 'block',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            数据不足，建议人工确认
          </Text>
        )}

        {/* CTA Button */}
        <Button
          type="primary"
          block
          size="large"
          onClick={onCreateFollowup}
          style={{
            background: APPLE_BLUE,
            borderColor: APPLE_BLUE,
            borderRadius: 8,
            height: 48,
            fontSize: 17,
            fontWeight: 400,
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          icon={<ArrowRightOutlined />}
        >
          创建随访任务
        </Button>
      </div>
    </div>
  );
}

// Alias for use in tab panels
export { FollowupRecommendationPage as FollowupRecommendationPanel };
