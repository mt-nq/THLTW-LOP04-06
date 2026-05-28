import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Result
        status="404"
        title="404"
        subTitle="Trang bạn tìm không tồn tại."
        extra={
          <Button type="primary" onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/equipment')}>
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
}
