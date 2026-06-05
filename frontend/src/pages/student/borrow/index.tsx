import { useState, useEffect } from 'react';
import { Form, Select, InputNumber, DatePicker, Input, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetEquipmentQuery } from '@/store/api/equipmentApi';
import { useCreateBorrowMutation } from '@/store/api/borrowApi';
import { BorrowCreateRequest } from '@/types';
import dayjs from 'dayjs';

export default function BorrowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [createBorrow, { isLoading }] = useCreateBorrowMutation();
  const { data: eqData } = useGetEquipmentQuery({ search: '' });
  const equipment = eqData?.data || [];

  const [selectedEqId, setSelectedEqId] = useState<number | null>(null);
  const selectedEq = equipment.find((e) => e.id === selectedEqId);

  // Pre-select equipment if passed from equipment page
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
      note: values.note as string | undefined,
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

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/student/equipment')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-bold transition cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i> Quay lại kho thiết bị
        </button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="text-[#e50914]"><i className="fa-solid fa-file-signature"></i></span>
            LẬP PHIẾU MƯỢN ĐỒ
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Điền thông tin chi tiết để ban quản trị CLB xem xét và cấp phát thiết bị.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#141414] rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <span className="w-2 h-2 rounded-full bg-[#e50914] animate-ping"></span> 
                Thông tin yêu cầu
              </h3>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ quantity: 1, borrowDate: dayjs() }}
                requiredMark={false}
              >
                <Form.Item
                  name="equipmentId"
                  label="Thiết bị muốn mượn"
                  rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn thiết bị..."
                    optionFilterProp="label"
                    size="large"
                    onChange={(val) => setSelectedEqId(val)}
                    options={equipment.map((eq) => ({
                      value: eq.id,
                      label: eq.name,
                      disabled: eq.availableQuantity === 0,
                    }))}
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="quantity"
                  label="Số lượng cần mượn"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lượng' },
                    {
                      validator: (_, value) => {
                        if (selectedEq && value > selectedEq.availableQuantity) {
                          return Promise.reject(`Trong kho chỉ còn ${selectedEq.availableQuantity} thiết bị`);
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={selectedEq?.availableQuantity || 99}
                    size="large"
                    className="w-full h-12 flex items-center"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="borrowDate"
                    label="Ngày mượn"
                    rules={[{ required: true, message: 'Chọn ngày mượn' }]}
                  >
                    <DatePicker
                      size="large"
                      className="w-full h-12"
                      format="DD/MM/YYYY"
                      disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
                    />
                  </Form.Item>
                  <Form.Item
                    name="returnDate"
                    label="Ngày trả"
                    rules={[
                      { required: true, message: 'Chọn ngày trả' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || value.isAfter(getFieldValue('borrowDate'))) {
                            return Promise.resolve();
                          }
                          return Promise.reject('Ngày trả phải sau ngày mượn');
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      size="large"
                      className="w-full h-12"
                      format="DD/MM/YYYY"
                      disabledDate={(d) => d.isBefore(dayjs())}
                    />
                  </Form.Item>
                </div>

                <Form.Item name="note" label="Mục đích sử dụng & Ghi chú">
                  <Input.TextArea
                    rows={4}
                    placeholder="Vui lòng ghi rõ mục đích sử dụng tài sản (VD: Quay MV ca nhạc, Hỗ trợ sự kiện chào tân sinh viên...)"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-600 p-3"
                  />
                </Form.Item>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="glow-button w-full mt-4 h-12 bg-[#e50914] text-white rounded-lg font-black tracking-wide flex items-center justify-center gap-2 transition duration-300 cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'ĐANG XỬ LÝ...' : <><i className="fa-solid fa-paper-plane"></i> GỬI YÊU CẦU MƯỢN</>}
                </button>
              </Form>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {selectedEq ? (
              <div className="bg-[#121212] border border-white/5 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
                <h3 className="font-bold text-white mb-3 flex items-center gap-2"><i className="fa-solid fa-box-open text-gray-500"></i> Thiết bị đang chọn</h3>
                
                {selectedEq.imageUrl ? (
                  <img src={selectedEq.imageUrl} alt={selectedEq.name} className="w-full h-32 object-cover rounded-lg mb-3 border border-white/10" />
                ) : (
                  <div className="w-full h-32 bg-gray-900 rounded-lg mb-3 flex items-center justify-center text-4xl text-gray-700">
                    <i className="fa-solid fa-camera"></i>
                  </div>
                )}
                
                <h4 className="font-black text-gray-200">{selectedEq.name}</h4>
                <div className="mt-3 flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-500">Sẵn sàng cấp:</span>
                  <span className={`px-2 py-0.5 rounded border ${selectedEq.availableQuantity > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {selectedEq.availableQuantity} / {selectedEq.totalQuantity}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#121212] border border-white/5 rounded-xl p-5 text-center text-gray-500 py-10">
                <i className="fa-solid fa-magnifying-glass text-3xl mb-3 opacity-50"></i>
                <p className="text-sm font-medium">Vui lòng chọn một thiết bị để xem thông tin khả dụng.</p>
              </div>
            )}

            <div className="bg-[#161616] border border-white/5 rounded-xl p-5 border-t-4 border-t-[#e50914]">
              <h3 className="font-bold text-white mb-4 text-sm"><i className="fa-solid fa-triangle-exclamation text-[#e50914] mr-1"></i> Lưu ý quan trọng</h3>
              <ul className="text-[11px] text-gray-400 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1"></i> Đơn của bạn sẽ được Admin duyệt trong 24h.</li>
                <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1"></i> Bạn cần đến phòng CLB để nhận đồ sau khi được duyệt.</li>
                <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1"></i> Vi phạm thời hạn trả đồ sẽ bị cấm mượn trong 1 tháng.</li>
                <li className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-500 mt-1"></i> Người mượn hoàn toàn chịu trách nhiệm bồi thường nếu làm hỏng hóc hoặc mất mát tài sản.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
