import { Table, Select, Empty, Spin, Button, Modal, DatePicker, message, Input } from 'antd';
import { useState } from 'react';
import { useGetMyBorrowsQuery, useExtendBorrowMutation, useCancelBorrowMutation } from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

const STATUS_STYLE: Record<BorrowStatus, { bg: string; border: string; color: string; dot: string }> = {
  PENDING:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  color: '#fbbf24', dot: '#f59e0b' },
  APPROVED: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  color: '#60a5fa', dot: '#3b82f6' },
  RETURNED: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#34d399', dot: '#10b981' },
  OVERDUE:  { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', dot: '#ef4444' },
  REJECTED: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#6b7280', dot: '#4b5563' },
  CANCELED: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.2)', color: '#d1d5db', dot: '#9ca3af' },
};

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [extendRecord, setExtendRecord] = useState<BorrowResponse | null>(null);
  const [extendToDate, setExtendToDate] = useState<dayjs.Dayjs | null>(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelRecord, setCancelRecord] = useState<BorrowResponse | null>(null);

  const { data, isLoading } = useGetMyBorrowsQuery();
  const [extendBorrow, { isLoading: isExtending }] = useExtendBorrowMutation();
  const [cancelBorrow, { isLoading: isCanceling }] = useCancelBorrowMutation();

  const allBorrows = data?.data || [];
  
  const filtered = allBorrows.filter(b => {
    const effectiveStatus = (b.status === 'REJECTED' && b.adminNote === 'Sinh viên tự hủy') ? 'CANCELED' : b.status;
    if (statusFilter !== 'ALL' && effectiveStatus !== statusFilter) return false;
    if (searchText && !b.equipmentName.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const bDate = dayjs(b.borrowDate).startOf('day');
      const start = dateRange[0].startOf('day');
      const end = dateRange[1].endOf('day');
      if (bDate.isBefore(start) || bDate.isAfter(end)) return false;
    }
    return true;
  });

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

  const handleCancelRequest = async () => {
    if (!cancelRecord) return;
    try {
      await cancelBorrow(cancelRecord.id).unwrap();
      message.success('Đã hủy yêu cầu mượn thành công');
      setCancelModalVisible(false);
      setCancelRecord(null);
    } catch (error: any) {
      message.error(error.data?.message || 'Có lỗi xảy ra khi hủy yêu cầu');
    }
  };

  const stats = [
    { label: 'Tổng Phiếu',  value: allBorrows.length,                                      color: '#e5e7eb', accent: '#e50914' },
    { label: 'Chờ Duyệt',   value: allBorrows.filter(b => b.status === 'PENDING').length,  color: '#fbbf24', accent: '#f59e0b' },
    { label: 'Đã Duyệt',   value: allBorrows.filter(b => b.status === 'APPROVED').length, color: '#60a5fa', accent: '#3b82f6' },
    { label: 'Đã Trả',      value: allBorrows.filter(b => b.status === 'RETURNED').length, color: '#34d399', accent: '#10b981' },
    { label: 'Quá Hạn',     value: allBorrows.filter(b => b.status === 'OVERDUE').length,  color: '#f87171', accent: '#ef4444' },
    { label: 'Bị Từ Chối',  value: allBorrows.filter(b => b.status === 'REJECTED' && b.adminNote !== 'Sinh viên tự hủy').length, color: '#6b7280', accent: '#4b5563' },
    { label: 'Đã Hủy',      value: allBorrows.filter(b => b.status === 'REJECTED' && b.adminNote === 'Sinh viên tự hủy').length, color: '#9ca3af', accent: '#6b7280' },
  ];

  const columns = [
    {
      title: 'STT', key: 'index', width: 48, align: 'center' as const,
      render: (_: unknown, __: unknown, i: number) => (
        <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 700 }}>{(currentPage - 1) * pageSize + i + 1}</span>
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
      render: (status: BorrowStatus, record: BorrowResponse) => {
        const effectiveStatus = (status === 'REJECTED' && record.adminNote === 'Sinh viên tự hủy') ? 'CANCELED' : status;
        const s = STATUS_STYLE[effectiveStatus as BorrowStatus];
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: s.bg, border: `1px solid ${s.border}`,
            color: s.color, fontSize: 10, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            padding: '4px 10px', borderRadius: 3,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0, ...(effectiveStatus === 'PENDING' ? { animation: 'pulse 1.5s infinite' } : {}) }} />
            {BORROW_STATUS_LABELS[effectiveStatus]}
          </span>
        );
      },
    },
    {
      title: 'Thao tác', key: 'action', align: 'left' as const,
      render: (_: unknown, record: BorrowResponse) => {
        // daysToReturn có thể tính khoảng cách ngày.
        // Dùng endOf('day') để ngày trả hôm nay diff với bây giờ là 0.
        const daysToReturn = dayjs(record.returnDate).endOf('day').diff(dayjs(), 'day');
        const canExtend = record.status === 'APPROVED' && !record.isExtended && daysToReturn <= 3 && daysToReturn >= 0;

        return (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
            {canExtend && (
              <Button 
                size="small" 
                className="action-btn-extend"
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
            )}

            {record.status === 'PENDING' && (
              <Button
                size="small"
                danger
                className="action-btn-cancel"
                onClick={() => {
                  setCancelRecord(record);
                  setCancelModalVisible(true);
                }}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.5)',
                  borderRadius: 4,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: 10 }} />
                Hủy yêu cầu
              </Button>
            )}

            {record.status === 'OVERDUE' && (
              <Button
                size="small"
                className="action-btn-contact"
                onClick={() => setContactModalVisible(true)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(245,158,11,0.1)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 4,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 10 }} />
                Liên hệ Admin
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: 'Ngày gửi', dataIndex: 'createdAt', key: 'createdAt',
      render: (date: string) => <span style={{ fontSize: 12, color: '#6b7280' }}>{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>,
      sorter: (a: BorrowResponse, b: BorrowResponse) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
    },
  ];

  // Removed global loading to show skeleton inside Table instead

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
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Input
              placeholder="Tìm thiết bị..."
              size="large"
              className="dark-filter-input"
              prefix={<i className="fa-solid fa-magnifying-glass" style={{ color: '#6b7280', fontSize: 13 }} />}
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
              style={{ width: 200, background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}
              allowClear
            />
            <DatePicker.RangePicker
              format="DD/MM/YYYY"
              size="large"
              className="dark-filter-input"
              value={dateRange}
              onChange={(dates) => { setDateRange(dates); setCurrentPage(1); }}
              style={{ width: 260, background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              allowClear
            />
            <Select
              value={statusFilter}
              size="large"
              className="dark-filter-input"
              onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              style={{ width: 170 }}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                ...Object.entries(BORROW_STATUS_LABELS).map(([value, label]) => ({ value, label })),
              ]}
              popupClassName="dark-dropdown"
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 32 }}>
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
          <Table
            loading={{
              spinning: isLoading,
              indicator: <Spin size="large" />,
            }}
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            scroll={{ x: 700 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              style: { padding: '12px 20px' },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: '40px 0' }}>
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={<span style={{ color: '#6b7280', fontSize: 14 }}>Không có dữ liệu phù hợp với bộ lọc</span>} 
                  />
                </div>
              )
            }}
          />
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
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#fbbf24', fontSize: 16 }} />
            </div>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Chi tiết phạt & Liên hệ</span>
          </div>
        }
        open={contactModalVisible}
        width={500}
        onOk={() => setContactModalVisible(false)}
        onCancel={() => setContactModalVisible(false)}
        footer={
          <Button 
            onClick={() => setContactModalVisible(false)}
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: 6, fontWeight: 600, border: 'none', padding: '0 24px', height: 40, color: '#fff' }}
          >
            Đã hiểu
          </Button>
        }
        styles={{
          content: { background: '#141414', border: '1px solid #333', borderRadius: 12, padding: 0, overflow: 'hidden' },
          header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px 16px', margin: 0 },
          body: { padding: '24px' },
          footer: { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 20px', margin: 0, textAlign: 'right' }
        }}
      >
        <div style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6 }}>
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', padding: 16, borderRadius: 8, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <i className="fa-solid fa-circle-exclamation" style={{ color: '#ef4444', marginTop: 4 }} />
              <div>
                <div style={{ color: '#f87171', fontWeight: 600, marginBottom: 4 }}>Thiết bị của bạn đã quá hạn trả!</div>
                <div style={{ color: '#9ca3af', fontSize: 13 }}>Vui lòng mang thiết bị đến phòng quản lý sớm nhất có thể để tránh phát sinh thêm phí phạt. Mức phạt sẽ tăng lên theo mỗi ngày trễ hạn.</div>
              </div>
            </div>
          </div>
          
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Thông tin liên hệ Admin</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-envelope" style={{ color: '#9ca3af' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Email hỗ trợ</div>
                <div style={{ color: '#60a5fa', fontWeight: 500 }}>admin@school.edu.vn</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-phone" style={{ color: '#9ca3af' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Hotline / Zalo</div>
                <div style={{ color: '#e5e7eb', fontWeight: 500 }}>0123.456.789</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
              <i className="fa-solid fa-trash-can" style={{ color: '#ef4444', fontSize: 16 }} />
            </div>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Xác nhận hủy yêu cầu</span>
          </div>
        }
        open={cancelModalVisible}
        width={450}
        onOk={handleCancelRequest}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelRecord(null);
        }}
        confirmLoading={isCanceling}
        okText="Có, hủy yêu cầu"
        cancelText="Không, giữ lại"
        okButtonProps={{ danger: true, style: { borderRadius: 6, fontWeight: 600, padding: '0 20px', height: 38 } }}
        cancelButtonProps={{ style: { background: 'transparent', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontWeight: 600, height: 38 } }}
        styles={{
          content: { background: '#141414', border: '1px solid #333', borderRadius: 12, padding: 0, overflow: 'hidden' },
          header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px 16px', margin: 0 },
          body: { padding: '24px' },
          footer: { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 20px', margin: 0 }
        }}
      >
        <div style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6 }}>
          <p style={{ marginBottom: 16 }}>Bạn có chắc chắn muốn hủy yêu cầu mượn thiết bị này không?</p>
          
          {cancelRecord && (
            <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 12, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
              {cancelRecord.equipmentImageUrl ? (
                <img src={cancelRecord.equipmentImageUrl} alt="equipment" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }} />
              ) : (
                <div style={{ width: 48, height: 48, background: '#222', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <i className="fa-solid fa-box" style={{ color: '#555', fontSize: 18 }} />
                </div>
              )}
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{cancelRecord.equipmentName}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Số lượng: {cancelRecord.quantity} chiếc</div>
              </div>
            </div>
          )}
          
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', padding: 12, borderRadius: 8, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <i className="fa-solid fa-circle-info" style={{ color: '#f87171', marginTop: 3, fontSize: 12 }} />
              <div style={{ color: '#f87171', fontSize: 13 }}>
                Lưu ý: Hành động này không thể hoàn tác. Nếu muốn mượn lại, bạn sẽ phải tạo một yêu cầu mới.
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <style>{`
        .action-btn-extend { transition: all 0.2s; }
        .action-btn-extend:hover { background: rgba(59,130,246,0.25) !important; color: #93c5fd !important; border-color: rgba(59,130,246,0.5) !important; }
        
        .action-btn-cancel { transition: all 0.2s; }
        .action-btn-cancel:hover { background: rgba(239,68,68,0.1) !important; color: #fca5a5 !important; border-color: rgba(239,68,68,0.8) !important; }
        
        .action-btn-contact { transition: all 0.2s; }
        .action-btn-contact:hover { background: rgba(245,158,11,0.2) !important; color: #fcd34d !important; border-color: rgba(245,158,11,0.5) !important; }
        
        /* Dark Filter Inputs Fix */
        .dark-filter-input .ant-input,
        .dark-filter-input input {
          background-color: transparent !important;
          color: #fff !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .dark-filter-input .ant-input::placeholder,
        .dark-filter-input input::placeholder {
          color: #6b7280 !important;
        }
        .dark-filter-input.ant-select .ant-select-selector {
          background-color: #1a1a1a !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .dark-filter-input .ant-select-selection-item {
          color: #fff !important;
        }
        .dark-filter-input .ant-select-arrow,
        .dark-filter-input .ant-picker-suffix,
        .dark-filter-input .ant-picker-separator {
          color: #6b7280 !important;
        }
        .dark-filter-input .ant-input-clear-icon,
        .dark-filter-input .ant-picker-clear {
          color: #6b7280 !important;
          background: transparent !important;
        }
        
        /* Dropdown style */
        .dark-dropdown .ant-select-item {
          color: #d1d5db;
        }
        .dark-dropdown .ant-select-item-option-selected {
          background-color: rgba(91,92,240,0.2) !important;
          color: #818cf8 !important;
        }
        .dark-dropdown .ant-select-item-option-active {
          background-color: rgba(255,255,255,0.08) !important;
        }
      `}</style>
    </div>
  );
}
