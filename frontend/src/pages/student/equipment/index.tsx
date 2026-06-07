import { useState, useMemo } from 'react';
import { Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetEquipmentQuery } from '@/store/api/equipmentApi';
import { Equipment } from '@/types';


/* ── Available card (larger, hero-style) ── */
const AvailCard = ({ eq, onBorrow, onDetail }: { eq: Equipment; onBorrow: () => void; onDetail: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDetail}
      style={{
        minWidth: 220, width: 220, flexShrink: 0,
        background: '#1e1e1e', borderRadius: 10,
        overflow: 'hidden', cursor: 'pointer',
        border: hovered ? '1px solid rgba(138,43,226,0.45)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: hovered ? '0 8px 28px rgba(138,43,226,0.22)' : '0 2px 8px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
      }}
    >
      {/* Image */}
      <div
        style={{ position: 'relative', height: 148, background: '#161616', overflow: 'hidden' }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {eq.imageUrl ? (
          <img src={eq.imageUrl} alt={eq.name} style={{
            width: '100%', height: '100%', objectFit: 'contain',
            padding: 8, boxSizing: 'border-box',
            transform: imgHovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-box" style={{ color: '#333', fontSize: 28 }} />
          </div>
        )}
        {/* Available badge */}
        <div className="badge badge-avail" style={{ position: 'absolute', top: 8, left: 8, backdropFilter: 'blur(4px)' }}>
          <i className="fa-solid fa-check" style={{ fontSize: 8 }} /> Khả dụng
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }} title={eq.name}>
          {eq.name}
        </div>
        <div style={{
          fontSize: 11, color: '#a0aec0', lineHeight: 1.5, marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: 33,
        }}>
          {eq.description || 'Không có mô tả'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            Còn: <span style={{ color: '#10b981', fontWeight: 700 }}>{eq.availableQuantity}</span>
            <span style={{ color: '#6b7280' }}> / {eq.totalQuantity}</span>
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onBorrow(); }}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          className="btn-primary"
          style={{
            width: '100%', padding: '7px 0', borderRadius: 5,
            fontSize: 11, cursor: 'pointer',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.18s ease',
          }}
        >
          Mượn
          <i className="fa-solid fa-arrow-right" style={{
            fontSize: 10,
            transform: btnHovered ? 'translateX(3px)' : 'translateX(0)',
            transition: 'transform 0.18s ease',
          }} />
        </button>
      </div>
    </div>
  );
};

