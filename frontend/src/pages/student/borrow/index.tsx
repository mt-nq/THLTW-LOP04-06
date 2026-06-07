import { useState, useEffect } from 'react';
import { Form, Select, InputNumber, DatePicker, Input, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetEquipmentQuery } from '@/store/api/equipmentApi';
import { useCreateBorrowMutation } from '@/store/api/borrowApi';
import { BorrowCreateRequest } from '@/types';
import dayjs from 'dayjs';

/* ── Required star ── */
const Req = () => <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;

export default function BorrowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [createBorrow, { isLoading }] = useCreateBorrowMutation();
  const { data: eqData } = useGetEquipmentQuery({ search: '' });
  const equipment = eqData?.data || [];

  const [selectedEqId, setSelectedEqId] = useState<number | null>(null);
  const [borrowDate, setBorrowDate] = useState<dayjs.Dayjs>(dayjs());

  /* Watch each required field individually — reliable way with Ant Design */
  const eqIdVal     = Form.useWatch('equipmentId', form);
  const quantityVal = Form.useWatch('quantity', form);
  const borrowVal   = Form.useWatch('borrowDate', form);
  const returnVal   = Form.useWatch('returnDate', form);

  const formValid = !!(eqIdVal && quantityVal && borrowVal && returnVal);

  const selectedEq = equipment.find(e => e.id === selectedEqId);

  useEffect(() => {
    if (location.state?.equipmentId) {
      setSelectedEqId(location.state.equipmentId);
      form.setFieldValue('equipmentId', location.state.equipmentId);
    }
  }, [location.state, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const request: BorrowCreateRequest = {
      equipmentId: values.equipmentId as number,
      quantity: values.quantity as number,
      borrowDate: (values.borrowDate as dayjs.Dayjs).format('YYYY-MM-DD'),
      returnDate: (values.returnDate as dayjs.Dayjs).format('YYYY-MM-DD'),
      note: (values.note as string) || undefined,
    };
    try {
      await createBorrow(request).unwrap();
      message.success('🎉 Gửi yêu cầu mượn thành công! Vui lòng chờ duyệt.');
      form.resetFields();
      navigate('/student/history');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      message.error(error?.data?.message || 'Gửi yêu cầu thất bại');
    }
  };

  const noteItems = [
    { icon: 'fa-clock',                color: '#fbbf24', bg: 'rgba(245,158,11,0.13)',  border: 'rgba(245,158,11,0.25)',  text: 'Đơn sẽ được Admin duyệt trong vòng 24 giờ làm việc.' },
    { icon: 'fa-building',             color: '#60a5fa', bg: 'rgba(59,130,246,0.13)',  border: 'rgba(59,130,246,0.25)', text: 'Đến phòng CLB để nhận thiết bị sau khi được duyệt.' },
    { icon: 'fa-triangle-exclamation', color: '#f87171', bg: 'rgba(239,68,68,0.13)',   border: 'rgba(239,68,68,0.25)',  text: 'Trả trễ hạn sẽ bị cấm mượn đồ trong 1 tháng.' },
    { icon: 'fa-shield-halved',        color: '#34d399', bg: 'rgba(16,185,129,0.13)',  border: 'rgba(16,185,129,0.25)', text: 'Người mượn chịu trách nhiệm bồi thường nếu làm hỏng, mất tài sản.' },
  ];

  /* Label helper */
  const lbl = (text: string, required = false) => (
    <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {text}{required && <Req />}
    </span>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#141414', padding: '36px 4% 60px' }}>
      <div style={{ maxWidth: 940, margin: '0 auto' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/student/equipment')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e5e7eb')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
        >
          <i className="fa-solid fa-arrow-left" /> Quay lại kho thiết bị
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,#5b5cf0,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(91,92,240,0.4)' }}>
            <i className="fa-solid fa-file-signature" style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Lập Phiếu Mượn Đồ</h1>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Điền thông tin để ban quản trị CLB xét duyệt và cấp phát thiết bị.</p>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* ── Form card ── */}
          <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', padding: '28px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span style={{ width: 3, height: 18, background: '#5b5cf0', borderRadius: 2, display: 'block' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Thông tin yêu cầu</span>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}
              initialValues={{ quantity: 1, borrowDate: dayjs() }} requiredMark={false}>

              {/* Thiết bị */}
              <Form.Item name="equipmentId" label={lbl('Thiết bị muốn mượn', true)}
                rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
                <Select
                  showSearch placeholder="Chọn thiết bị..." optionFilterProp="label" size="large"
                  onChange={val => setSelectedEqId(val)}
                  options={equipment.map(eq => ({
                    value: eq.id,
                    label: eq.name,
                    disabled: eq.availableQuantity === 0,
                  }))}
                />
              </Form.Item>

              {/* Số lượng */}
              <Form.Item name="quantity" label={lbl('Số lượng cần mượn', true)}
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng' },
                  { validator: (_, v) => selectedEq && v > selectedEq.availableQuantity ? Promise.reject(`Chỉ còn ${selectedEq.availableQuantity} chiếc`) : Promise.resolve() },
                ]}>
                <InputNumber min={1} max={selectedEq?.availableQuantity || 99} size="large" style={{ width: '100%' }} />
              </Form.Item>

              {/* Ngày mượn / trả */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item name="borrowDate" label={lbl('Ngày mượn', true)}
                  rules={[{ required: true, message: 'Chọn ngày mượn' }]}>
                  <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY"
                    placeholder="dd/mm/yyyy"
                    disabledDate={d => d.isBefore(dayjs().startOf('day'))}
                    onChange={d => d && setBorrowDate(d)}
                  />
                </Form.Item>
                <Form.Item name="returnDate" label={lbl('Ngày trả', true)}
                  rules={[
                    { required: true, message: 'Chọn ngày trả' },
                    ({ getFieldValue }) => ({
                      validator(_, v) {
                        if (!v || v.isAfter(getFieldValue('borrowDate'))) return Promise.resolve();
                        return Promise.reject('Ngày trả phải sau ngày mượn');
                      },
                    }),
                  ]}>
                  <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY"
                    placeholder="dd/mm/yyyy"
                    disabledDate={d => d.isBefore(borrowDate) || d.isSame(borrowDate, 'day')}
                  />
                </Form.Item>
              </div>

              {/* Ghi chú */}
              <Form.Item name="note" label={lbl('Mục đích sử dụng & Ghi chú')}>
                <Input.TextArea
                  rows={4}
                  placeholder="Ghi rõ mục đích sử dụng (VD: Đồ án môn học, Sự kiện CLB, Quay MV...)"
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !formValid}
                style={{
                  width: '100%', height: 48, borderRadius: 8, border: 'none',
                  background: isLoading || !formValid
                    ? '#252525'
                    : 'linear-gradient(135deg,#5b5cf0,#4338ca)',
                  color: isLoading || !formValid ? '#4b5563' : '#fff',
                  fontSize: 14, fontWeight: 800,
                  cursor: isLoading || !formValid ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: isLoading || !formValid ? 'none' : '0 4px 18px rgba(91,92,240,0.4)',
                  transition: 'all 0.2s ease',
                  marginTop: 4,
                }}
                onMouseEnter={e => { if (!isLoading && formValid) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)'; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'none'}
              >
                {isLoading
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Đang xử lý...</>
                  : <><i className={`fa-solid ${formValid ? 'fa-paper-plane' : 'fa-lock'}`} /> {formValid ? 'Gửi Yêu Cầu Mượn' : 'Điền đủ thông tin để gửi'}</>
                }
              </button>
            </Form>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Equipment preview */}
            {selectedEq ? (
              <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: 150, background: '#161616' }}>
                  {selectedEq.imageUrl ? (
                    <img src={selectedEq.imageUrl} alt={selectedEq.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12, boxSizing: 'border-box' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-box" style={{ color: '#333', fontSize: 32 }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1e1e1e 0%, transparent 60%)' }} />
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: selectedEq.availableQuantity > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.85)',
                    color: '#fff', fontSize: 9, fontWeight: 800,
                    padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <i className={`fa-solid fa-${selectedEq.availableQuantity > 0 ? 'check' : 'xmark'}`} style={{ fontSize: 8 }} />
                    {selectedEq.availableQuantity > 0 ? 'Khả dụng' : 'Hết hàng'}
                  </div>
                </div>
                <div style={{ padding: '4px 14px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{selectedEq.name}</div>
                  {selectedEq.description && (
                    <div style={{ fontSize: 11, color: '#a0aec0', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {selectedEq.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 12px', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Khả dụng</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: selectedEq.availableQuantity > 0 ? '#10b981' : '#ef4444' }}>
                      {selectedEq.availableQuantity} / {selectedEq.totalQuantity} chiếc
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 12px' }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Ngày nhập kho</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>
                      {dayjs(selectedEq.createdAt).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.1)', padding: '36px 20px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(91,92,240,0.08)', border: '1px solid rgba(91,92,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <i className="fa-solid fa-box-open" style={{ fontSize: 22, color: '#4b5563' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', marginBottom: 4 }}>Chưa chọn thiết bị</div>
                <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>Chọn thiết bị bên trái để xem thông tin chi tiết và số lượng còn lại</div>
              </div>
            )}

            {/* Rules */}
            <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', padding: '16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ width: 3, height: 14, background: '#f59e0b', borderRadius: 2, display: 'block' }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lưu ý quan trọng</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {noteItems.map((n, i) => (
                  <div key={i} style={{ background: n.bg, border: `1px solid ${n.border}`, borderRadius: 6, padding: '9px 10px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <i className={`fa-solid ${n.icon}`} style={{ color: n.color, fontSize: 11, marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.5 }}>{n.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
