import { Link, Navigate, Outlet } from 'react-router-dom';
import { AppHeader } from '../shared/components/AppHeader';
import { AppFooter } from '../shared/components/AppFooter';
import { CompareTray } from '../features/comparison/CompareTray';
import { isDemo } from '../shared/api';
import { useQuery } from '@tanstack/react-query';
import { http } from '../shared/api/httpClient';
import { useAuth } from '../features/auth/AuthProvider';
import { Skeleton } from '../shared/components/Ui';
export function DemoBanner({ admin = false }: { admin?: boolean }) {
  return isDemo ? (
    <div className="demo-banner">
      Chế độ demo · Dữ liệu và câu trả lời AI chỉ dùng minh họa, chưa kết nối Backend.
      <Link to={admin ? '/admin/profile' : '/login'}>
        {admin ? 'Tài khoản quản trị' : 'Tài khoản demo'}
      </Link>
      {!admin && import.meta.env.DEV && <Link to="/design">14 mẫu Stitch</Link>}
    </div>
  ) : null;
}
export function StoreLayout() {
  const { user, loading } = useAuth();
  const maintenance = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => http<{ enabled: boolean }>('/maintenance'),
    enabled: !isDemo && !loading && user?.role !== 'ADMIN',
    refetchInterval: 30000,
    retry: false,
  });
  if (loading) return <div className="container page"><Skeleton count={1} /></div>;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="skip-link">
        Đến nội dung chính
      </a>
      <AppHeader />
      <DemoBanner />
      {maintenance.data?.enabled && <div className="notice" role="status">Cửa hàng đang bảo trì. Một số chức năng tạm thời không khả dụng.</div>}
      <main id="main" className="flex-1 min-w-0">
        <Outlet />
      </main>
      <AppFooter />
      <CompareTray />
    </div>
  );
}
