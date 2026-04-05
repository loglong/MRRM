import { Card, Spin } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SatisfactionTrend } from '../api/experience';

interface Props {
  data: SatisfactionTrend[];
  loading?: boolean;
}

export default function SatisfactionTrendChart({ data, loading }: Props) {
  if (loading) {
    return (
      <Card title="Satisfaction Trend">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Satisfaction Trend">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis domain={[-100, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" name="Satisfaction Score" stroke="#8884d8" />
          <Line type="monotone" dataKey="positive" name="Positive" stroke="#52c41a" dot={false} />
          <Line type="monotone" dataKey="negative" name="Negative" stroke="#ff4d4f" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
