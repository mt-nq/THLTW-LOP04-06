import { Layout, Menu, Dropdown, Avatar, Popover, List, Spin } from 'antd';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DashboardOutlined, FileTextOutlined, InboxOutlined,
  BarChartOutlined, LogoutOutlined, UserOutlined, ClockCircleFilled,
} from '@ant-design/icons';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { useGetAllBorrowsQuery } from '@/store/api/borrowApi';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/requests',  icon: <FileTextOutlined />,  label: 'Quản lý yêu cầu' },
  { key: '/admin/equipment', icon: <InboxOutlined />,     label: 'Quản lý kho' },
  { key: '/admin/statistics',icon: <BarChartOutlined />,  label: 'Thống kê' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: borrowsRes, isLoading: isBorrowsLoading } = useGetAllBorrowsQuery();
  const pendingBorrows = borrowsRes?.data?.filter(b => b.status === 'PENDING') || [];
  const [clickedIds, setClickedIds] = useState<number[]>([]);
  
  const displayPendingCount = pendingBorrows.filter(b => !clickedIds.includes(b.id)).length;

  const notifContent = (
    <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }} className="netflix-scroll">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, color: '#fff', fontSize: 13 }}>Yêu cầu chờ duyệt</span>
        {displayPendingCount > 0 && <span style={{ fontSize: 11, color: '#5b5cf0', fontWeight: 700 }}>{displayPendingCount} đang chờ</span>}
      </div>
      {isBorrowsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spin size="small" /></div>
      ) : pendingBorrows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#4b5563', fontSize: 12 }}>Không có yêu cầu nào đang chờ duyệt</div>
      ) : (
        <List dataSource={pendingBorrows} renderItem={item => (
          <List.Item
            onClick={() => {
              if (!clickedIds.includes(item.id)) setClickedIds(prev => [...prev, item.id]);
              navigate('/admin/requests');
            }}
            style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', opacity: clickedIds.includes(item.id) ? 0.5 : 1 }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(91, 92, 240,0.07)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <ClockCircleFilled style={{ color: '#f59e0b', fontSize: 15, marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: clickedIds.includes(item.id) ? '#9ca3af' : '#fff', transition: 'color 0.2s' }}>Yêu cầu từ {item.userName}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{item.quantity}x {item.equipmentName} ({item.userStudentId || 'N/A'})</div>
              <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>{dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}</div>
            </div>
            {!clickedIds.includes(item.id) && (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5b5cf0', flexShrink: 0, marginTop: 4 }} />
            )}
          </List.Item>
        )} />
      )}
    </div>
  );

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const userMenu = {
    items: [
      { key: 'info', icon: <UserOutlined style={{ color: '#6b7280' }} />, label: <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{user?.name}</div> },
      { type: 'divider' as const, style: { borderColor: 'rgba(255,255,255,0.08)' } },
      { key: 'logout', icon: <LogoutOutlined style={{ color: '#ef4444' }} />, label: <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 13 }}>Đăng xuất</span>, onClick: handleLogout },
    ],
  };

  const currentLabel = menuItems.find(m => m.key === location.pathname)?.label || 'Admin';

  return (
    <Layout style={{ minHeight: '100vh', background: '#141414' }}>
      {/* ── Sidebar ── */}
      <Sider width={240} breakpoint="lg" collapsedWidth={0}
        style={{ background: '#0f0f0f', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>

        {/* Logo */}
        <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#5b5cf0,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(91, 92, 240,0.4)', flexShrink: 0 }}>
            <i className="fa-solid fa-boxes-stacked" style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.3px' }}>CLB BORROW</div>
            <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, marginTop: 2 }}>Admin Dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', marginTop: 10 }}
          className="admin-netflix-menu"
        />

        {/* Bottom user info removed per user request */}
      </Sider>

      {/* ── Main ── */}
      <Layout style={{ marginLeft: 240, background: '#141414' }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: 60, padding: '0 28px',
          background: 'rgba(15,15,15,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {currentLabel}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Bell */}
            <Popover content={notifContent} title={null} trigger="click" placement="bottomRight" overlayClassName="netflix-notif-popover">
              <div style={{ position: 'relative', cursor: 'pointer', color: '#6b7280', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e5e7eb')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                <i className="fa-solid fa-bell" style={{ fontSize: 17 }} />
                {displayPendingCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 10, lineHeight: 1.5 }}>
                    {displayPendingCount}
                  </span>
                )}
              </div>
            </Popover>

            {/* Avatar dropdown */}
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}
              dropdownRender={menu => (
                <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, minWidth: 160, boxShadow: '0 16px 40px rgba(0,0,0,0.8)' }}>
                  {menu}
                </div>
              )}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar style={{ background: 'linear-gradient(135deg,#5b5cf0,#4338ca)', borderRadius: 8, fontWeight: 900, fontSize: 14 }} size={32}>
                  {user?.name?.charAt(0) || 'A'}
                </Avatar>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#d1d5db' }}>{user?.name}</span>
                <i className="fa-solid fa-caret-down" style={{ color: '#4b5563', fontSize: 10 }} />
              </div>
            </Dropdown>
          </div>
        </div>

        <Content style={{ padding: 28, overflowY: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
