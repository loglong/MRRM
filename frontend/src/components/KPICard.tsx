import { Card, Statistic } from 'antd';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: ReactNode;
  loading?: boolean;
}

export function KPICard({ title, value, suffix, prefix, loading }: KPICardProps) {
  return (
    <Card loading={loading}>
      <Statistic title={title} value={value} suffix={suffix} prefix={prefix} />
    </Card>
  );
}
