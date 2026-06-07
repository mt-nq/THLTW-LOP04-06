import { Table, Select, Empty, Spin, Button, Modal, DatePicker, message } from 'antd';
import { useState } from 'react';
import { useGetMyBorrowsQuery, useExtendBorrowMutation } from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

const STATUS_STYLE: Record<BorrowStatus, { bg: string; border: string; color: string; dot: string }> = {
  PENDING:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  color: '#fbbf24', dot: '#f59e0b' },
  APPROVED: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  color: '#60a5fa', dot: '#3b82f6' },
  RETURNED: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#34d399', dot: '#10b981' },
  OVERDUE:  { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', dot: '#ef4444' },
  REJECTED: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#6b7280', dot: '#4b5563' },
};

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'ALL'>('ALL');
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [extendRecord, setExtendRecord] = useState<BorrowResponse | null>(null);
  const [extendToDate, setExtendToDate] = useState<dayjs.Dayjs | null>(null);

  const { data, isLoading } = useGetMyBorrowsQuery();
  const [extendBorrow, { isLoading: isExtending }] = useExtendBorrowMutation();

  const allBorrows = data?.data || [];
  const filtered = statusFilter === 'ALL' ? allBorrows : allBorrows.filter(b => b.status === statusFilter);

  const handleExtend = async () => {
    if (!extendRecord || !extendToDate) return;
    const days = extendToDate.diff(dayjs(extendRecord.returnDate), 'day');
    if (days < 1 || days > 7) {
      message.error('Số ngày gia hạn không hợp lệ');
      return;
    }
    try {
      await extendBorrow({ id: extendRecord.id, data: { days } }).unwrap();
      message.success('Gia hạn thành công');
      setExtendModalVisible(false);
      setExtendRecord(null);
      setExtendToDate(null);
    } catch (error: any) {
      message.error(error.data?.message || 'Có lỗi xảy ra khi gia hạn');
    }
  };

  const stats = [
    { label: 'Tổng Phiếu',  value: allBorrows.length,                                      color: '#e5e7eb', accent: '#e50914' },
    { label: 'Chờ Duyệt',   value: allBorrows.filter(b => b.status === 'PENDING').length,  color: '#fbbf24', accent: '#f59e0b' },
    { label: 'Đang Mượn',   value: allBorrows.filter(b => b.status === 'APPROVED').length, color: '#60a5fa', accent: '#3b82f6' },
    { label: 'Đã Trả',      value: allBorrows.filter(b => b.status === 'RETURNED').length, color: '#34d399', accent: '#10b981' },
    { label: 'Quá Hạn',     value: allBorrows.filter(b => b.status === 'OVERDUE').length,  color: '#f87171', accent: '#ef4444' },
    { label: 'Bị Từ Chối',  value: allBorrows.filter(b => b.status === 'REJECTED').length, color: '#6b7280', accent: '#4b5563' },
  ];

  const columns = [
    {
      title: '#', key: 'index', width: 48, align: 'center' as const,
      render: (_: unknown, __: unknown, i: number) => (
        <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 700 }}>{i + 1}</span>
      ),
    },
    {
      title: 'Thiết bị', dataIndex: 'equipmentName', key: 'equipmentName',
      render: (name: string, record: BorrowResponse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.equipmentImageUrl ? (
            <img src={record.equipmentImageUrl} alt={name}
              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 44, height: 44, background: '#2a2a2a', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-solid fa-box" style={{ color: '#444' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e5e7eb' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>SL: {record.quantity} chiếc</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian', key: 'time',
      render: (_: unknown, record: BorrowResponse) => {
        const isOverdue = record.status === 'APPROVED' && dayjs(record.returnDate).isBefore(dayjs(), 'day');
        return (
          <div style={{ fontSize: 12 }}>
            <div style={{ color: '#9ca3af', marginBottom: 2 }}>
              <span style={{ color: '#6b7280' }}>Từ</span> <span style={{ color: '#d1d5db', fontWeight: 600 }}>{dayjs(record.borrowDate).format('DD/MM/YYYY')}</span>
            </div>
            <div style={{ color: isOverdue ? '#f87171' : '#9ca3af' }}>
              <span style={{ color: '#6b7280' }}>Đến</span>{' '}
              <span style={{ color: isOverdue ? '#f87171' : '#d1d5db', fontWeight: 600 }}>{dayjs(record.returnDate).format('DD/MM/YYYY')}</span>
              {isOverdue && <span style={{ marginLeft: 4 }}>⚠</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: BorrowStatus) => {
        const s = STATUS_STYLE[status];
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: s.bg, border: `1px solid ${s.border}`,
            color: s.color, fontSize: 10, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            padding: '4px 10px', borderRadius: 3,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0, ...(status === 'PENDING' ? { animation: 'pulse 1.5s infinite' } : {}) }} />
            {BORROW_STATUS_LABELS[status]}
          </span>
        );
      },
    },
    {
      title: 'Thao tác', key: 'action', align: 'right' as const,
      render: (_: unknown, record: BorrowResponse) => {
        // daysToReturn có thể tính khoảng cách ngày.
        // Dùng endOf('day') để ngày trả hôm nay diff với bây giờ là 0.
        const daysToReturn = dayjs(record.returnDate).endOf('day').diff(dayjs(), 'day');
        const canExtend = record.status === 'APPROVED' && !record.isExtended && daysToReturn <= 3 && daysToReturn >= 0;

        if (canExtend) {
          return (
            <Button 
              size="small" 
              onClick={() => {
                setExtendRecord(record);
                setExtendToDate(dayjs(record.returnDate).add(7, 'day'));
                setExtendModalVisible(true);
              }}
              style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.25) 100%)',
                color: '#60a5fa', 
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 4, 
                padding: '0 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <i className="fa-solid fa-calendar-plus" style={{ fontSize: 10 }} />
              Gia hạn
            </Button>
          );
        }
        return null;
      },
    },
    {
      title: 'Ngày gửi', dataIndex: 'createdAt', key: 'createdAt',
      render: (date: string) => <span style={{ fontSize: 12, color: '#6b7280' }}>{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>,
      sorter: (a: BorrowResponse, b: BorrowResponse) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
    },
  ];

  if (isLoading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: '#e5e7eb', padding: '40px 4%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 4, height: 30, background: '#e50914', borderRadius: 2 }} />
              <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                Lịch Sử Mượn Đồ
              </h1>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, paddingLeft: 16 }}>
              Theo dõi tiến trình và trạng thái các yêu cầu mượn thiết bị.
            </p>
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            size="large"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              ...Object.entries(BORROW_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#1a1a1a', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.06)',
              borderTop: `3px solid ${s.accent}`,
              padding: '16px 12px', textAlign: 'center',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#222')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: '#1a1a1a', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 16px', textAlign: 'center' }}>
              <Empty description={<span style={{ color: '#4b5563', fontSize: 13, fontWeight: 600 }}>Không tìm thấy yêu cầu mượn nào</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              scroll={{ x: 700 }}
              pagination={{
                pageSize: 10,
                style: { padding: '12px 20px' },
              }}
            />
          )}
        </div>
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}>
              <i className="fa-solid fa-calendar-plus" style={{ color: '#60a5fa', fontSize: 16 }} />
            </div>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Gia hạn thiết bị</span>
          </div>
        }
        open={extendModalVisible}
        width={560}
        onOk={handleExtend}
        onCancel={() => {
          setExtendModalVisible(false);
          setExtendRecord(null);
        }}
        confirmLoading={isExtending}
        okText="Xác nhận gia hạn"
        cancelText="Hủy bỏ"
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 6, fontWeight: 600, border: 'none', padding: '0 20px', height: 38 } }}
        cancelButtonProps={{ style: { background: 'transparent', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontWeight: 600, height: 38 } }}
        styles={{
          content: { background: '#141414', border: '1px solid #333', borderRadius: 12, padding: 0, overflow: 'hidden' },
          header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px 16px', margin: 0 },
          body: { padding: '24px' },
          footer: { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 20px', margin: 0 }
        }}
      >
        {extendRecord && (
          <div style={{ color: '#9ca3af' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#1a1a1a', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', marginBottom: 20 }}>
              {extendRecord.equipmentImageUrl ? (
                <img src={extendRecord.equipmentImageUrl} alt="equipment" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }} />
              ) : (
                <div style={{ width: 64, height: 64, background: '#222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <i className="fa-solid fa-box" style={{ color: '#555', fontSize: 24 }} />
                </div>
              )}
              <div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{extendRecord.equipmentName}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Mã phiếu: #{extendRecord.id} &bull; Số lượng: {extendRecord.quantity}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>Ngày mượn</div>
                <div style={{ color: '#d1d5db', fontSize: 14, fontWeight: 600 }}>{dayjs(extendRecord.borrowDate).format('DD/MM/YYYY')}</div>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.05)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.1)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', marginBottom: 6 }}>Hạn trả hiện tại</div>
                <div style={{ color: '#f87171', fontSize: 14, fontWeight: 700 }}>{dayjs(extendRecord.returnDate).format('DD/MM/YYYY')}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', padding: 16, borderRadius: 8 }}>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <i className="fa-solid fa-circle-info" style={{ color: '#60a5fa', marginTop: 3 }} />
                <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                  Vui lòng chọn ngày trả mới. Bạn có thể gia hạn tối đa thêm 7 ngày so với ngày trả hiện tại.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 600, color: '#e5e7eb', fontSize: 14 }}>Ngày trả mới:</span>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={extendToDate}
                  onChange={(date) => setExtendToDate(date)}
                  disabledDate={(current) => {
                    const returnDate = dayjs(extendRecord.returnDate).endOf('day');
                    return current && (current.isBefore(returnDate) || current.isAfter(returnDate.add(7, 'day')));
                  }}
                  style={{ background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', flex: 1, padding: '8px 12px', borderRadius: 6 }}
                  allowClear={false}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
