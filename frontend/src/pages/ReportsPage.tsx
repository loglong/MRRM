import { Row, Col, Card, Statistic, DatePicker } from 'antd';
import { TeamOutlined, FileTextOutlined, RiseOutlined } from '@ant-design/icons';

export default function ReportsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Reports</h1>
        <DatePicker.RangePicker />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Patients" value={1256} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="New This Month" value={45} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Conversion Rate" value={78} suffix="%" prefix={<RiseOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Follow-up Rate" value={92} suffix="%" prefix={<RiseOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Patient Trends">
            <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>Chart placeholder</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Demand Analysis">
            <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>Chart placeholder</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
