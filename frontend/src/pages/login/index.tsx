import { useState } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useRegisterMutation } from '@/store/api/authApi';
import { loginSuccess } from '@/store/slices/authSlice';
import { LoginRequest, RegisterRequest } from '@/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>('student');
  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = async (values: LoginRequest) => {
    try {
      const res = await login(values).unwrap();
      if (res.success) {
        dispatch(loginSuccess({ token: res.data.token, user: res.data }));
        message.success(`Chào mừng, ${res.data.name}! 🎉`);
        if (res.data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/equipment');
        }
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      message.error(error?.data?.message || 'Email hoặc mật khẩu không đúng');
    }
  };

  const handleRegister = async (values: RegisterRequest) => {
    try {
      const res = await register(values).unwrap();
      if (res.success) {
        message.success('Đăng ký tài khoản sinh viên thành công! 🎉');
        setIsRegister(false);
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      message.error(error?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.8) 100%), url(https://assets.nflxext.com/ffe/siteui/vlv3/c3ed7e68-a3ed-43d8-8e1b-ccc7c5e2fd9a/99863a35-18e3-4d43-9828-569d65942d99/VN-vi-20231211-popsignuptwoweeks-perspective_alpha_website_large.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <header style={{ padding: '20px 4%' }}>
        <h1 style={{ color: '#e50914', fontSize: '2.5rem', fontWeight: 900, margin: 0, userSelect: 'none' }}>
          GEARFLIX
        </h1>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.75)',
          padding: '60px 68px 40px',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '450px',
          minHeight: '500px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          {isRegister ? (
            <>
              <h2 style={{ color: 'white', fontSize: '32px', fontWeight: 700, marginBottom: '28px' }}>
                Đăng Ký
              </h2>
              <Form layout="vertical" onFinish={handleRegister} size="large">
                <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#8c8c8c' }} />} placeholder="Họ và tên" style={{ background: '#333', border: 'none', color: 'white', height: '50px' }} />
                </Form.Item>
                <Form.Item name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
                  <Input prefix={<IdcardOutlined style={{ color: '#8c8c8c' }} />} placeholder="Mã số sinh viên" style={{ background: '#333', border: 'none', color: 'white', height: '50px' }} />
                </Form.Item>
                <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                  <Input prefix={<MailOutlined style={{ color: '#8c8c8c' }} />} placeholder="Email" style={{ background: '#333', border: 'none', color: 'white', height: '50px' }} />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Mật khẩu phải chứa ít nhất 6 ký tự' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#8c8c8c' }} />} placeholder="Mật khẩu" style={{ background: '#333', border: 'none', color: 'white', height: '50px' }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={isRegisterLoading} block style={{ height: '50px', fontSize: '16px', fontWeight: 'bold', background: '#e50914', border: 'none', marginTop: '16px' }}>
                  Đăng Ký
                </Button>
              </Form>
              <div style={{ marginTop: '30px', color: '#737373', fontSize: '16px' }}>
                Đã có tài khoản?{' '}
                <span onClick={() => setIsRegister(false)} style={{ color: 'white', cursor: 'pointer' }}>Đăng nhập ngay.</span>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ color: 'white', fontSize: '32px', fontWeight: 700, marginBottom: '28px' }}>
                Đăng Nhập
              </h2>
              
              <Tabs
                activeKey={activeRole}
                onChange={(key) => setActiveRole(key as 'student' | 'admin')}
                items={[
                  { key: 'student', label: <span style={{ color: activeRole === 'student' ? 'white' : '#737373' }}>Sinh Viên</span> },
                  { key: 'admin', label: <span style={{ color: activeRole === 'admin' ? 'white' : '#737373' }}>Quản Trị</span> },
                ]}
                tabBarStyle={{ borderBottom: 'none', marginBottom: '24px' }}
              />

              <Form layout="vertical" onFinish={handleLogin} size="large" key={activeRole}>
                <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#8c8c8c' }} />} placeholder="Email hoặc số điện thoại" style={{ background: '#333', border: 'none', color: 'white', height: '50px' }} />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#8c8c8c' }} />} placeholder="Mật khẩu" style={{ background: '#333', border: 'none', color: 'white', height: '50px' }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading} block style={{ height: '50px', fontSize: '16px', fontWeight: 'bold', background: '#e50914', border: 'none', marginTop: '16px' }}>
                  Đăng Nhập
                </Button>
              </Form>
              
              {activeRole === 'student' && (
                <div style={{ marginTop: '50px', color: '#737373', fontSize: '16px' }}>
                  Bạn mới tham gia CLB?{' '}
                  <span onClick={() => setIsRegister(true)} style={{ color: 'white', cursor: 'pointer' }}>Đăng ký ngay.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
