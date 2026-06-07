import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import {
  useGetEquipmentQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
} from '@/store/api/equipmentApi';
import { Equipment, EquipmentRequest } from '@/types';

export default function AdminEquipmentPage() {
  const { data, isLoading } = useGetEquipmentQuery({ admin: true });
  const [createEq] = useCreateEquipmentMutation();
  const [updateEq] = useUpdateEquipmentMutation();
  const [deleteEq] = useDeleteEquipmentMutation();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);

  const equipment = data?.data || [];

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    form.setFieldsValue(eq);
    setModalOpen(true);
  };

  const handleSubmit = async (values: EquipmentRequest) => {
    try {
      if (editingId) {
        await updateEq({ id: editingId, data: values }).unwrap();
        message.success('✅ Cập nhật thiết bị thành công');
      } else {
        await createEq(values).unwrap();
        message.success('✅ Thêm thiết bị thành công');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      message.error(error?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEq(id).unwrap();
      message.success('Đã xóa thiết bị');
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const columns = [
    {
      title: 'Thiết bị',
      key: 'name',
      render: (_: unknown, eq: Equipment) => (
        <div className="flex items-center gap-4">
          {eq.imageUrl ? (
            <img src={eq.imageUrl} alt={eq.name} className="w-12 h-12 object-cover rounded-lg border border-white/10" />
          ) : (
            <div className="w-12 h-12 bg-gray-900 rounded-lg border border-white/10 flex items-center justify-center text-xl text-gray-500">
              <i className="fa-solid fa-box"></i>
            </div>
          )}
          <div>
            <div className="font-bold text-gray-100 text-sm mb-1">{eq.name}</div>
            {eq.active ? (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Đang lưu hành</span>
            ) : (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Ngưng sử dụng</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng số',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      align: 'center' as const,
      render: (v: number) => <span className="text-gray-300 font-bold text-lg">{v}</span>,
    },
    {
      title: 'Đang mượn',
      key: 'borrowing',
      align: 'center' as const,
      render: (_: unknown, eq: Equipment) => {
        const borrowing = eq.totalQuantity - eq.availableQuantity;
        return <span className={`font-black text-lg ${borrowing > 0 ? 'text-[#e50914]' : 'text-gray-500'}`}>{borrowing}</span>;
      },
    },
    {
      title: 'Tồn kho',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      align: 'center' as const,
      render: (v: number) => {
        return (
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${v > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {v} Sẵn có
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, eq: Equipment) => (
        <Space size={8}>
          <button onClick={() => setDetailItem(eq)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 flex items-center justify-center transition cursor-pointer">
            <i className="fa-solid fa-eye"></i>
          </button>
          {eq.active && (
            <>
              <button onClick={() => openEdit(eq)} className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 flex items-center justify-center transition cursor-pointer">
                <i className="fa-solid fa-pen"></i>
              </button>
              <Popconfirm
                title="Xác nhận xóa thiết bị này?"
                onConfirm={() => handleDelete(eq.id)}
                okText="Xóa" cancelText="Huỷ" 
                overlayClassName="dark-confirm-modal"
              >
                <button className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center transition cursor-pointer">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-3">
              <i className="fa-solid fa-boxes-stacked text-[#e50914]"></i> BẢNG KIỂM KHO TÀI SẢN
            </h2>
            <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Dữ liệu tổng lượng máy móc lưu trữ trong hệ thống CLB.</p>
          </div>
          <button onClick={openAdd} className="btn-primary px-5 py-2.5 rounded-lg text-xs font-black flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> THÊM THIẾT BỊ MỚI
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20"><Spin size="large" /></div>
        ) : (
          <Table
            columns={columns}
            dataSource={equipment}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 800 }}
            className="dark-theme-table"
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={<span className="text-white font-black flex items-center gap-2"><i className={`fa-solid ${editingId ? 'fa-pen text-blue-500' : 'fa-plus text-emerald-500'}`}></i> {editingId ? 'Sửa thông tin thiết bị' : 'Thêm thiết bị vào kho'}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
        wrapClassName="dark-modal"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4" requiredMark={false}>
          <Form.Item name="name" label="Tên thiết bị" rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}>
            <Input placeholder="Ví dụ: Máy chiếu Epson EB-X51" className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-600 h-10" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết..." className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-600" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="totalQuantity" label="Số lượng tổng" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <InputNumber min={0} className="w-full bg-[#1a1a1a] border-white/10 text-white h-10 flex items-center" />
            </Form.Item>
            <Form.Item name="availableQuantity" label="Số lượng khả dụng" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <InputNumber min={0} className="w-full bg-[#1a1a1a] border-white/10 text-white h-10 flex items-center" />
            </Form.Item>
          </div>
          <Form.Item name="imageUrl" label="URL hình ảnh (tuỳ chọn)">
            <Input placeholder="https://..." className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-600 h-10" />
          </Form.Item>
          
          <div className="flex justify-end gap-3 mt-6 border-t border-white/5 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition cursor-pointer">Huỷ</button>
            <button type="submit" className="btn-primary px-6 py-2 rounded text-white font-black">
              {editingId ? 'CẬP NHẬT' : 'THÊM MỚI'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal 
        title={<span className="text-white font-black flex items-center gap-2"><i className="fa-solid fa-box-open text-amber-500"></i> Chi tiết thiết bị</span>}
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        footer={null}
        wrapClassName="dark-modal"
        centered
      >
        {detailItem && (
          <div className="mt-4">
            {detailItem.imageUrl ? (
              <img src={detailItem.imageUrl} alt={detailItem.name} className="w-full h-48 object-cover rounded-xl mb-4 border border-white/10" />
            ) : (
              <div className="w-full h-48 bg-gray-900 rounded-xl mb-4 border border-white/10 flex items-center justify-center text-4xl text-gray-500">
                <i className="fa-solid fa-image"></i>
              </div>
            )}
            
            <h3 className="text-xl font-black text-white mb-2">{detailItem.name}</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{detailItem.description || 'Chưa có mô tả cho thiết bị này.'}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5">
                <div className="text-2xl font-black text-indigo-400">{detailItem.totalQuantity}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Tổng số</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5">
                <div className="text-2xl font-black text-emerald-400">{detailItem.availableQuantity}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Khả dụng</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5">
                <div className="text-2xl font-black text-[#5b5cf0]">{detailItem.totalQuantity - detailItem.availableQuantity}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Đang mượn</div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setDetailItem(null)} className="px-5 py-2 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer">Đóng</button>
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
