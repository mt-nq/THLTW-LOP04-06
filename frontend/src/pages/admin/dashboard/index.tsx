import { Row, Col, Card, Statistic, Table, Tag, Alert, Spin, Badge } from 'antd';
import {
  InboxOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useGetDashboardQuery } from '@/store/api/statisticsApi';
import { useGetAllBorrowsQuery } from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_COLORS, BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useGetDashboardQuery();
  const { data: borrowsData } = useGetAllBorrowsQuery();

  const stats = statsData?.data;
  const recentBorrows = (borrowsData?.data || []).slice(0, 5);
  const overdueBorrows = (borrowsData?.data || []).filter(b => b.status === 'OVERDUE');

  const statCards = [
    {
      title: 'Tổng số lượng hiện có',
      value: stats?.totalEquipment || 0,
      icon: <InboxOutlined />,
      bg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    },
    {
      title: 'Đang mượn',
      value: stats?.totalBorrowing || 0,
      icon: <FileTextOutlined />,
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    },
    {
      title: 'Chờ duyệt',
      value: stats?.totalPending || 0,
      icon: <ClockCircleOutlined />,
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
    {
      title: 'Quá hạn',
      value: stats?.totalOverdue || 0,
      icon: <WarningOutlined />,
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
    },
  ];

  if (statsLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>🏠 Tổng Quan Hệ Thống</h1>
        <p>Xem nhanh trạng thái hệ thống mượn đồ</p>
      </div>

      {overdueBorrows.length > 0 && (
        <Alert
          message={`🚨 Cảnh báo: Có ${overdueBorrows.length} yêu cầu quá hạn trả!`}
          description="Vui lòng kiểm tra và xử lý các yêu cầu quá hạn."
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
          closable
        />
      )}

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col key={card.title} xs={12} md={6}>
            <div className="stat-card" style={{ background: card.bg, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
              <div className="stat-card-icon">{card.icon}</div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-label">{card.title}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card title="📋 Yêu cầu gần đây" style={{ borderRadius: 16 }}>
            <Table
              dataSource={recentBorrows}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'STT',
                  key: 'index',
                  width: 50,
                  align: 'center' as const,
                  render: (_: unknown, __: unknown, index: number) => index + 1,
                },
                {
                  title: 'Sinh viên',
                  dataIndex: 'userName',
                  render: (name: string, r: BorrowResponse) => (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.userStudentId}</div>
                    </div>
                  ),
                },
                { title: 'Thiết bị', dataIndex: 'equipmentName', key: 'equipmentName' },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  render: (s: BorrowStatus) => (
                    <Tag color={BORROW_STATUS_COLORS[s]} style={{ borderRadius: 6, fontSize: 11 }}>
                      {BORROW_STATUS_LABELS[s]}
                    </Tag>
                  ),
                },
                {
                  title: 'Ngày gửi',
                  dataIndex: 'createdAt',
                  render: (d: string) => dayjs(d).format('DD/MM HH:mm'),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="🏆 Thiết bị mượn nhiều tháng này"
            style={{ borderRadius: 16, height: '100%' }}
          >
            {(stats?.monthlyStats || []).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                Chưa có dữ liệu tháng này
              </div>
            ) : (
              <div>
                {(stats?.monthlyStats || []).slice(0, 6).map((item, index) => (
                  <div key={item.equipmentId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: index < 5 ? '1px solid #f3f4f6' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#f97316' : '#e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 12, marginRight: 12, color: '#fff', flexShrink: 0,
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.equipmentName}</div>
                    </div>
                    <Tag color="purple" style={{ flexShrink: 0 }}>SL: {item.borrowCount}</Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
