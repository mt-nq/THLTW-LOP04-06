import { useState } from 'react';
import { Input, Row, Col, Card, Tag, Button, Spin, Empty, Badge, Tooltip, Modal } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetEquipmentQuery } from '@/store/api/equipmentApi';
import { Equipment } from '@/types';

export default function StudentEquipmentPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);

  const { data, isLoading } = useGetEquipmentQuery({ search });
  const equipment = data?.data || [];

  const getAvailabilityTag = (eq: Equipment) => {
    if (eq.availableQuantity === 0) return <Tag color="red" style={{ margin: 0 }}>Hết hàng</Tag>;
    if (eq.availableQuantity <= 2) return <Tag color="orange" style={{ margin: 0 }}>Sắp hết</Tag>;
    return <Tag color="green" style={{ margin: 0 }}>Còn hàng</Tag>;
  };

  const getQuantityClass = (eq: Equipment) => {
    if (eq.availableQuantity === 0) return 'quantity-empty';
    if (eq.availableQuantity <= 2) return 'quantity-low';
    return 'quantity-available';
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>📦 Danh Sách Thiết Bị</h1>
        <p>Xem và chọn thiết bị bạn muốn mượn</p>
      </div>

      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#f8fafc',
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: -16,
        marginBottom: 24,
      }}>
        <Input
          size="large"
          prefix={<SearchOutlined style={{ color: '#6366f1' }} />}
          placeholder="Tìm kiếm thiết bị..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400, borderRadius: 12, boxShadow: '0 2px 8px rgba(99, 102, 241, 0.05)' }}
          allowClear
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : equipment.length === 0 ? (
        <Empty description="Không tìm thấy thiết bị nào" />
      ) : (
        <Row gutter={[20, 20]}>
          {equipment.map((eq) => (
            <Col key={eq.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                className="equipment-card"
                cover={
                  eq.imageUrl ? (
                    <img src={eq.imageUrl} alt={eq.name} className="equipment-img" />
                  ) : (
                    <div className="equipment-img-placeholder">📷</div>
                  )
                }
                actions={[
                  <Tooltip title="Xem chi tiết" key="detail">
                    <Button
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={() => setDetailItem(eq)}
                    />
                  </Tooltip>,
                  <Tooltip title={eq.availableQuantity === 0 ? 'Hết hàng' : 'Mượn ngay'} key="borrow">
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      disabled={eq.availableQuantity === 0}
                      onClick={() => navigate('/student/borrow', { state: { equipmentId: eq.id } })}
                      size="small"
                    >
                      Mượn
                    </Button>
                  </Tooltip>,
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8, whiteSpace: 'normal' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4, flex: 1, wordBreak: 'break-word' }}>
                        {eq.name}
                      </span>
                      <span style={{ flexShrink: 0, display: 'inline-flex' }}>
                        {getAvailabilityTag(eq)}
                      </span>
                    </div>
                  }
                  description={
                    <div>
                      <p 
                        style={{ 
                          fontSize: 12, 
                          color: '#6b7280', 
                          marginBottom: 8, 
                          height: 36, 
                          lineHeight: '18px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word'
                        }}
                        title={eq.description || 'Không có mô tả'}
                      >
                        {eq.description || 'Không có mô tả'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>Tổng: <strong>{eq.totalQuantity}</strong></span>
                        <span>
                          Khả dụng:{' '}
                          <strong className={getQuantityClass(eq)}>{eq.availableQuantity}</strong>
                        </span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        footer={[
          <Button key="close" onClick={() => setDetailItem(null)}>Đóng</Button>,
          <Button
            key="borrow"
            type="primary"
            disabled={detailItem?.availableQuantity === 0}
            onClick={() => {
              navigate('/student/borrow', { state: { equipmentId: detailItem?.id } });
              setDetailItem(null);
            }}
          >
            Mượn thiết bị này
          </Button>,
        ]}
        title={detailItem?.name}
        width={500}
      >
        {detailItem && (
          <div>
            {detailItem.imageUrl && (
              <img src={detailItem.imageUrl} alt={detailItem.name}
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />
            )}
            <p style={{ color: '#374151' }}>{detailItem.description || 'Không có mô tả'}</p>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>{detailItem.totalQuantity}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Tổng số</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{detailItem.availableQuantity}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Khả dụng</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>
                  {detailItem.totalQuantity - detailItem.availableQuantity}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Đang mượn</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
