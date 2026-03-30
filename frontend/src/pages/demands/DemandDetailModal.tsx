import { useEffect, useState } from 'react';
import {
  Modal,
  Tag,
  Timeline,
  Descriptions,
  Button,
  Dropdown,
  message,
  Space,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  Demand,
  DemandStatus,
  demandsApi,
  demandStatusLabels,
  demandTypeLabels,
  demandPriorityLabels,
  demandSourceLabels,
  validStatusTransitions,
} from '@/api/demands';
import dayjs from 'dayjs';

interface DemandDetailModalProps {
  visible: boolean;
  demandId: string | null;
  onClose: () => void;
  onEdit: (demand: Demand) => void;
  onRefresh: () => void;
}

const statusColors: Record<DemandStatus, string> = {
  OPEN: 'blue',
  IN_PROGRESS: 'processing',
  PENDING: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'default',
  LOST: 'error',
};

export default function DemandDetailModal({
  visible,
  demandId,
  onClose,
  onEdit,
  onRefresh,
}: DemandDetailModalProps) {
  const { t } = useTranslation();
  const [demand, setDemand] = useState<Demand | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    if (visible && demandId) {
      loadDemand();
    }
  }, [visible, demandId]);

  const loadDemand = async () => {
    if (!demandId) return;
    try {
      const data = await demandsApi.getById(demandId);
      setDemand(data);
    } catch (error) {
      message.error(t('common.error'));
      onClose();
    }
  };

  const handleStatusChange = async (newStatus: DemandStatus) => {
    if (!demand) return;
    setChangingStatus(true);
    try {
      await demandsApi.changeStatus(demand.id, { status: newStatus });
      message.success(t('common.success'));
      loadDemand();
      onRefresh();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setChangingStatus(false);
    }
  };

  const getNextStatusItems = () => {
    if (!demand) return [];
    const validNext = validStatusTransitions[demand.status];
    return validNext.map((status) => ({
      key: status,
      label: demandStatusLabels[status],
      onClick: () => handleStatusChange(status),
    }));
  };

  const isTerminal = demand
    ? ['FULFILLED', 'CANCELLED', 'LOST'].includes(demand.status)
    : false;

  return (
    <Modal
      title={
        <Space>
          {demand?.patient?.name}
          <Tag color={statusColors[demand?.status as DemandStatus]}>
            {demandStatusLabels[demand?.status as DemandStatus]}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={
        demand ? (
          <Space>
            {!isTerminal && (
              <>
                <Button onClick={() => onEdit(demand)}>{t('common.edit')}</Button>
                <Dropdown
                  menu={{ items: getNextStatusItems() }}
                  disabled={changingStatus}
                >
                  <Button type="primary" loading={changingStatus}>
                    {t('demands.changeStatus')}
                  </Button>
                </Dropdown>
              </>
            )}
            <Button onClick={onClose}>{t('common.close')}</Button>
          </Space>
        ) : null
      }
    >
      {demand && (
        <div style={{ marginTop: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={t('demands.type')}>
              {demandTypeLabels[demand.type]}
            </Descriptions.Item>
            <Descriptions.Item label={t('demands.priority')}>
              <Tag
                color={
                  demand.priority === 'URGENT'
                    ? 'red'
                    : demand.priority === 'HIGH'
                      ? 'orange'
                      : 'default'
                }
              >
                {demandPriorityLabels[demand.priority]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('demands.source')}>
              {demandSourceLabels[demand.source]}
            </Descriptions.Item>
            <Descriptions.Item label={t('demands.createdAt')}>
              {dayjs(demand.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            {demand.closedAt && (
              <Descriptions.Item label={t('demands.closedAt')} span={2}>
                {dayjs(demand.closedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            )}
          </Descriptions>

          <h4 style={{ marginTop: 16 }}>{demand.title}</h4>
          <p style={{ color: '#666', whiteSpace: 'pre-wrap' }}>
            {demand.description || '-'}
          </p>

          {demand.estimatedAmount && (
            <p style={{ marginTop: 8 }}>
              {t('demands.estimatedAmount')}: ¥{demand.estimatedAmount.toLocaleString()}
            </p>
          )}

          {demand.actualAmount && (
            <p style={{ marginTop: 8 }}>
              {t('demands.actualAmount')}: ¥{demand.actualAmount.toLocaleString()}
            </p>
          )}

          <h4 style={{ marginTop: 24, marginBottom: 12 }}>
            {t('demands.statusHistory')}
          </h4>

          <Timeline
            items={
              demand.statusHistory?.length
                ? demand.statusHistory.map((history, index) => ({
                    color:
                      index === (demand.statusHistory?.length ?? 0) - 1
                        ? 'blue'
                        : 'gray',
                    children: (
                      <div>
                        <Space>
                          <Tag color={statusColors[history.toStatus]}>
                            {history.fromStatus
                              ? `${demandStatusLabels[history.fromStatus]} → ${demandStatusLabels[history.toStatus]}`
                              : demandStatusLabels[history.toStatus]}
                          </Tag>
                          <span style={{ color: '#999', fontSize: 12 }}>
                            {dayjs(history.createdAt).format('YYYY-MM-DD HH:mm')}
                          </span>
                        </Space>
                        {history.notes && (
                          <p
                            style={{
                              margin: '4px 0 0 0',
                              color: '#666',
                              fontSize: 13,
                            }}
                          >
                            {history.notes}
                          </p>
                        )}
                      </div>
                    ),
                  }))
                : [{ color: 'blue', children: t('demands.noHistory') }]
            }
          />
        </div>
      )}
    </Modal>
  );
}
