
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import LoginPage from './pages/login';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import EquipmentPage from './pages/student/equipment';
import BorrowPage from './pages/student/borrow';
import HistoryPage from './pages/student/history';
import AdminDashboard from './pages/admin/dashboard';
import AdminRequestsPage from './pages/admin/requests';
import AdminEquipmentPage from './pages/admin/equipment';
import StatisticsPage from './pages/admin/statistics';
import NotFoundPage from './pages/NotFound';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'STUDENT' | 'ADMIN' }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/equipment'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Student routes */}
      <Route
        path="/student"
        element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="equipment" replace />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="borrow" element={<BorrowPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="equipment" element={<AdminEquipmentPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
