import { useState, useEffect } from 'react';
import { Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { useGetUnreadCountQuery } from '@/store/api/notificationApi';

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: unreadData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'info',
        label: (
          <div className="py-1">
            <div className="font-bold text-white">{user?.name}</div>
            <div className="text-xs text-gray-400">{user?.studentId}</div>
          </div>
        ),
      },
      { type: 'divider' as const, style: { borderColor: 'rgba(255,255,255,0.1)' } },
      { key: 'logout', label: <span className="text-red-500 font-bold">Đăng xuất</span>, onClick: handleLogout },
    ],
  };

  const navLinks = [
    { path: '/student/equipment', label: 'Trang chủ' },
    { path: '/student/borrow', label: 'Mượn thiết bị' },
    { path: '/student/history', label: 'Lịch sử mượn' },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Premium Navbar (Glassmorphism) */}
      <nav className="bg-[#0c0c0c]/80 backdrop-blur-xl px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/5">
        <div className="flex items-center gap-10">
          <div 
            onClick={() => navigate('/student/equipment')}
            className="text-[#e50914] text-3xl font-black tracking-tighter cursor-pointer" 
            style={{ textShadow: '0 2px 10px rgba(229,9,20,0.3)' }}
          >
            GEARFLIX
          </div>
          <div className="hidden lg:flex gap-6 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {navLinks.map((link) => (
              <a 
                key={link.path}
                onClick={(e) => { e.preventDefault(); navigate(link.path); }}
                href={link.path}
                className={`transition ${location.pathname === link.path ? 'text-white border-b-2 border-[#e50914] pb-1' : 'hover:text-white'}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Icon */}
          <div className="relative text-gray-400 hover:text-white cursor-pointer transition">
            <i className="fa-solid fa-bell text-lg"></i>
            {unreadData?.data?.count ? (
              <span className="absolute -top-1.5 -right-1.5 bg-[#e50914] text-white text-[9px] font-bold px-1.5 rounded-full">
                {unreadData.data.count}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']} dropdownRender={(menu) => (
              <div className="bg-[#141414] border border-white/10 rounded-lg shadow-xl min-w-[150px]">
                {menu}
              </div>
            )}>
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow group-hover:scale-105 transition">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-gray-300 group-hover:text-white transition">
                  {user?.name || 'Student'}
                </span>
              </div>
            </Dropdown>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
