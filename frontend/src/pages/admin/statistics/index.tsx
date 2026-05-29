import { useState } from 'react';
import { Row, Col, Card, Select, Table, Tag, Alert, Spin, Empty } from 'antd';
import { Column } from '@ant-design/charts';
import { useGetMonthlyStatsQuery, useGetOverdueQuery } from '@/store/api/statisticsApi';
import { BorrowResponse } from '@/types';
import { BORROW_STATUS_COLORS, BORROW_STATUS_LABELS } from '@/utils/constants';
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
    color: '#6366f1',
    columnStyle: {
      radius: [8, 8, 0, 0],
      fill: 'l(90) 0:#818cf8 1:#4f46e5',
    },
    label: {
      position: 'top' as const,
      style: { fontWeight: 700, fill: '#4f46e5' },
    },
    xAxis: {
      label: { autoRotate: true, style: { fontSize: 11 } },
    },
    yAxis: {
      title: { text: 'Số lượng mượn' },
      grid: { line: { style: { stroke: '#f3f4f6' } } },
    },
    meta: { value: { alias: 'Số lượng mượn' } },
    tooltip: {
      formatter: (d: { name: string; value: number }) => ({ name: 'Số lượng mượn', value: d.value }),
    },
  };

  const overdueColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_: unknown, r: BorrowResponse) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.userName}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{r.userEmail}</div>
        </div>
      ),
    },
    { title: 'Thiết bị', dataIndex: 'equipmentName' },
    { title: 'SL', dataIndex: 'quantity', align: 'center' as const },
    {
      title: 'Hạn trả',
      dataIndex: 'returnDate',
      render: (d: string) => (
        <span style={{ color: '#ef4444', fontWeight: 700 }}>
          {dayjs(d).format('DD/MM/YYYY')}
          {' '}({dayjs().diff(dayjs(d), 'day')} ngày)
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) => (
        <Tag color="volcano" style={{ fontWeight: 600 }}>
          {BORROW_STATUS_LABELS[s as keyof typeof BORROW_STATUS_LABELS]}
        </Tag>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>📊 Thống Kê & Báo Cáo</h1>
        <p>Xem thống kê thiết bị mượn nhiều và danh sách quá hạn</p>
      </div>

      {/* Overdue Alert */}
      {overdueList.length > 0 && (
        <Alert
          message={`🚨 Có ${overdueList.length} thiết bị đang quá hạn trả!`}
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {/* Monthly Statistics Chart */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontWeight: 700 }}>📈 Thiết bị mượn nhiều nhất</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Select
                value={month}
                onChange={setMonth}
                options={months}
                style={{ width: 120 }}
              />
              <Select
                value={year}
                onChange={setYear}
                options={years}
                style={{ width: 100 }}
              />
            </div>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
        ) : chartData.length === 0 ? (
          <Empty description={`Không có dữ liệu tháng ${month}/${year}`} style={{ padding: 40 }} />
        ) : (
          <Column {...chartConfig} height={300} />
        )}
      </Card>

      {/* Monthly Stats Table */}
      {stats.length > 0 && (
        <Card
          title={`📋 Chi tiết - Tháng ${month}/${year}`}
          style={{ borderRadius: 16, marginBottom: 24 }}
        >
          <Table
            dataSource={stats}
            rowKey="equipmentId"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'Hạng',
                key: 'rank',
                width: 60,
                align: 'center',
                render: (_: unknown, __: unknown, index: number) => (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto',
                    background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#f97316' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, color: index < 3 ? '#fff' : '#374151',
                  }}>
                    {index + 1}
                  </div>
                ),
              },
              { title: 'Tên thiết bị', dataIndex: 'equipmentName', key: 'equipmentName', render: (n: string) => <strong>{n}</strong> },
              {
                title: 'Số lượng mượn',
                dataIndex: 'borrowCount',
                key: 'borrowCount',
                align: 'center',
                render: (v: number) => <Tag color="purple" style={{ fontWeight: 700, fontSize: 14 }}>{v}</Tag>,
              },
            ]}
          />
        </Card>
      )}

      {/* Overdue List */}
      <Card
        title={
          <span style={{ color: overdueList.length > 0 ? '#ef4444' : undefined }}>
            🚨 Danh sách thiết bị quá hạn {overdueList.length > 0 ? `(${overdueList.length})` : ''}
          </span>
        }
        style={{ borderRadius: 16 }}
      >
        {overdueLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : overdueList.length === 0 ? (
          <Empty description="✅ Không có thiết bị nào quá hạn!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            columns={overdueColumns}
            dataSource={overdueList}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
            rowClassName={() => 'overdue-row'}
          />
        )}
      </Card>
    </div>
  );
}
