import { useState, useMemo, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetEquipmentQuery } from '@/store/api/equipmentApi';
import { Equipment } from '@/types';

/* ── Star rating display ── */
const Stars = ({ count = 4 }: { count?: number }) => (
  <span style={{ display: 'inline-flex', gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <i key={i} className={`fa-${i <= count ? 'solid' : 'regular'} fa-star`}
        style={{ fontSize: 9, color: i <= count ? '#f59e0b' : '#374151' }} />
    ))}
  </span>
);

export default function StudentEquipmentPage() {
  const navigate = useNavigate();
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);
  const { data, isLoading } = useGetEquipmentQuery({ search: '' });
  const equipmentList = data?.data || [];

  const rows = useMemo(() => {
    if (!equipmentList.length) return [];
    const available = equipmentList.filter(e => e.availableQuantity > 0);
    const newest = [...equipmentList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const outOfStock = equipmentList.filter(e => e.availableQuantity === 0);
    return [
      { title: 'Thiết bị sẵn sàng cho mượn', items: available },
      { title: 'Tất cả tài sản CLB',           items: equipmentList },
      { title: 'Thiết bị mới nhập',             items: newest },
      { title: 'Đang mượn hết',                 items: outOfStock },
    ].filter(r => r.items.length > 0);
  }, [equipmentList]);

  if (isLoading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </div>
  );

  if (!equipmentList.length) return (
    <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Empty description={<span style={{ color: '#6b7280' }}>Chưa có thiết bị nào trong kho</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════ */}
      <div style={{ position: 'relative', width: '100%', height: '70vh', overflow: 'hidden', background: '#0d0d0d' }}>
        <div style={{ position: 'absolute', inset: 0, animation: 'fadeIn 0.5s ease-in-out' }}>
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1920&auto=format&fit=crop"
            alt="Hero Background"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center right',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)',
              maskImage:        'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)',
            }}
          />
        </div>
        <style>{`
          @keyframes fadeIn { from { opacity: 0.4; } to { opacity: 1; } }
          .hero-cta-btn { transition: all 0.3s ease !important; }
          .hero-cta-btn:hover { filter: brightness(1.15); box-shadow: 0 4px 20px rgba(59,130,246,0.4) !important; }
          .hero-cta-btn i { transition: transform 0.3s ease; }
          .hero-cta-btn:hover i { transform: translateX(4px); }

          .equipment-card { transition: all 0.3s ease !important; }
          .equipment-card.avail:hover { 
            transform: translateY(-4px); 
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25) !important; 
            border-color: rgba(59, 130, 246, 0.4) !important; 
          }
        `}</style>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0d0d0d 35%, rgba(13,13,13,0.5) 60%, rgba(13,13,13,0) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: 'linear-gradient(to top, #141414 0%, transparent 100%)', pointerEvents: 'none' }} />

        <div style={{
          position: 'relative', zIndex: 10,
          height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 80px 60px',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto', maxWidth: 640 }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              fontWeight: 900, color: '#fff',
              margin: '0 0 12px', lineHeight: 1.1,
              letterSpacing: '-1.5px',
              textShadow: '0 4px 30px rgba(0,0,0,0.8)',
            }}>
              Chào mừng đến với CLB BORROW
            </h1>
            <p style={{
              fontSize: 16, color: '#d1d5db', lineHeight: 1.6,
              margin: '0 0 24px', maxWidth: 540,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}>
              Nền tảng chia sẻ thiết bị nội bộ, giúp thành viên CLB dễ dàng tìm kiếm và đăng ký mượn trang thiết bị phục vụ học tập, nghiên cứu hay tổ chức sự kiện chỉ với vài thao tác đơn giản.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate('/student/borrow')}
                className="btn-primary hero-cta-btn"
                style={{
                  padding: '12px 24px', borderRadius: 8,
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <i className="fa-solid fa-compass" />
                Khám phá thiết bị ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          EQUIPMENT ROWS
          ══════════════════════════════════════════ */}
      <div id="equipment-rows" style={{ padding: '0 28px 60px', marginTop: -20, position: 'relative', zIndex: 10 }}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ marginBottom: 44 }}>
            {/* Row title */}
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e5e7eb', margin: '0 0 14px', cursor: 'default' }}>
              {row.title}
            </h2>

            {/* Cards scroll */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingTop: 16, paddingBottom: 24, marginTop: -16, marginBottom: -16 }} className="netflix-scroll">
              {row.items.map(eq => {
                const isAvail = eq.availableQuantity > 0;
                return (
                  <div
                    key={eq.id}
                    className={isAvail ? "movie-card equipment-card avail" : "movie-card equipment-card"}
                    onClick={() => isAvail && setDetailItem(eq)}
                    style={{
                      minWidth: 260, width: 260, flexShrink: 0,
                      background: '#1e1e1e', borderRadius: 8,
                      overflow: 'hidden', cursor: isAvail ? 'pointer' : 'default',
                      border: '1px solid rgba(255,255,255,0.06)',
                      opacity: isAvail ? 1 : 0.55,
                    }}
                  >
                    {/* Image + badge */}
                    <div style={{ position: 'relative', height: 160, background: '#f3f4f6', overflow: 'hidden' }}>
                      {eq.imageUrl ? (
                        <div style={{ width: '100%', height: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={eq.imageUrl} alt={eq.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-box" style={{ color: '#d1d5db', fontSize: 32 }} />
                        </div>
                      )}
                      {/* Status badge */}
                      <div className={isAvail ? 'badge badge-avail' : 'badge badge-out'}
                           style={{ position: 'absolute', top: 8, left: 8, backdropFilter: 'blur(4px)' }}>
                        <i className={`fa-solid fa-${isAvail ? 'check' : 'xmark'}`} style={{ fontSize: 8 }} />
                        {isAvail ? 'Khả dụng' : 'Hết hàng'}
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '10px 10px 12px' }}>
                      {/* Name */}
                      <div style={{
                        fontSize: 14, fontWeight: 800, color: '#f3f4f6',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        marginBottom: 4,
                      }} title={eq.name}>{eq.name}</div>

                      {/* Description */}
                      <div style={{
                        fontSize: 12, color: '#9ca3af', lineHeight: 1.5, marginBottom: 8,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        minHeight: 36,
                      }}>
                        {eq.description || 'Không có mô tả'}
                      </div>

                      {/* Count + stars */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          Số lượng còn: <span style={{ color: isAvail ? '#10b981' : '#6b7280', fontWeight: 700 }}>{eq.availableQuantity}</span>
                        </span>
                        <Stars count={eq.availableQuantity > 0 ? 4 : 2} />
                      </div>

                      {/* Button */}
                      {isAvail && (
                        <button
                          onClick={e => { e.stopPropagation(); navigate('/student/borrow', { state: { equipmentId: eq.id } }); }}
                          className="btn-primary"
                          style={{
                            width: '100%', padding: '8px 0', borderRadius: 5,
                            fontSize: 12, cursor: 'pointer',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}
                        >
                          Mượn →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          DETAIL MODAL
          ══════════════════════════════════════════ */}
      {detailItem && (
        <div
          onClick={() => setDetailItem(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1e1e1e', borderRadius: 12, overflow: 'hidden',
            width: '100%', maxWidth: 480,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
          }}>
            {/* Image */}
            <div style={{ position: 'relative', height: 240, background: '#f3f4f6' }}>
              {detailItem.imageUrl ? (
                <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={detailItem.imageUrl} alt={detailItem.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-box" style={{ color: '#d1d5db', fontSize: 48 }} />
                </div>
              )}
              <button onClick={() => setDetailItem(null)} style={{
                position: 'absolute', top: 12, right: 12, width: 32, height: 32,
                borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                 onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
              >×</button>
            </div>
            {/* Body */}
            <div style={{ padding: '4px 24px 24px' }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{detailItem.name}</h3>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, margin: '0 0 16px' }}>
                {detailItem.description || 'Không có mô tả chi tiết.'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                  Kho: {detailItem.totalQuantity} chiếc
                </span>
                <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                  Còn: {detailItem.availableQuantity} chiếc
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDetailItem(null)} className="btn-ghost" style={{
                  flex: 1, height: 44, borderRadius: 8, fontSize: 13,
                }}>Hủy</button>
                <button
                  onClick={() => { navigate('/student/borrow', { state: { equipmentId: detailItem.id } }); setDetailItem(null); }}
                  className="btn-primary"
                  style={{
                    flex: 2, height: 44, borderRadius: 8, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <i className="fa-solid fa-file-invoice" /> Đăng Ký Mượn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
