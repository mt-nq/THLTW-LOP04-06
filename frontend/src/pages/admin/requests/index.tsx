import { useState } from 'react';
import { Modal, Input, Spin, message, Tooltip, Empty } from 'antd';
import {
  useGetAllBorrowsQuery,
  useApproveBorrowMutation,
  useRejectBorrowMutation,
  useReturnBorrowMutation,
} from '@/store/api/borrowApi';
import { BorrowResponse } from '@/types';
import dayjs from 'dayjs';

export default function AdminRequestsPage() {
  const { data, isLoading } = useGetAllBorrowsQuery();
  const [approve] = useApproveBorrowMutation();
  const [reject] = useRejectBorrowMutation();
  const [returnBorrow] = useReturnBorrowMutation();

  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [approveModal, setApproveModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [approveNote, setApproveNote] = useState('');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [rejectNote, setRejectNote] = useState('');
  const [detailModal, setDetailModal] = useState<BorrowResponse | null>(null);

  const allBorrows = data?.data || [];

  const filtered = activeTab === 'ALL'
    ? allBorrows
    : allBorrows.filter((b) => b.status === activeTab);

  const handleApprove = async () => {
    if (!approveModal.id) return;
    try {
      await approve({ id: approveModal.id, adminNote: approveNote }).unwrap();
      message.success('✅ Đã duyệt yêu cầu và gửi email thông báo');
      setApproveModal({ open: false, id: null });
      setApproveNote('');
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
      className: 'dark-confirm-modal',
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
    REJECTED: allBorrows.filter(b => b.status === 'REJECTED').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-6">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-white flex items-center gap-3 m-0">
            <i className="fa-solid fa-folder-open text-[#5b5cf0]"></i> HỆ THỐNG PHÊ DUYỆT PHIẾU
          </h1>
          <p className="text-sm text-gray-500 mt-2 m-0">Nơi xử lý luồng tiếp nhận đồ dùng từ sinh viên.</p>
        </div>
        
        <div className="flex bg-[#121212] p-1 rounded-lg border border-white/5 text-xs font-bold text-gray-400">
          <button 
            onClick={() => setActiveTab('PENDING')} 
            className={`px-5 py-2 rounded-md transition cursor-pointer ${activeTab === 'PENDING' ? 'bg-[#5b5cf0] text-white shadow-[0_4px_18px_rgba(91,92,240,0.4)]' : 'hover:text-white hover:bg-white/5'}`}
          >
            Chờ duyệt ({tabCounts.PENDING})
          </button>
          <button 
            onClick={() => setActiveTab('APPROVED')} 
            className={`px-5 py-2 rounded-md transition cursor-pointer ${activeTab === 'APPROVED' ? 'bg-[#5b5cf0] text-white shadow-[0_4px_18px_rgba(91,92,240,0.4)]' : 'hover:text-white hover:bg-white/5'}`}
          >
            Đang mượn ({tabCounts.APPROVED})
          </button>
          <button 
            onClick={() => setActiveTab('OVERDUE')} 
            className={`px-5 py-2 rounded-md transition cursor-pointer ${activeTab === 'OVERDUE' ? 'bg-[#5b5cf0] text-white shadow-[0_4px_18px_rgba(91,92,240,0.4)]' : 'hover:text-white hover:bg-white/5'}`}
          >
            Quá hạn ({tabCounts.OVERDUE})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20"><Spin size="large" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#121212] border border-white/5 rounded-xl p-16 text-center">
            <Empty description={<span className="text-gray-500 font-bold">Không có yêu cầu nào</span>} />
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="bg-[#121212] border border-white/5 rounded-xl p-5 hover:border-white/10 transition cursor-default">
              
              {/* TOP ROW */}
              <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-[#5b5cf0] bg-[#5b5cf0]/10 border border-[#5b5cf0]/20 px-2 py-0.5 rounded">
                    #YC-{r.id}
                  </span>
                  <div className="text-white font-bold text-base">
                    {r.userName} <span className="text-gray-500 font-normal text-sm ml-1">| MSSV: {r.userStudentId || '—'}</span>
                  </div>
                  <Tooltip title="Xem ghi chú sinh viên">
                    <button onClick={() => setDetailModal(r)} className="ml-2 text-gray-500 hover:text-white transition cursor-pointer">
                      <i className="fa-solid fa-circle-info"></i>
                    </button>
                  </Tooltip>
                </div>
                
                {/* STATUS BADGE */}
                <div>
                  {r.status === 'PENDING' && (
                    <div className="bg-[#ffc107]/10 border border-[#ffc107]/30 text-[#ffc107] text-[10px] font-black px-3 py-1 rounded flex items-center gap-2">
                      <i className="fa-solid fa-hourglass-half"></i> CHỜ XỬ LÝ
                    </div>
                  )}
                  {r.status === 'APPROVED' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black px-3 py-1 rounded flex items-center gap-2">
                      <i className="fa-solid fa-check"></i> ĐANG MƯỢN
                    </div>
                  )}
                  {r.status === 'OVERDUE' && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black px-3 py-1 rounded flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i> QUÁ HẠN
                    </div>
                  )}
                  {r.status === 'RETURNED' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-3 py-1 rounded flex items-center gap-2">
                      <i className="fa-solid fa-rotate-left"></i> ĐÃ TRẢ
                    </div>
                  )}
                  {r.status === 'REJECTED' && (
                    <div className="bg-gray-500/10 border border-gray-500/30 text-gray-400 text-[10px] font-black px-3 py-1 rounded flex items-center gap-2">
                      <i className="fa-solid fa-xmark"></i> ĐÃ TỪ CHỐI
                    </div>
                  )}
                </div>
              </div>

              {/* MIDDLE ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <i className="fa-solid fa-boxes-stacked w-4 text-center"></i>
                  <span>Thiết bị yêu cầu: <strong className="text-white">{r.equipmentName} (Số lượng: {r.quantity})</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <i className="fa-solid fa-calendar-days w-4 text-center text-blue-400"></i>
                  <span>Thời hạn đăng ký: <span className="text-white">{dayjs(r.borrowDate).format('DD/MM/YYYY')} <i className="fa-solid fa-arrow-right mx-1 text-[10px]"></i> {dayjs(r.returnDate).format('DD/MM/YYYY')}</span></span>
                </div>
              </div>

              {/* BOTTOM ROW - ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                {r.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => setRejectModal({ open: true, id: r.id })} 
                      className="bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 font-bold text-sm px-6 py-2 rounded transition cursor-pointer border border-white/5 hover:border-white/20"
                    >
                      Từ chối đơn
                    </button>
                    <button 
                      onClick={() => setApproveModal({ open: true, id: r.id })} 
                      className="btn-primary font-bold text-sm px-6 py-2 rounded transition cursor-pointer"
                    >
                      Duyệt cấp đồ
                    </button>
                  </>
                )}
                {(r.status === 'APPROVED' || r.status === 'OVERDUE') && (
                  <button 
                    onClick={() => handleReturn(r.id)} 
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-2 rounded transition cursor-pointer border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]"
                  >
                    Ghi nhận đã trả
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        title={<span className="text-emerald-400 font-black flex items-center gap-2"><i className="fa-solid fa-check-circle"></i> Duyệt Yêu Cầu</span>}
        open={approveModal.open}
        onOk={handleApprove}
        onCancel={() => { setApproveModal({ open: false, id: null }); setApproveNote(''); }}
        okText="Xác nhận duyệt"
        cancelText="Huỷ"
        wrapClassName="dark-modal"
        centered
      >
        <div className="p-4 bg-white/5 rounded-lg border border-white/5 mt-4">
          <p className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Nhập ghi chú gửi sinh viên (Tuỳ chọn):</p>
          <Input.TextArea
            rows={3}
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            placeholder="Ví dụ: Lên phòng 204 nhận đồ nhé..."
            className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-600"
          />
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={<span className="text-red-500 font-black flex items-center gap-2"><i className="fa-solid fa-circle-xmark"></i> Từ Chối Yêu Cầu</span>}
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => { setRejectModal({ open: false, id: null }); setRejectNote(''); }}
        okText="Từ chối yêu cầu"
        cancelText="Huỷ"
        wrapClassName="dark-modal"
        centered
      >
        <div className="p-4 bg-white/5 rounded-lg border border-white/5 mt-4">
          <p className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Lý do từ chối (Tuỳ chọn):</p>
          <Input.TextArea
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Ví dụ: Thiết bị đang bảo trì..."
            className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-600"
          />
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={<span className="text-white font-black flex items-center gap-2"><i className="fa-solid fa-circle-info text-[#5b5cf0]"></i> Chi Tiết Lời Nhắn</span>}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        wrapClassName="dark-modal"
        centered
      >
        {detailModal && (
          <div className="mt-4 space-y-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/5">
               <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Mục đích sử dụng của sinh viên</div>
               <div className="text-sm text-gray-300 italic">"{detailModal.note || 'Không có ghi chú bổ sung'}"</div>
            </div>

            {detailModal.adminNote && (
              <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">Ghi chú từ quản trị viên</div>
                <div className="text-sm text-red-200">{detailModal.adminNote}</div>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button onClick={() => setDetailModal(null)} className="px-5 py-2 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer">Đóng</button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .dark-modal .ant-modal-content {
          background-color: #141414 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .dark-modal .ant-modal-header {
          background-color: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          padding: 20px 24px !important;
        }
        .dark-modal .ant-modal-body {
          padding: 24px !important;
        }
        .dark-modal .ant-modal-footer {
          padding: 16px 24px 24px !important;
          border-top: none !important;
        }
        .dark-modal .ant-modal-title {
          color: #fff !important;
        }
        .dark-modal .ant-modal-close {
          color: #9ca3af !important;
          top: 18px !important;
          inset-inline-end: 24px !important;
        }
        .dark-modal .ant-btn {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          color: #fff;
        }
        .dark-modal .ant-btn-primary {
          background: #5b5cf0;
          border-color: #5b5cf0;
        }
        .dark-confirm-modal .ant-modal-content {
          background-color: #141414 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          padding: 24px !important;
        }
        .dark-confirm-modal .ant-modal-confirm-title {
          color: #fff !important;
          font-weight: 900 !important;
        }
        .dark-confirm-modal .ant-modal-confirm-content {
          color: #9ca3af !important;
          margin-top: 8px !important;
        }
        .dark-confirm-modal .ant-btn {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          color: #fff;
          font-weight: bold;
          border-radius: 6px;
        }
        .dark-confirm-modal .ant-btn-primary {
          background: #5b5cf0 !important;
          border-color: #5b5cf0 !important;
        }
      `}</style>
    </div>
  );
}
