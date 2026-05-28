import { useState } from 'react';
import { Table, Tag, Button, Space, Modal, Input, Tabs, Spin, message, Tooltip, Descriptions } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RetweetOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  useGetAllBorrowsQuery,
  useApproveBorrowMutation,
  useRejectBorrowMutation,
  useReturnBorrowMutation,
} from '@/store/api/borrowApi';
import { BorrowResponse, BorrowStatus } from '@/types';
import { BORROW_STATUS_COLORS, BORROW_STATUS_LABELS } from '@/utils/constants';
import dayjs from 'dayjs';

export default function AdminRequestsPage() {
  const { data, isLoading } = useGetAllBorrowsQuery();
  const [approve] = useApproveBorrowMutation();
  const [reject] = useRejectBorrowMutation();
  const [returnBorrow] = useReturnBorrowMutation();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [rejectNote, setRejectNote] = useState('');
  const [detailModal, setDetailModal] = useState<BorrowResponse | null>(null);

  const allBorrows = data?.data || [];

  const filtered = activeTab === 'ALL'
    ? allBorrows
    : allBorrows.filter((b) => b.status === activeTab);

  const handleApprove = async (id: number) => {
    try {
      await approve(id).unwrap();
      message.success('✅ Đã duyệt yêu cầu và gửi email thông báo');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      message.error(error?.data?.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id) return;
    try {
      await reject({ id: rejectModal.id, adminNote: rejectNote }).unwrap();
      message.success('Đã từ chối và gửi email thông báo');
      setRejectModal({ open: false, id: null });
      setRejectNote('');
    } catch {
      message.error('Từ chối thất bại');
    }
  };

  const handleReturn = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận ghi nhận trả',
      content: 'Xác nhận thiết bị đã được trả và cập nhật số lượng kho?',
      okText: 'Xác nhận',
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          await returnBorrow(id).unwrap();
          message.success('✅ Ghi nhận trả thành công, kho đã được cập nhật');
        } catch {
          message.error('Ghi nhận thất bại');
        }
      },
    });
  };

  const tabCounts = {
    ALL: allBorrows.length,
    PENDING: allBorrows.filter(b => b.status === 'PENDING').length,
    APPROVED: allBorrows.filter(b => b.status === 'APPROVED').length,
    OVERDUE: allBorrows.filter(b => b.status === 'OVERDUE').length,
    RETURNED: allBorrows.filter(b => b.status === 'RETURNED').length,
  };

  const columns = [
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_: unknown, r: BorrowResponse) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.userName}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.userEmail}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>MSSV: {r.userStudentId || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Thiết bị',
      key: 'equipment',
      render: (_: unknown, r: BorrowResponse) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.equipmentName}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>SL: {r.quantity}</div>
        </div>
      ),
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      render: (d: string, r: BorrowResponse) => {
        const isOverdue = (r.status === 'APPROVED') && dayjs(d).isBefore(dayjs(), 'day');
        return (
          <span style={{ color: isOverdue ? '#ef4444' : undefined, fontWeight: isOverdue ? 700 : 400 }}>
            {dayjs(d).format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: BorrowStatus) => (
        <Tag color={BORROW_STATUS_COLORS[s]} style={{ borderRadius: 6, fontWeight: 600 }}>
          {BORROW_STATUS_LABELS[s]}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, r: BorrowResponse) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal(r)} />
          </Tooltip>
          {r.status === 'PENDING' && (
            <>
              <Tooltip title="Duyệt">
                <Button size="small" type="primary" icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(r.id)} style={{ background: '#10b981', borderColor: '#10b981' }} />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button size="small" danger icon={<CloseCircleOutlined />}
                  onClick={() => setRejectModal({ open: true, id: r.id })} />
              </Tooltip>
            </>
          )}
          {(r.status === 'APPROVED' || r.status === 'OVERDUE') && (
            <Tooltip title="Ghi nhận trả">
              <Button size="small" icon={<RetweetOutlined />}
                onClick={() => handleReturn(r.id)}
                style={{ color: '#6366f1', borderColor: '#6366f1' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>📋 Quản Lý Yêu Cầu Mượn</h1>
        <p>Xem, duyệt hoặc từ chối các yêu cầu mượn thiết bị</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'ALL', label: `Tất cả (${tabCounts.ALL})` },
          { key: 'PENDING', label: <span style={{ color: '#f59e0b' }}>⏳ Chờ duyệt ({tabCounts.PENDING})</span> },
          { key: 'APPROVED', label: <span style={{ color: '#3b82f6' }}>✅ Đang mượn ({tabCounts.APPROVED})</span> },
          { key: 'OVERDUE', label: <span style={{ color: '#ef4444' }}>🚨 Quá hạn ({tabCounts.OVERDUE})</span> },
          { key: 'RETURNED', label: `✔️ Đã trả (${tabCounts.RETURNED})` },
        ]}
        style={{ marginBottom: 16 }}
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          style={{ background: '#fff', borderRadius: 16 }}
          rowClassName={(r: BorrowResponse) =>
            r.status === 'OVERDUE' ? 'ant-table-row-danger' : ''
          }
        />
      )}

      {/* Reject Modal */}
      <Modal
        title="❌ Từ chối yêu cầu"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => { setRejectModal({ open: false, id: null }); setRejectNote(''); }}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Huỷ"
      >
        <p style={{ marginBottom: 12, color: '#374151' }}>Nhập lý do từ chối (tuỳ chọn):</p>
        <Input.TextArea
          rows={3}
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="Ví dụ: Thiết bị đang bảo trì, không đủ số lượng..."
          style={{ borderRadius: 10 }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="🔍 Chi tiết yêu cầu"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[<Button key="close" onClick={() => setDetailModal(null)}>Đóng</Button>]}
        width={600}
      >
        {detailModal && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Sinh viên" span={2}>{detailModal.userName}</Descriptions.Item>
            <Descriptions.Item label="Email">{detailModal.userEmail}</Descriptions.Item>
            <Descriptions.Item label="MSSV">{detailModal.userStudentId || '—'}</Descriptions.Item>
            <Descriptions.Item label="Thiết bị" span={2}>{detailModal.equipmentName}</Descriptions.Item>
            <Descriptions.Item label="Số lượng">{detailModal.quantity}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={BORROW_STATUS_COLORS[detailModal.status]}>{BORROW_STATUS_LABELS[detailModal.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày mượn">{dayjs(detailModal.borrowDate).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Ngày trả">{dayjs(detailModal.returnDate).format('DD/MM/YYYY')}</Descriptions.Item>
            {detailModal.actualReturnDate && (
              <Descriptions.Item label="Ngày trả thực tế" span={2}>
                {dayjs(detailModal.actualReturnDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ghi chú" span={2}>{detailModal.note || '—'}</Descriptions.Item>
            {detailModal.adminNote && (
              <Descriptions.Item label="Ghi chú admin" span={2} labelStyle={{ color: '#ef4444' }}>
                {detailModal.adminNote}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
