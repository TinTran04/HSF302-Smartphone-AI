import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { EmptyState } from '../../shared/components/Ui';
export function RequireAdmin() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? (
    <Outlet />
  ) : (
    <div className="container page">
      <EmptyState
        title="Bạn không có quyền truy cập"
        description="Khu vực này dành cho quản trị viên."
        icon="lock"
        action={
          <Link to="/" className="button button-primary">
            Về trang chủ
          </Link>
        }
      />
    </div>
  );
}
