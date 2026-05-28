import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DashboardOutlined,
  FileTextOutlined,
  InboxOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { useGetUnreadCountQuery } from '@/store/api/notificationApi';
import NotificationBell from '@/components/NotificationBell';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/requests', icon: <FileTextOutlined />, label: 'Quản lý yêu cầu' },
  { key: '/admin/equipment', icon: <InboxOutlined />, label: 'Quản lý kho' },
  { key: '/admin/statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
];

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Tổng Quan Hệ Thống',
  '/admin/requests': 'Quản Lý Yêu Cầu Mượn',
  '/admin/equipment': 'Quản Lý Kho Thiết Bị',
  '/admin/statistics': 'Thống Kê & Báo Cáo',
};

export default function AdminLayout() {
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
        icon: <UserOutlined />,
        label: <div style={{ fontWeight: 600 }}>{user?.name}</div>,
      },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: ({ key }: { key: string }) => key === 'logout' && handleLogout(),
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} className="app-sider" theme="dark" breakpoint="lg" collapsedWidth={0}>
        <div className="sider-logo">
          <div className="sider-logo-icon">⚙️</div>
          <div className="sider-logo-text">
            <h2>CLB Borrow</h2>
            <p>Quản trị viên</p>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header className="app-header" style={{ height: 64 }}>
          <h2 className="header-title">{pageTitles[location.pathname] || 'Admin'}</h2>
          <div className="header-right">
            <NotificationBell unreadCount={unreadData?.data?.count || 0} />
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div className="user-info">
                <Avatar style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
