import { Layout, Menu, Avatar, Dropdown, Badge, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppstoreOutlined,
  FormOutlined,
  HistoryOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { useGetUnreadCountQuery } from '@/store/api/notificationApi';
import NotificationBell from '@/components/NotificationBell';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/student/equipment', icon: <AppstoreOutlined />, label: 'Danh sách thiết bị' },
  { key: '/student/borrow', icon: <FormOutlined />, label: 'Gửi yêu cầu mượn' },
  { key: '/student/history', icon: <HistoryOutlined />, label: 'Lịch sử mượn' },
];

const pageTitles: Record<string, string> = {
  '/student/equipment': 'Danh Sách Thiết Bị',
  '/student/borrow': 'Gửi Yêu Cầu Mượn',
  '/student/history': 'Lịch Sử Mượn',
};

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
        icon: <UserOutlined />,
        label: (
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{user?.studentId}</div>
          </div>
        ),
      },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: ({ key }: { key: string }) => key === 'logout' && handleLogout(),
  };

  return (
    <Layout className="app-layout">
      <Sider width={240} className="app-sider" theme="dark" breakpoint="lg" collapsedWidth={0}>
        <div className="sider-logo">
          <div className="sider-logo-icon">
            <img
              src="https://tse3.mm.bing.net/th/id/OIP.RjZcMPjW1gO4lp8xOM66IgHaHa?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
          </div>
          <div className="sider-logo-text">
            <h2>CLB Borrow</h2>
            <p>Sinh viên</p>
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

      <Layout className="app-main-layout">
        <Header className="app-header" style={{ height: 64 }}>
          <h2 className="header-title">{pageTitles[location.pathname] || 'CLB Borrow'}</h2>
          <div className="header-right">
            <NotificationBell unreadCount={unreadData?.data?.count || 0} />
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div className="user-info">
                <Avatar style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
