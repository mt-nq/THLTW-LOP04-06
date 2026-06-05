import { Table, Select, Empty, Spin } from 'antd';
import { useState } from 'react';
import { useGetMyBorrowsQuery } from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_LABELS } from '@/utils/constants';
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
              scroll={{ x: 800 }}
              pagination={{ pageSize: 10 }}
              className="dark-theme-table"
            />
          )}
        </div>
      </div>
    </div>
  );
}
