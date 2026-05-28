import { useState, useEffect } from 'react';
import { Form, Select, InputNumber, DatePicker, Input, Button, Card, Alert, message, Row, Col } from 'antd';
import { SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
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
  const { data: eqData } = useGetEquipmentQuery({});
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
    <div className="page-content">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/student/equipment')}
          style={{ marginBottom: 8, padding: 0 }}
        >
          Quay lại danh sách
        </Button>
        <h1>📋 Gửi Yêu Cầu Mượn</h1>
        <p>Điền thông tin để đăng ký mượn thiết bị</p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 16 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ quantity: 1, borrowDate: dayjs() }}
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
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              {selectedEq && (
                <Alert
                  message={`Còn ${selectedEq.availableQuantity} / ${selectedEq.totalQuantity} thiết bị khả dụng`}
                  type={selectedEq.availableQuantity > 2 ? 'success' : 'warning'}
                  showIcon
                  style={{ marginBottom: 16, borderRadius: 10 }}
                />
              )}

              <Form.Item
                name="quantity"
                label="Số lượng cần mượn"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng' },
                  {
                    validator: (_, value) => {
                      if (selectedEq && value > selectedEq.availableQuantity) {
                        return Promise.reject(`Tối đa ${selectedEq.availableQuantity} thiết bị`);
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
                  style={{ width: '100%', borderRadius: 10 }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="borrowDate"
                    label="Ngày mượn"
                    rules={[{ required: true, message: 'Chọn ngày mượn' }]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: '100%', borderRadius: 10 }}
                      format="DD/MM/YYYY"
                      disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
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
                      style={{ width: '100%', borderRadius: 10 }}
                      format="DD/MM/YYYY"
                      disabledDate={(d) => d.isBefore(dayjs())}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="note" label="Ghi chú (tuỳ chọn)">
                <Input.TextArea
                  rows={3}
                  placeholder="Mục đích sử dụng, ghi chú thêm..."
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SendOutlined />}
                  size="large"
                  block
                  style={{ height: 50, borderRadius: 12, fontSize: 16, fontWeight: 700 }}
                >
                  Gửi Yêu Cầu Mượn
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 16, background: '#f8f9ff' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#4f46e5' }}>📌 Lưu ý quan trọng</h3>
            <ul style={{ paddingLeft: 20, lineHeight: 2, color: '#374151', fontSize: 14 }}>
              <li>Yêu cầu sẽ được quản trị viên xét duyệt trong vòng 24 giờ.</li>
              <li>Bạn sẽ nhận được email thông báo khi yêu cầu được duyệt hoặc từ chối.</li>
              <li>Vui lòng trả thiết bị đúng hạn để tránh bị ghi nhận vi phạm.</li>
              <li>Nếu cần gia hạn, hãy liên hệ quản trị viên trước ngày hết hạn.</li>
              <li>Thiết bị bị hỏng trong quá trình mượn, người mượn chịu trách nhiệm bồi thường.</li>
            </ul>
          </Card>

          {selectedEq && (
            <Card style={{ borderRadius: 16, marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🔍 Thiết bị đã chọn</h3>
              {selectedEq.imageUrl && (
                <img src={selectedEq.imageUrl} alt={selectedEq.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
              )}
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{selectedEq.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{selectedEq.description}</div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
