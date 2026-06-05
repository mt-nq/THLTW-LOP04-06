import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DashboardOutlined,
  FileTextOutlined,
  InboxOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';

const { Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/requests', icon: <FileTextOutlined />, label: 'Quản lý yêu cầu' },
  { key: '/admin/equipment', icon: <InboxOutlined />, label: 'Quản lý kho' },
  { key: '/admin/statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'info',
        icon: <UserOutlined style={{ color: '#fff' }} />,
        label: <div className="font-bold text-white">{user?.name}</div>,
      },
      { type: 'divider' as const, style: { borderColor: 'rgba(255,255,255,0.1)' } },
      { key: 'logout', icon: <LogoutOutlined className="text-red-500" />, label: <span className="text-red-500 font-bold">Đăng xuất</span>, onClick: handleLogout },
    ],
  };

  return (
    <Layout className="min-h-screen bg-[#0c0c0c]">
      <Sider 
        width={260} 
        breakpoint="lg" 
        collapsedWidth={0}
        style={{ background: '#121212', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-4 px-6 py-8 border-b border-white/5">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.5)]">
            <img
              src="https://tse3.mm.bing.net/th/id/OIP.RjZcMPjW1gO4lp8xOM66IgHaHa?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-[#e50914] text-xl font-black tracking-tight m-0" style={{ textShadow: '0 2px 10px rgba(229,9,20,0.3)' }}>GEARFLIX</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider m-0 mt-1">Admin Panel</p>
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            marginTop: 16, 
            padding: '0 12px' 
          }}
          className="admin-dark-menu"
        />
        
        <style>{`
          .admin-dark-menu .ant-menu-item {
            color: #9ca3af !important;
            border-radius: 8px !important;
            margin-bottom: 8px !important;
            transition: all 0.3s;
          }
          .admin-dark-menu .ant-menu-item:hover {
            color: #fff !important;
            background-color: rgba(255,255,255,0.05) !important;
          }
          .admin-dark-menu .ant-menu-item-selected {
            color: #fff !important;
            background-color: rgba(229,9,20,0.15) !important;
            border-left: 4px solid #e50914 !important;
          }
        `}</style>
      </Sider>

      <Layout className="bg-[#0c0c0c]">
        {/* Glassmorphism Header */}
        <div className="bg-[#0c0c0c]/80 backdrop-blur-xl px-8 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="text-white text-lg font-black tracking-wide">TRUNG TÂM QUẢN TRỊ</div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative text-gray-400 hover:text-white cursor-pointer transition">
              <i className="fa-solid fa-bell text-lg"></i>
              <span className="absolute -top-1.5 -right-1.5 bg-[#e50914] text-white text-[9px] font-bold px-1.5 rounded-full animate-pulse">
                3
              </span>
            </div>

            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']} dropdownRender={(menu) => (
                <div className="bg-[#141414] border border-white/10 rounded-lg shadow-xl min-w-[150px]">
                  {menu}
                </div>
              )}>
                <div className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-gray-200 group-hover:text-white transition">{user?.name}</div>
                    <div className="text-[10px] font-bold text-[#e50914] uppercase tracking-wider">Quản Trị Viên</div>
                  </div>
                  <Avatar style={{ background: 'linear-gradient(135deg, #b1060f, #e50914)', border: '2px solid rgba(255,255,255,0.1)' }} className="shadow-lg">
                    {user?.name?.charAt(0) || 'A'}
                  </Avatar>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>

        <Content className="p-4 md:p-8 overflow-y-auto netflix-scroll">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
