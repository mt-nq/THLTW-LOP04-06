import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Tooltip, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import {
  useGetEquipmentQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
} from '@/store/api/equipmentApi';
import { Equipment, EquipmentRequest } from '@/types';
import dayjs from 'dayjs';

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
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Thiết bị',
      key: 'name',
      render: (_: unknown, eq: Equipment) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {eq.imageUrl ? (
            <img src={eq.imageUrl} alt={eq.name}
              style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10 }} />
          ) : (
            <div style={{ width: 48, height: 48, background: '#eef2ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📦</div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{eq.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280', maxWidth: 200 }}>
              {eq.description?.substring(0, 50)}{eq.description && eq.description.length > 50 ? '...' : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng số',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      align: 'center' as const,
      render: (v: number) => <strong style={{ fontSize: 16 }}>{v}</strong>,
    },
    {
      title: 'Khả dụng',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      align: 'center' as const,
      render: (v: number, eq: Equipment) => {
        const pct = eq.totalQuantity > 0 ? (v / eq.totalQuantity) * 100 : 0;
        const color = pct === 0 ? '#ef4444' : pct <= 30 ? '#f59e0b' : '#10b981';
        return <strong style={{ fontSize: 16, color }}>{v}</strong>;
      },
    },
    {
      title: 'Đang mượn',
      key: 'borrowing',
      align: 'center' as const,
      render: (_: unknown, eq: Equipment) => (
        <span style={{ fontWeight: 700, color: '#6366f1' }}>
          {eq.totalQuantity - eq.availableQuantity}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, eq: Equipment) => (
        eq.active
          ? <Tag color="green">Hoạt động</Tag>
          : <Tag color="red">Đã xóa</Tag>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, eq: Equipment) => (
        <Space size={4}>
          <Tooltip title="Chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailItem(eq)} />
          </Tooltip>
          {eq.active && (
            <>
              <Tooltip title="Sửa">
                <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(eq)} />
              </Tooltip>
              <Tooltip title="Xóa">
                <Popconfirm
                  title="Xác nhận xóa thiết bị này?"
                  onConfirm={() => handleDelete(eq.id)}
                  okText="Xóa" cancelText="Huỷ" okButtonProps={{ danger: true }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🗄️ Quản Lý Kho Thiết Bị</h1>
          <p>Thêm, sửa, xóa thiết bị và cập nhật số lượng tồn kho</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openAdd}
          style={{ borderRadius: 10 }}>
          Thêm thiết bị
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : (
        <Table
          columns={columns}
          dataSource={equipment}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ background: '#fff', borderRadius: 16 }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingId ? '✏️ Sửa thiết bị' : '➕ Thêm thiết bị mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên thiết bị"
            rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}>
            <Input placeholder="Ví dụ: Máy chiếu Epson EB-X51" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết thiết bị..." style={{ borderRadius: 10 }} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="totalQuantity" label="Số lượng tổng"
              rules={[{ required: true, message: 'Bắt buộc' }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="availableQuantity" label="Số lượng khả dụng"
              rules={[{ required: true, message: 'Bắt buộc' }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} />
            </Form.Item>
          </Space>
          <Form.Item name="imageUrl" label="URL hình ảnh (tuỳ chọn)">
            <Input placeholder="https://..." style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Huỷ</Button>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 10 }}>
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title="📦 Chi tiết thiết bị" open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        footer={[<Button key="close" onClick={() => setDetailItem(null)}>Đóng</Button>]}>
        {detailItem && (
          <div>
            {detailItem.imageUrl && (
              <img src={detailItem.imageUrl} alt={detailItem.name}
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />
            )}
            <h3 style={{ fontWeight: 700 }}>{detailItem.name}</h3>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>{detailItem.description}</p>
            <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
              {[
                { label: 'Tổng số', value: detailItem.totalQuantity, color: '#6366f1' },
                { label: 'Khả dụng', value: detailItem.availableQuantity, color: '#10b981' },
                { label: 'Đang mượn', value: detailItem.totalQuantity - detailItem.availableQuantity, color: '#f59e0b' },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, padding: '12px 0', background: '#f8f9ff', borderRadius: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
