import { useState } from 'react';
import { Select, Table, Tag, Alert, Spin, Empty } from 'antd';
import { Column } from '@ant-design/charts';
import { useGetMonthlyStatsQuery, useGetOverdueQuery } from '@/store/api/statisticsApi';
import { BorrowResponse } from '@/types';
import { BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

const currentMonth = dayjs().month() + 1;
const currentYear = dayjs().year();

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

const years = [currentYear - 1, currentYear].map((y) => ({ value: y, label: `Năm ${y}` }));

export default function StatisticsPage() {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const { data: statsData, isLoading } = useGetMonthlyStatsQuery({ month, year });
  const { data: overdueData, isLoading: overdueLoading } = useGetOverdueQuery();

  const stats = statsData?.data || [];
  const overdueList = overdueData?.data || [];

  const chartData = stats.map((s) => ({
    name: s.equipmentName.length > 20 ? s.equipmentName.substring(0, 20) + '...' : s.equipmentName,
    value: Number(s.borrowCount),
  }));

  const chartConfig = {
    data: chartData,
    xField: 'name',
    yField: 'value',
    color: '#e50914',
    columnStyle: {
      radius: [4, 4, 0, 0],
      fill: 'l(90) 0:#b1060f 1:#e50914',
    },
    label: {
      position: 'top' as const,
      style: { fontWeight: 900, fill: '#fff' },
    },
    xAxis: {
      label: { autoRotate: true, style: { fill: '#9ca3af', fontSize: 10, fontWeight: 700 } },
    },
    yAxis: {
      label: { style: { fill: '#9ca3af' } },
      grid: { line: { style: { stroke: 'rgba(255,255,255,0.05)' } } },
    },
    meta: { value: { alias: 'Số lượt mượn' } },
    tooltip: {
      formatter: (d: { name: string; value: number }) => ({ name: 'Số lượt', value: d.value }),
      customContent: (title: string, data: any[]) => {
        return `<div style="background: #141414; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
          <div style="color: #fff; font-weight: bold; margin-bottom: 8px;">${title}</div>
          ${data.map(item => `<div style="color: #e50914; font-weight: 900;">${item.name}: ${item.value}</div>`).join('')}
        </div>`;
      }
    },
  };

  const overdueColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => <span className="text-gray-500 font-bold">{index + 1}</span>,
    },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_: unknown, r: BorrowResponse) => (
        <div>
          <div className="font-bold text-gray-200">{r.userName}</div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">{r.userEmail}</div>
        </div>
      ),
    },
    { title: 'Thiết bị', dataIndex: 'equipmentName', render: (n: string) => <span className="text-gray-300 font-bold">{n}</span> },
    { title: 'SL', dataIndex: 'quantity', align: 'center' as const, render: (v: number) => <span className="text-white font-black">{v}</span> },
    {
      title: 'Hạn trả',
      dataIndex: 'returnDate',
      render: (d: string) => {
        const days = dayjs().diff(dayjs(d), 'day');
        return (
          <div>
            <div className="text-red-400 font-bold">{dayjs(d).format('DD/MM/YYYY')}</div>
            <div className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded uppercase font-black inline-block mt-1">
              Trễ {days} ngày
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-3">
            <i className="fa-solid fa-chart-line text-[#e50914]"></i> THỐNG KÊ & BÁO CÁO
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Số liệu chi tiết về hoạt động mượn trả.</p>
        </div>
      </div>

      {overdueList.length > 0 && (
        <Alert
          message={<span className="font-black text-red-400"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Có {overdueList.length} thiết bị đang quá hạn trả!</span>}
          type="error"
          className="bg-red-500/10 border border-red-500/20 mb-6"
        />
      )}

      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h3 className="text-white font-black uppercase tracking-wider text-sm flex items-center gap-2">
            <i className="fa-solid fa-chart-column text-indigo-400"></i> BIỂU ĐỒ MƯỢN NHIỀU NHẤT
          </h3>
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <Select
              value={month}
              onChange={setMonth}
              options={months}
              className="w-28 dark-select"
              dropdownStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <Select
              value={year}
              onChange={setYear}
              options={years}
              className="w-28 dark-select"
              dropdownStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20"><Spin size="large" /></div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-16">
            <Empty description={<span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Không có dữ liệu tháng {month}/{year}</span>} />
          </div>
        ) : (
          <div style={{ height: 350 }}>
            <Column {...chartConfig} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6">
          <h3 className="text-white font-black uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
             <i className="fa-solid fa-list-ol text-emerald-400"></i> CHI TIẾT THÁNG {month}/{year}
          </h3>
          {stats.length > 0 ? (
            <Table
              dataSource={stats}
              rowKey="equipmentId"
              pagination={{ pageSize: 5 }}
              size="small"
              className="dark-theme-table"
              columns={[
                {
                  title: 'Hạng',
                  key: 'rank',
                  width: 60,
                  align: 'center',
                  render: (_: unknown, __: unknown, index: number) => (
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-black text-[10px] ${index === 0 ? 'bg-amber-400 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                      {index + 1}
                    </div>
                  ),
                },
                { title: 'Tên thiết bị', dataIndex: 'equipmentName', key: 'equipmentName', render: (n: string) => <span className="font-bold text-gray-200">{n}</span> },
                {
                  title: 'Số lượng mượn',
                  dataIndex: 'borrowCount',
                  key: 'borrowCount',
                  align: 'center',
                  render: (v: number) => <span className="bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30 px-2 py-0.5 rounded font-black text-xs">{v}</span>,
                },
              ]}
            />
          ) : (
            <div className="text-center py-10 text-gray-500 text-xs font-bold uppercase tracking-wider">Chưa có lượt mượn</div>
          )}
        </div>

        <div className="bg-[#121212] border border-t-4 border-white/5 border-t-red-500 rounded-2xl overflow-hidden shadow-2xl p-6">
          <h3 className="text-red-400 font-black uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
             <i className="fa-solid fa-skull-crossbones"></i> DANH SÁCH QUÁ HẠN {overdueList.length > 0 && `(${overdueList.length})`}
          </h3>
          
          {overdueLoading ? (
            <div className="text-center py-10"><Spin /></div>
          ) : overdueList.length === 0 ? (
            <div className="text-center py-10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
               <i className="fa-solid fa-check-circle text-3xl mb-2 block"></i> Không có thiết bị nào quá hạn!
            </div>
          ) : (
            <Table
              columns={overdueColumns}
              dataSource={overdueList}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              className="dark-theme-table border-red-500"
            />
          )}
        </div>
      </div>

      <style>{`
        .dark-select .ant-select-selector {
          background-color: transparent !important;
          border: none !important;
          color: #fff !important;
          font-weight: bold;
        }
        .dark-select .ant-select-arrow {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
