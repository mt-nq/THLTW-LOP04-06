import { Table, Select, Empty, Spin, Modal, DatePicker, message } from 'antd';
import { useState } from 'react';
import { useGetMyBorrowsQuery, useExtendBorrowMutation } from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'ALL'>('ALL');
  const { data, isLoading } = useGetMyBorrowsQuery();
  const [extendBorrow, { isLoading: isExtending }] = useExtendBorrowMutation();
  const allBorrows = data?.data || [];

  const [extendModal, setExtendModal] = useState<{ visible: boolean; record: BorrowResponse | null }>({ visible: false, record: null });
  const [newReturnDate, setNewReturnDate] = useState<dayjs.Dayjs | null>(null);

  const filtered = statusFilter === 'ALL'
    ? allBorrows
    : allBorrows.filter((b) => b.status === statusFilter);

  const stats = {
    total: allBorrows.length,
    pending: allBorrows.filter(b => b.status === 'PENDING').length,
    approved: allBorrows.filter(b => b.status === 'APPROVED').length,
    overdue: allBorrows.filter(b => b.status === 'OVERDUE').length,
  };

  const canExtend = (record: BorrowResponse) => {
    if (record.status !== 'APPROVED') return false;
    if (record.extended) return false;
    const daysUntilReturn = dayjs(record.returnDate).diff(dayjs(), 'day');
    return daysUntilReturn <= 2;
  };

  const handleExtend = async () => {
    if (!extendModal.record || !newReturnDate) return;
    try {
      const res = await extendBorrow({
        id: extendModal.record.id,
        newReturnDate: newReturnDate.format('YYYY-MM-DD'),
      }).unwrap();
      if (res.success) {
        message.success('🎉 Gia hạn mượn thành công!');
        setExtendModal({ visible: false, record: null });
        setNewReturnDate(null);
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      message.error(error?.data?.message || 'Gia hạn thất bại');
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => <span className="font-bold text-gray-500">{index + 1}</span>,
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      render: (name: string, record: BorrowResponse) => (
        <div className="flex items-center gap-3">
          {record.equipmentImageUrl ? (
            <img src={record.equipmentImageUrl} alt={name} className="w-10 h-10 object-cover rounded-md border border-white/10" />
          ) : (
            <div className="w-10 h-10 bg-gray-900 rounded-md border border-white/10 flex items-center justify-center text-gray-500">
              <i className="fa-solid fa-box"></i>
            </div>
          )}
          <div>
            <div className="font-bold text-gray-100 text-sm">{name}</div>
            <div className="text-[11px] text-gray-500 font-mono">SL: {record.quantity}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian mượn',
      key: 'time',
      render: (_: unknown, record: BorrowResponse) => {
        const isOverdue = record.status === 'APPROVED' && dayjs(record.returnDate).isBefore(dayjs(), 'day');
        return (
          <div className="text-xs">
            <div className="text-gray-400">Từ: <span className="text-gray-200">{dayjs(record.borrowDate).format('DD/MM/YYYY')}</span></div>
            <div className={`${isOverdue ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
              Đến: <span className={isOverdue ? 'text-red-400' : 'text-gray-200'}>{dayjs(record.returnDate).format('DD/MM/YYYY')}</span>
              {isOverdue && ' ⚠️'}
            </div>
            {record.extended && (
              <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 700, marginTop: 2 }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 3 }}></i>Đã gia hạn
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: BorrowStatus) => {
        let colors = '';
        switch(status) {
          case 'PENDING': colors = 'bg-amber-500/10 text-amber-400 border-amber-500/20'; break;
          case 'APPROVED': colors = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; break;
          case 'RETURNED': colors = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; break;
          case 'OVERDUE': colors = 'bg-red-500/10 text-red-400 border-red-500/20'; break;
          case 'REJECTED': colors = 'bg-gray-500/10 text-gray-400 border-gray-500/20'; break;
        }
        return (
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${colors}`}>
            {status === 'PENDING' && <i className="fa-solid fa-hourglass-start animate-spin mr-1"></i>}
            {BORROW_STATUS_LABELS[status]}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      render: (_: unknown, record: BorrowResponse) => {
        if (canExtend(record)) {
          return (
            <button
              onClick={() => {
                setExtendModal({ visible: true, record });
                setNewReturnDate(null);
              }}
              style={{
                fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7',
                border: '1px solid rgba(168, 85, 247, 0.25)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)'; }}
            >
              <i className="fa-solid fa-calendar-plus"></i> Gia hạn
            </button>
          );
        }
        if (record.status === 'APPROVED' && record.extended) {
          return <span style={{ fontSize: 10, color: '#6b7280' }}><i className="fa-solid fa-check-circle" style={{ color: 'rgba(168, 85, 247, 0.5)', marginRight: 4 }}></i>Đã gia hạn</span>;
        }
        return null;
      },
    },
    {
      title: 'Ngày gửi đơn',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <span className="text-xs text-gray-400">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>,
      sorter: (a: BorrowResponse, b: BorrowResponse) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
    },
  ];

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="text-[#e50914]"><i className="fa-solid fa-clock-rotate-left"></i></span>
              LỊCH SỬ MƯỢN ĐỒ
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Theo dõi tiến trình và trạng thái các yêu cầu mượn thiết bị của bạn.</p>
          </div>
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full md:w-48"
            size="large"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              ...Object.entries(BORROW_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#121212] border-t-4 border-t-indigo-500 border border-white/5 rounded-xl p-4 text-center hover:bg-[#161616] transition">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Tổng Phiếu</div>
            <div className="text-3xl font-black text-indigo-400">{stats.total}</div>
          </div>
          <div className="bg-[#121212] border-t-4 border-t-amber-500 border border-white/5 rounded-xl p-4 text-center hover:bg-[#161616] transition">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Chờ Duyệt</div>
            <div className="text-3xl font-black text-amber-400">{stats.pending}</div>
          </div>
          <div className="bg-[#121212] border-t-4 border-t-blue-500 border border-white/5 rounded-xl p-4 text-center hover:bg-[#161616] transition">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Đang Mượn</div>
            <div className="text-3xl font-black text-blue-400">{stats.approved}</div>
          </div>
          <div className="bg-[#121212] border-t-4 border-t-red-500 border border-white/5 rounded-xl p-4 text-center hover:bg-[#161616] transition">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Quá Hạn</div>
            <div className="text-3xl font-black text-red-500">{stats.overdue}</div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Empty 
                description={<span className="text-gray-500 font-medium">Không tìm thấy yêu cầu mượn nào</span>} 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              scroll={{ x: 900 }}
              pagination={{ pageSize: 10 }}
              className="dark-theme-table"
            />
          )}
        </div>
      </div>

      {/* EXTEND MODAL */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-calendar-plus" style={{ color: '#a855f7' }}></i>
            <span>Gia hạn mượn thiết bị</span>
          </div>
        }
        open={extendModal.visible}
        onOk={handleExtend}
        onCancel={() => { setExtendModal({ visible: false, record: null }); setNewReturnDate(null); }}
        okText="Xác nhận gia hạn"
        cancelText="Hủy"
        confirmLoading={isExtending}
        okButtonProps={{ disabled: !newReturnDate }}
        centered
        width={480}
        destroyOnClose
      >
        {extendModal.record && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Thiết bị:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{extendModal.record.equipmentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Ngày mượn:</span>
                <span style={{ color: '#111827' }}>{dayjs(extendModal.record.borrowDate).format('DD/MM/YYYY')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Hạn trả hiện tại:</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>{dayjs(extendModal.record.returnDate).format('DD/MM/YYYY')}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                Chọn ngày trả mới <span style={{ color: '#9ca3af' }}>(tối đa thêm 7 ngày)</span>
              </label>
              <DatePicker
                size="large"
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={newReturnDate}
                onChange={(date) => setNewReturnDate(date)}
                disabledDate={(d) => {
                  const currentReturn = dayjs(extendModal.record!.returnDate);
                  return d.isBefore(currentReturn.add(1, 'day'), 'day') || d.isAfter(currentReturn.add(7, 'day'), 'day');
                }}
                placeholder="Chọn ngày trả mới"
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
              />
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: 12, fontSize: 12, color: '#7c3aed' }}>
              <i className="fa-solid fa-info-circle" style={{ marginRight: 4 }}></i>
              <strong>Lưu ý:</strong> Mỗi phiếu mượn chỉ được gia hạn <strong>1 lần</strong>, tối đa thêm <strong>7 ngày</strong>.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
