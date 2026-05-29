import { useState } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '@/store/api/authApi';
import { loginSuccess } from '@/store/slices/authSlice';
import { LoginRequest } from '@/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>('student');

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

  const demoCredentials = activeRole === 'student'
    ? { email: 'sinhvien@student.edu.vn', password: 'Student@123' }
    : { email: 'admin@club.edu.vn', password: 'Admin@123' };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
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
          <h1>CLB Borrow</h1>
          <p>Hệ thống quản lý mượn đồ dùng</p>
        </div>

        <Tabs
          centered
          activeKey={activeRole}
          onChange={(key) => setActiveRole(key as 'student' | 'admin')}
          items={[
            { key: 'student', label: '👨‍🎓 Sinh Viên' },
            { key: 'admin', label: '🛠️ Quản Trị Viên' },
          ]}
          style={{ marginBottom: 8 }}
        />

        <Form
          layout="vertical"
          onFinish={handleLogin}
          initialValues={demoCredentials}
          size="large"
          key={activeRole}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#6366f1' }} />}
              placeholder="Nhập email của bạn"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#6366f1' }} />}
              placeholder="Nhập mật khẩu"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            style={{ height: 50, borderRadius: 12, fontSize: 16, fontWeight: 700, marginTop: 8 }}
          >
            Đăng Nhập
          </Button>
        </Form>

        <div style={{
          marginTop: 20,
          padding: '12px 16px',
          background: '#f8f9ff',
          borderRadius: 10,
          border: '1px dashed #c7d2fe',
          textAlign: 'center',
        }}>
          <BookOutlined style={{ color: '#6366f1', marginRight: 6 }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Demo: <strong style={{ color: '#4f46e5' }}>{demoCredentials.email}</strong>
            {' / '}
            <strong style={{ color: '#4f46e5' }}>{demoCredentials.password}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
