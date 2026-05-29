import { Table, Tag, Button, Space, Tooltip, Empty, Spin, Select, Row, Col, Statistic, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useGetMyBorrowsQuery } from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_COLORS, BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'ALL'>('ALL');
  const { data, isLoading } = useGetMyBorrowsQuery();
  const allBorrows = data?.data || [];

  const filtered = statusFilter === 'ALL'
    ? allBorrows
    : allBorrows.filter((b) => b.status === statusFilter);

  const stats = {
    total: allBorrows.length,
    pending: allBorrows.filter(b => b.status === 'PENDING').length,
    approved: allBorrows.filter(b => b.status === 'APPROVED').length,
    overdue: allBorrows.filter(b => b.status === 'OVERDUE').length,
  };

  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      render: (name: string, record: BorrowResponse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {record.equipmentImageUrl && (
            <img src={record.equipmentImageUrl} alt={name}
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>SL: {record.quantity}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date: string, record: BorrowResponse) => {
        const isOverdue = record.status === 'APPROVED' && dayjs(date).isBefore(dayjs(), 'day');
        return (
          <span style={{ color: isOverdue ? '#ef4444' : undefined, fontWeight: isOverdue ? 700 : 400 }}>
            {dayjs(date).format('DD/MM/YYYY')}
            {isOverdue && ' ⚠️'}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: BorrowStatus) => (
        <Tag color={BORROW_STATUS_COLORS[status]} style={{ borderRadius: 6, fontWeight: 600 }}>
          {BORROW_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Ghi chú admin',
      dataIndex: 'adminNote',
      key: 'adminNote',
      render: (note: string) => note ? (
        <Tooltip title={note}>
          <span style={{ fontSize: 12, color: '#ef4444', cursor: 'help' }}>
            {note.length > 30 ? note.substring(0, 30) + '...' : note}
          </span>
        </Tooltip>
      ) : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: BorrowResponse, b: BorrowResponse) =>
        dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
    },
  ];

  const getEmptyDescription = () => {
    switch (statusFilter) {
      case 'PENDING':
        return 'Không có yêu cầu nào đang chờ duyệt';
      case 'APPROVED':
        return 'Không có yêu cầu nào đã được duyệt';
      case 'REJECTED':
        return 'Không có yêu cầu nào bị từ chối';
      case 'RETURNED':
        return 'Không có yêu cầu nào đã trả';
      case 'OVERDUE':
        return 'Không có yêu cầu nào bị quá hạn';
      default:
        return 'Bạn chưa có yêu cầu mượn thiết bị nào';
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>📜 Lịch Sử Mượn</h1>
        <p>Theo dõi tất cả yêu cầu mượn của bạn</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng yêu cầu', value: stats.total, color: '#6366f1' },
          { title: 'Chờ duyệt', value: stats.pending, color: '#f59e0b' },
          { title: 'Đang mượn', value: stats.approved, color: '#3b82f6' },
          { title: 'Quá hạn', value: stats.overdue, color: '#ef4444' },
        ].map((s) => (
          <Col key={s.title} xs={12} md={6}>
            <Card style={{ borderRadius: 12, textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>{s.title}</span>}
                value={s.value}
                valueStyle={{ color: s.color, fontWeight: 800, fontSize: 28 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180, borderRadius: 10 }}
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            ...Object.entries(BORROW_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <Empty description={getEmptyDescription()} />
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} yêu cầu` }}
          scroll={{ x: 700 }}
          style={{ background: '#fff', borderRadius: 16 }}
        />
      )}
    </div>
  );
}
