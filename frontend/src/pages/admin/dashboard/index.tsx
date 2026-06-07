import { Table, Tag, Alert, Spin } from 'antd';
import { useGetDashboardQuery } from '@/store/api/statisticsApi';
import { useGetAllBorrowsQuery } from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useGetDashboardQuery();
  const { data: borrowsData } = useGetAllBorrowsQuery();

  const stats = statsData?.data;
  const recentBorrows = (borrowsData?.data || []).slice(0, 5);
  const overdueBorrows = (borrowsData?.data || []).filter(b => b.status === 'OVERDUE');

  const statCards = [
    {
      title: 'TỔNG SỐ THIẾT BỊ',
      value: stats?.totalEquipment || 0,
      icon: 'fa-boxes-stacked',
      color: 'indigo',
    },
    {
      title: 'THIẾT BỊ ĐANG MƯỢN',
      value: stats?.totalBorrowing || 0,
      icon: 'fa-hand-holding-hand',
      color: 'blue',
    },
    {
      title: 'THIẾT BỊ CHỜ MƯỢN',
      value: stats?.totalPending || 0,
      icon: 'fa-hourglass-half',
      color: 'amber',
    },
    {
      title: 'THIẾT BỊ QUÁ HẠN',
      value: stats?.totalOverdue || 0,
      icon: 'fa-triangle-exclamation',
      color: 'red',
    },
  ];

  if (statsLoading) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-3">
            <i className="fa-solid fa-chart-pie text-[#e50914]"></i> TỔNG QUAN HỆ THỐNG
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Xem nhanh trạng thái hệ thống mượn đồ hiện tại.</p>
        </div>
      </div>

      {overdueBorrows.length > 0 && (
        <Alert
          message={`Cảnh báo: Có ${overdueBorrows.length} yêu cầu quá hạn trả!`}
          description="Vui lòng kiểm tra và xử lý các yêu cầu quá hạn ngay."
          type="error"
          showIcon
          closable
          className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold mb-6"
        />
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          let textColors = '';
          let borderColors = '';
          if (card.color === 'indigo') { textColors = 'text-indigo-400'; borderColors = 'border-t-indigo-500'; }
          if (card.color === 'blue') { textColors = 'text-blue-400'; borderColors = 'border-t-blue-500'; }
          if (card.color === 'amber') { textColors = 'text-amber-400'; borderColors = 'border-t-amber-500'; }
          if (card.color === 'red') { textColors = 'text-[#e50914]'; borderColors = 'border-t-[#e50914]'; }

          return (
            <div key={card.title} className={`bg-[#121212] border-t-4 ${borderColors} border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:bg-[#161616] transition`}>
              <i className={`fa-solid ${card.icon} absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:opacity-10 transition duration-500 transform group-hover:scale-110 ${textColors}`}></i>
              <div className="text-gray-500 text-xs font-bold tracking-widest mb-2">{card.title}</div>
              <div className={`text-4xl font-black ${textColors}`}>{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-white font-black uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
               Yêu cầu gần đây
            </h3>
            <Table
              dataSource={recentBorrows}
              rowKey="id"
              size="small"
              pagination={false}
              className="dark-theme-table"
              columns={[
                {
                  title: 'STT',
                  key: 'index',
                  width: 50,
                  align: 'center' as const,
                  render: (_: unknown, __: unknown, index: number) => <span className="text-gray-500 font-bold">{index + 1}</span>,
                },
                {
                  title: 'Sinh viên',
                  dataIndex: 'userName',
                  render: (name: string, r: BorrowResponse) => (
                    <div>
                      <div className="font-bold text-gray-200">{name}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{r.userStudentId}</div>
                    </div>
                  ),
                },
                { title: 'Thiết bị', dataIndex: 'equipmentName', key: 'equipmentName', render: (n: string) => <span className="text-gray-300 font-bold">{n}</span> },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  render: (s: BorrowStatus) => {
                    let colors = '';
                    switch(s) {
                      case 'PENDING': colors = 'bg-amber-500/10 text-amber-400 border-amber-500/20'; break;
                      case 'APPROVED': colors = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; break;
                      case 'RETURNED': colors = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; break;
                      case 'OVERDUE': colors = 'bg-red-500/10 text-red-400 border-red-500/20'; break;
                      case 'REJECTED': colors = 'bg-gray-500/10 text-gray-400 border-gray-500/20'; break;
                    }
                    return (
                      <span className={`text-[10px] font-extrabold px-2.5 py-2.5 rounded uppercase border ${colors}`}>
                        {BORROW_STATUS_LABELS[s]}
                      </span>
                    );
                  },
                },
                {
                  title: 'Ngày gửi',
                  dataIndex: 'createdAt',
                  render: (d: string) => <span className="text-xs text-gray-400">{dayjs(d).format('DD/MM HH:mm')}</span>,
                },
              ]}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6 h-full">
            <h3 className="text-white font-black uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
               <i className="fa-solid fa-trophy text-amber-400"></i> TOP MƯỢN THÁNG NÀY
            </h3>
            {(stats?.monthlyStats || []).length === 0 ? (
              <div className="text-center py-10">
                <i className="fa-regular fa-folder-open text-4xl text-gray-600 mb-2"></i>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Chưa có dữ liệu tháng này</div>
              </div>
            ) : (
              <div className="space-y-4">
                {(stats?.monthlyStats || []).slice(0, 6).map((item, index) => (
                  <div key={item.equipmentId} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${index === 0 ? 'bg-amber-400 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-orange-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-white/10'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-200 text-sm truncate">{item.equipmentName}</div>
                    </div>
                    <div className="bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30 text-[10px] font-black px-3 py-0.5 rounded uppercase">
                      {item.borrowCount}  lượt
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
