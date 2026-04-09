import { Card, Statistic, Typography } from 'antd';
import { ReactNode } from 'react';

const { Text } = Typography;

// Apple Design Colors
const APPLE_BLUE = '#0071e3';
const APPLE_NEAR_BLACK = '#1d1d1f';

interface KPICardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: ReactNode;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function KPICard({
  title,
  value,
  suffix,
  prefix,
  loading,
  trend,
  description,
}: KPICardProps) {
  return (
    <Card
      loading={loading}
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease',
      }}
      styles={{
        body: { padding: '20px 24px' },
      }}
      hoverable
    >
      {/* Title */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'rgba(0, 0, 0, 0.65)',
          display: 'block',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      {/* Value Row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        {prefix && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${APPLE_BLUE}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 4,
            }}
          >
            {prefix}
          </div>
        )}
        <Statistic
          value={value}
          suffix={suffix}
          valueStyle={{
            fontSize: 32,
            fontWeight: 600,
            color: APPLE_NEAR_BLACK,
            lineHeight: 1.1,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Helvetica, Arial, sans-serif",
          }}
        />
      </div>

      {/* Trend */}
      {trend && (
        <div style={{ marginTop: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: trend.isPositive ? '#34c759' : '#ff3b30',
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <Text
            style={{
              fontSize: 13,
              color: 'rgba(0, 0, 0, 0.48)',
              marginLeft: 6,
            }}
          >
            vs last period
          </Text>
        </div>
      )}

      {/* Description */}
      {description && (
        <Text
          style={{
            fontSize: 13,
            color: 'rgba(0, 0, 0, 0.48)',
            display: 'block',
            marginTop: 6,
          }}
        >
          {description}
        </Text>
      )}
    </Card>
  );
}
