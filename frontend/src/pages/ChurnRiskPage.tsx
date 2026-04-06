import { useEffect, useState } from 'react';
import { Card, Table, Tag, Progress, Empty, Typography, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { churnRiskApi, PatientRiskScore, ChurnRiskLevel, RiskFactorType, RiskFactor } from '@/api/churn-risk';

const { Title, Text } = Typography;

const riskLevelColors: Record<ChurnRiskLevel, string> = {
  [ChurnRiskLevel.HIGH]: 'red',
  [ChurnRiskLevel.MEDIUM]: 'orange',
  [ChurnRiskLevel.LOW]: 'green',
};

const riskLevelLabels: Record<ChurnRiskLevel, string> = {
  [ChurnRiskLevel.HIGH]: '高风险',
  [ChurnRiskLevel.MEDIUM]: '中风险',
  [ChurnRiskLevel.LOW]: '低风险',
};

const factorLabels: Record<RiskFactorType, string> = {
  [RiskFactorType.LAST_VISIT_DAYS]: '最后就诊',
  [RiskFactorType.SATISFACTION_DROP]: '满意度下降',
  [RiskFactorType.TOUCHPOINT_DECLINE]: '触点减少',
  [RiskFactorType.PATH_MISSED]: '路径遗漏',
};

export default function ChurnRiskPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientRiskScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighRiskPatients();
  }, []);

  const loadHighRiskPatients = async () => {
    try {
      setLoading(true);
      const data = await churnRiskApi.getHighRiskPatients(70);
      setPatients(data);
    } catch (err) {
      console.error('Failed to load high risk patients', err);
    } finally {
      setLoading(false);
    }
  };

  const getFactorColor = (factor: RiskFactorType, value: number): string => {
    if (value === 0) return 'default';
    if (factor === RiskFactorType.LAST_VISIT_DAYS) {
      if (value >= 60) return 'red';
      if (value >= 30) return 'orange';
      return 'yellow';
    }
    if (factor === RiskFactorType.SATISFACTION_DROP) {
      return value >= 50 ? 'red' : 'orange';
    }
    return 'orange';
  };

  const columns = [
    {
      title: '患者',
      dataIndex: 'patientName',
      key: 'patient',
      width: 120,
    },
    {
      title: '风险评分',
      dataIndex: 'score',
      key: 'score',
      width: 180,
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          status={score >= 70 ? 'exception' : 'normal'}
          format={(p) => `${p}`}
        />
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (level: ChurnRiskLevel) => (
        <Tag color={riskLevelColors[level]}>{riskLevelLabels[level]}</Tag>
      ),
    },
    {
      title: '风险因素',
      dataIndex: 'factors',
      key: 'factors',
      render: (factors: RiskFactor[]) => (
        <Space size={4} wrap>
          {factors.filter(f => f.value > 0).map(f => (
            <Tag
              key={f.type}
              color={getFactorColor(f.type, f.value)}
              title={f.description}
            >
              {factorLabels[f.type] || f.type}: {f.value}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>{t('churnRisk.title') || '患者流失预警'}</Title>
        <Text type="secondary">
          显示风险评分 &gt;= 70 的高风险患者
        </Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={patients}
          loading={loading}
          rowKey="patientId"
          locale={{
            emptyText: (
              <Empty
                description={t('churnRisk.noHighRisk') || '暂无高风险患者'}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 位高风险患者`,
          }}
        />
      </Card>
    </div>
  );
}
