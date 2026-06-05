import { useState, useMemo } from 'react';
import { Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetEquipmentQuery } from '@/store/api/equipmentApi';
import { Equipment } from '@/types';

export default function StudentEquipmentPage() {
  const navigate = useNavigate();
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);

  const { data, isLoading } = useGetEquipmentQuery({ search: '' });
  const equipmentList = data?.data || [];

  // Logic to create Netflix-like structure
  const featuredItem = useMemo(() => {
    if (equipmentList.length > 0) {
      return equipmentList.find(e => e.availableQuantity > 0) || equipmentList[0];
    }
    return null;
  }, [equipmentList]);

  const rows = useMemo(() => {
    if (equipmentList.length === 0) return [];
    
    const available = equipmentList.filter(e => e.availableQuantity > 0);
    const newest = [...equipmentList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const almostEmpty = equipmentList.filter(e => e.availableQuantity === 0);

    return [
      { title: 'Thiết bị sẵn sàng cho mượn', items: available },
      { title: 'Tất cả tài sản CLB', items: equipmentList },
      { title: 'Thiết bị mới nhập', items: newest },
      { title: 'Đang mượn hết', items: almostEmpty }
    ].filter(row => row.items.length > 0);
  }, [equipmentList]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (equipmentList.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Empty description={<span className="text-gray-400">Chưa có thiết bị nào trong kho</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <>
      {/* Cinematic Billboard (Banner chính) */}
      {featuredItem && (
        <div className="relative w-full h-[60vh] md:h-[70vh] flex items-center px-6 md:px-12 mb-10 overflow-hidden bg-gradient-to-r from-black via-black/80 to-transparent">
          {/* Ảnh nền */}
          <div 
            className="absolute inset-0 bg-cover bg-center -z-20 opacity-50" 
            style={{ 
              backgroundImage: featuredItem.imageUrl 
                ? `url(${featuredItem.imageUrl})` 
                : 'url(https://assets.nflxext.com/ffe/siteui/vlv3/c3ed7e68-a3ed-43d8-8e1b-ccc7c5e2fd9a/99863a35-18e3-4d43-9828-569d65942d99/VN-vi-20231211-popsignuptwoweeks-perspective_alpha_website_large.jpg)' 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0507] via-[#0c0c0c]/80 to-transparent -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black -z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0c0c] to-transparent -z-10"></div>
          
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest text-amber-400 uppercase">
              <i className="fa-solid fa-star-of-life animate-spin text-xs"></i> Thiết bị tâm điểm
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white drop-shadow-xl">
              {featuredItem.name}
            </h1>
            <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed line-clamp-3">
              {featuredItem.description || 'Được mệnh danh là "ông vua tiệc tùng" của các Câu lạc bộ. Hệ thống đèn LED nhảy theo nhạc, công suất khuếch đại đỉnh cao, thách thức mọi không gian ngoài trời rộng lớn nhất.'}
            </p>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => {
                  if(featuredItem.availableQuantity > 0) {
                     navigate('/student/borrow', { state: { equipmentId: featuredItem.id } });
                  }
                }} 
                disabled={featuredItem.availableQuantity === 0}
                className={`glow-button px-8 py-3 rounded-md font-black text-sm flex items-center gap-2 transition ${featuredItem.availableQuantity === 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed glow-none' : 'bg-[#e50914] text-white cursor-pointer'}`}
              >
                <i className="fa-solid fa-paper-plane"></i> {featuredItem.availableQuantity > 0 ? 'ĐĂNG KÝ MƯỢN NGAY' : 'TẠM HẾT HÀNG'}
              </button>
              <button 
                onClick={() => setDetailItem(featuredItem)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 transition backdrop-blur-md border border-white/10 cursor-pointer"
              >
                <i className="fa-solid fa-circle-info"></i> Thông tin thiết bị
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh mục thiết bị dạng hàng (Netflix Layout) */}
      <div className="px-6 md:px-12 space-y-12">
        {rows.map((row, index) => (
          <div key={index} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-2xl font-black tracking-wide text-white group cursor-pointer">
                {row.title}
                <span className="text-xs text-[#e50914] font-bold opacity-0 group-hover:opacity-100 transition pl-2">Xem tất cả →</span>
              </h2>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 netflix-scroll pt-2">
              {row.items.map(eq => {
                const isAvailable = eq.availableQuantity > 0;
                return (
                  <div key={eq.id} className={`movie-card min-w-[240px] md:min-w-[280px] bg-[#161616] rounded-xl overflow-hidden border border-white/5 relative flex flex-col justify-between ${!isAvailable ? 'opacity-50' : ''}`}>
                    <div className={`h-40 ${eq.imageUrl ? '' : 'bg-gradient-to-b from-gray-900 to-[#161616]'} flex items-center justify-center text-4xl text-gray-500 relative`}>
                      {eq.imageUrl ? (
                        <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-lightbulb text-amber-500/20"></i>
                      )}
                      {isAvailable ? (
                        <span className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Khả dụng
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 bg-white/10 text-gray-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                          Hết hàng
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4 space-y-3 bg-[#121212]">
                      <h3 className="font-bold text-sm text-gray-100 truncate" title={eq.name}>{eq.name}</h3>
                      <div className="flex justify-between text-xs text-gray-400 font-medium border-t border-white/5 pt-2">
                        <span>📦 Sẵn có: <b className={isAvailable ? "text-white" : "text-gray-500"}>{eq.availableQuantity} chiếc</b></span>
                        <span>⭐ Tình trạng: <b className="text-emerald-400">Tốt</b></span>
                      </div>
                      <button 
                        onClick={() => isAvailable ? setDetailItem(eq) : null}
                        disabled={!isAvailable}
                        className={`w-full py-2 rounded-lg text-xs font-black transition duration-300 border ${
                          isAvailable 
                          ? 'bg-white/5 hover:bg-[#e50914] text-white hover:text-white border-white/10 hover:border-transparent cursor-pointer' 
                          : 'bg-transparent text-gray-600 border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {isAvailable ? 'Yêu cầu cấp đồ' : 'Đang cho mượn hết'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* PREMIUM POPUP MODAL (Chi tiết và Xác nhận Mượn) */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="bg-[#1c1c1c] p-4 flex justify-between items-center border-b border-white/5">
              <h3 className="font-black text-xs uppercase tracking-widest text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e50914] animate-ping"></span> 
                Xác nhận mượn thiết bị
              </h3>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-white text-xl font-bold transition cursor-pointer">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              
              <div className="flex gap-4">
                {detailItem.imageUrl ? (
                  <img src={detailItem.imageUrl} alt={detailItem.name} className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                ) : (
                  <div className="w-24 h-24 bg-gray-900 rounded-lg border border-white/10 flex items-center justify-center text-3xl text-gray-600">
                    <i className="fa-solid fa-camera"></i>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-black text-white leading-tight">{detailItem.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-3">{detailItem.description || 'Không có mô tả chi tiết.'}</p>
                  <div className="flex gap-3 mt-3">
                    <span className="bg-white/10 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-white/5">
                      Tổng kho: {detailItem.totalQuantity}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                      Sẵn có: {detailItem.availableQuantity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Bằng việc bấm nút "Đăng Ký", bạn sẽ được chuyển đến trang Tạo Phiếu Mượn cho tài sản này. Vui lòng chuẩn bị rõ kế hoạch và mục đích sử dụng để Quản trị viên duyệt nhanh chóng.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                <button onClick={() => setDetailItem(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-md text-xs font-bold transition cursor-pointer">
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => {
                    navigate('/student/borrow', { state: { equipmentId: detailItem.id } });
                    setDetailItem(null);
                  }} 
                  className="glow-button px-6 py-2 bg-[#e50914] text-white rounded-md text-xs font-black transition cursor-pointer"
                >
                  TIẾN HÀNH LẬP PHIẾU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