/* ── Grid card (standard, for "Tất cả" section) ── */
const GridCard = ({ eq, onBorrow, onDetail }: { eq: Equipment; onBorrow: () => void; onDetail: () => void }) => {
  const isAvail = eq.availableQuantity > 0;
  const [hovered, setHovered] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => isAvail && onDetail()}
      style={{
        background: '#1a1a1a', borderRadius: 8, overflow: 'hidden',
        cursor: isAvail ? 'pointer' : 'default',
        border: hovered && isAvail ? '1px solid rgba(138,43,226,0.35)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: hovered && isAvail ? '0 6px 20px rgba(138,43,226,0.15)' : '0 1px 4px rgba(0,0,0,0.3)',
        transform: hovered && isAvail ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        opacity: isAvail ? 1 : 0.5,
        filter: isAvail ? 'none' : 'grayscale(60%)',
      }}
    >
      {/* Image */}
      <div
        style={{ position: 'relative', height: 130, background: '#111', overflow: 'hidden' }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {eq.imageUrl ? (
          <img src={eq.imageUrl} alt={eq.name} style={{
            width: '100%', height: '100%', objectFit: 'contain',
            padding: 6, boxSizing: 'border-box',
            transform: imgHovered && isAvail ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#181818' }}>
            <i className="fa-solid fa-box" style={{ color: '#444', fontSize: 22 }} />
          </div>
        )}
        <div className={isAvail ? 'badge badge-avail' : 'badge badge-out'} style={{ position: 'absolute', top: 6, left: 6, backdropFilter: 'blur(4px)', fontSize: 9, padding: '2px 6px' }}>
          <i className={`fa-solid fa-${isAvail ? 'check' : 'xmark'}`} style={{ fontSize: 7 }} />
          {isAvail ? 'Khả dụng' : 'Hết hàng'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 9px 10px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }} title={eq.name}>
          {eq.name}
        </div>
        <div style={{
          fontSize: 10, color: '#a0aec0', lineHeight: 1.45, marginBottom: 7,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: 29,
        }}>
          {eq.description || 'Không có mô tả'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>
            Còn: <span style={{ color: isAvail ? '#10b981' : '#6b7280', fontWeight: 700 }}>{eq.availableQuantity}</span>
            <span style={{ color: '#555' }}> / {eq.totalQuantity}</span>
          </span>
        </div>

        {isAvail ? (
          <button
            onClick={e => { e.stopPropagation(); onBorrow(); }}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            className="btn-primary"
            style={{
              width: '100%', padding: '6px 0', borderRadius: 4,
              fontSize: 10, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              transition: 'all 0.18s ease',
            }}
          >
            Mượn
            <i className="fa-solid fa-arrow-right" style={{
              fontSize: 9,
              transform: btnHovered ? 'translateX(3px)' : 'translateX(0)',
              transition: 'transform 0.18s ease',
            }} />
          </button>
        ) : (
          <button disabled style={{
            width: '100%', padding: '6px 0', borderRadius: 4,
            fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#4b5563', cursor: 'not-allowed',
          }}>
            Hết hàng
          </button>
        )}
      </div>
    </div>
  );
};

export default function StudentEquipmentPage() {
  const navigate = useNavigate();
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);
  const { data, isLoading } = useGetEquipmentQuery({ search: '' });
  const equipmentList = data?.data || [];

  const available = useMemo(() => equipmentList.filter(e => e.availableQuantity > 0), [equipmentList]);

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
      <style>{`
        @keyframes fadeIn { from { opacity: 0.4; } to { opacity: 1; } }
        .eq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
          gap: 12px;
        }
        .avail-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 12px; }
        .avail-scroll::-webkit-scrollbar { height: 4px; }
        .avail-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 2px; }
        .avail-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
      `}</style>

      {/* ══ HERO ══ */}
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
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)',
            }}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0d0d0d 35%, rgba(13,13,13,0.5) 60%, rgba(13,13,13,0) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: 'linear-gradient(to top, #141414 0%, transparent 100%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 80px 60px', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', maxWidth: 640 }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-1.5px', textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
              Chào mừng đến với CLB BORROW
            </h1>
            <p style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 540, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Nền tảng quản lý và chia sẻ thiết bị nội bộ dành riêng cho các thành viên trong câu lạc bộ.
              Tại đây, bạn có thể dễ dàng tìm kiếm, đăng ký mượn các trang thiết bị cần thiết.
            </p>
            <button
              onClick={() => navigate('/student/borrow')}
              className="btn-primary"
              style={{ padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <i className="fa-solid fa-compass" /> Khám phá thiết bị ngay
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div id="equipment-rows" style={{ padding: '0 28px 60px', marginTop: -20, position: 'relative', zIndex: 10 }}>

        {/* ── Section 1: Sẵn sàng (Carousel / Horizontal scroll) ── */}
        {available.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 22, background: 'linear-gradient(to bottom, #a855f7, #6366f1)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#f3f4f6', margin: 0 }}>
                Thiết bị sẵn sàng cho mượn
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', padding: '2px 8px', borderRadius: 10 }}>
                {available.length} thiết bị
              </span>
            </div>
            <div className="avail-scroll">
              {available.map(eq => (
                <AvailCard
                  key={eq.id}
                  eq={eq}
                  onBorrow={() => navigate('/student/borrow', { state: { equipmentId: eq.id } })}
                  onDetail={() => setDetailItem(eq)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Section 2: Tất cả tài sản (Grid) ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 3, height: 22, background: 'linear-gradient(to bottom, #64748b, #475569)', borderRadius: 2 }} />
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#f3f4f6', margin: 0 }}>
              Tất cả tài sản CLB
            </h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 10 }}>
              {equipmentList.length} thiết bị
            </span>
          </div>
          <div className="eq-grid">
            {equipmentList.map(eq => {
              const isAvail = eq.availableQuantity > 0;
              return (
                <GridCard
                  key={eq.id}
                  eq={eq}
                  onBorrow={() => navigate('/student/borrow', { state: { equipmentId: eq.id } })}
                  onDetail={() => isAvail && setDetailItem(eq)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ DETAIL MODAL ══ */}
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
            {/* Modal image */}
            <div style={{ position: 'relative', height: 220, background: '#161616' }}>
              {detailItem.imageUrl ? (
                <img src={detailItem.imageUrl} alt={detailItem.name} style={{
                  width: '100%', height: '100%', objectFit: 'contain', padding: 16, boxSizing: 'border-box',
                }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-box" style={{ color: '#333', fontSize: 40 }} />
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1e1e1e 0%, rgba(30,30,30,0.1) 60%, transparent 100%)' }} />
              <button onClick={() => setDetailItem(null)} style={{
                position: 'absolute', top: 12, right: 12, width: 32, height: 32,
                borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.85)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
              >×</button>
            </div>
            {/* Modal body */}
            <div style={{ padding: '4px 24px 24px' }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{detailItem.name}</h3>
              <p style={{ fontSize: 13, color: '#a0aec0', lineHeight: 1.6, margin: '0 0 16px' }}>
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
                <button onClick={() => setDetailItem(null)} className="btn-ghost" style={{ flex: 1, height: 44, borderRadius: 8, fontSize: 13 }}>Hủy</button>
                <button
                  onClick={() => { navigate('/student/borrow', { state: { equipmentId: detailItem.id } }); setDetailItem(null); }}
                  className="btn-primary"
                  style={{ flex: 2, height: 44, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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
