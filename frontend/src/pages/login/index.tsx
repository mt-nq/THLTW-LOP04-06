import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined, MailOutlined } from '@ant-design/icons';
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
        navigate(res.data.role === 'ADMIN' ? '/admin/dashboard' : '/student/equipment');
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

  const inputStyle = {
    height: 48,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: '#fff',
  };

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: '#0d0d0d',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.6,
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,12,41,0.8) 0%, rgba(48,43,99,0.4) 50%, rgba(36,36,62,0.8) 100%)' }} />

      {/* Decorative animated orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
        background: 'radial-gradient(circle, rgba(91, 92, 240,0.4) 0%, rgba(91, 92, 240,0) 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'float 12s infinite ease-in-out', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '5%', width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400,
        background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0) 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'float 15s infinite ease-in-out reverse', pointerEvents: 'none'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      {/* Navbar */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '20px 5%',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: 'linear-gradient(135deg,#5b5cf0,#4338ca)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(91, 92, 240,0.5)',
        }}>
          <i className="fa-solid fa-boxes-stacked" style={{ color: '#fff', fontSize: 16 }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.3px' }}>CLB BORROW</div>
          <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 1 }}>Kết nối & Sẻ chia</div>
        </div>
      </div>

      {/* Form */}
      <div style={{
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(18,18,18,0.92)',
          backdropFilter: 'blur(24px)',
          borderRadius: 12, padding: '36px 40px 32px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(91, 92, 240,0.08)',
        }}>
          {isRegister ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Đăng Ký</h2>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0' }}>Tạo tài khoản sinh viên để bắt đầu mượn thiết bị</p>
              </div>
              <Form layout="vertical" onFinish={handleRegister} size="large">
                <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#4b5563' }} />} placeholder="Họ và tên" style={inputStyle} />
                </Form.Item>
                <Form.Item name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
                  <Input prefix={<IdcardOutlined style={{ color: '#4b5563' }} />} placeholder="Mã số sinh viên" style={inputStyle} />
                </Form.Item>
                <Form.Item name="email" rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                  { pattern: /^[A-Za-z0-9+_.-]+@gmail\.com$/, message: 'Email bắt buộc phải có đuôi @gmail.com' }
                ]}>
                  <Input prefix={<MailOutlined style={{ color: '#4b5563' }} />} placeholder="Email" style={inputStyle} />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#4b5563' }} />} placeholder="Mật khẩu" style={inputStyle} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={isRegisterLoading} block
                  style={{ height: 50, borderRadius: 8, fontSize: 14, fontWeight: 800, background: 'linear-gradient(135deg,#5b5cf0,#4338ca)', border: 'none', boxShadow: '0 4px 18px rgba(91, 92, 240,0.45)', marginTop: 4 }}>
                  Đăng Ký Tài Khoản
                </Button>
              </Form>
              <div style={{ marginTop: 24, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
                Đã có tài khoản?{' '}
                <span onClick={() => setIsRegister(false)} style={{ color: '#5b5cf0', cursor: 'pointer', fontWeight: 700 }}>
                  Đăng nhập ngay
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Đăng Nhập</h2>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0' }}>Chào mừng trở lại CLB Borrow!</p>
              </div>

              {/* Role selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 8 }}>
                {(['student', 'admin'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setActiveRole(role)}
                    style={{
                      flex: 1, height: 38, borderRadius: 6, cursor: 'pointer',
                      border: 'none', fontSize: 12, fontWeight: 800,
                      background: activeRole === role ? 'linear-gradient(135deg,#5b5cf0,#4338ca)' : 'transparent',
                      color: activeRole === role ? '#fff' : '#6b7280',
                      transition: 'all 0.2s',
                      boxShadow: activeRole === role ? '0 2px 12px rgba(91, 92, 240,0.4)' : 'none',
                    }}
                  >
                    {role === 'student' ? '🎓 Sinh Viên' : '🛡 Quản Trị'}
                  </button>
                ))}
              </div>

              <Form layout="vertical" onFinish={handleLogin} size="large" key={activeRole}>
                <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#4b5563' }} />} placeholder="Email" style={inputStyle} />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#4b5563' }} />} placeholder="Mật khẩu" style={inputStyle} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading} block
                  style={{ height: 50, borderRadius: 8, fontSize: 14, fontWeight: 800, background: 'linear-gradient(135deg,#5b5cf0,#4338ca)', border: 'none', boxShadow: '0 4px 18px rgba(91, 92, 240,0.45)', marginTop: 4 }}>
                  Đăng Nhập
                </Button>
              </Form>

              {activeRole === 'student' && (
                <div style={{ marginTop: 24, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
                  Bạn mới tham gia CLB?{' '}
                  <span onClick={() => setIsRegister(true)} style={{ color: '#5b5cf0', cursor: 'pointer', fontWeight: 700 }}>
                    Đăng ký ngay
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '16px', color: '#374151', fontSize: 12 }}>
        CLB Borrow Management System © 2025
      </div>
    </div>
  );
}
