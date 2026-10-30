import { Link, Outlet } from 'react-router-dom';
import { AppHeader } from '../shared/components/AppHeader';
import { AppFooter } from '../shared/components/AppFooter';
import { CompareTray } from '../features/comparison/CompareTray';
import { isDemo } from '../shared/api';
import { useQuery } from '@tanstack/react-query';
import { http } from '../shared/api/httpClient';
export function DemoBanner() {
  return isDemo ? (
    <div className="demo-banner">
      Chế độ demo · Dữ liệu và câu trả lời AI chỉ dùng minh họa, chưa kết nối Backend.
      <Link to="/login">Tài khoản demo</Link>
      {import.meta.env.DEV && <Link to="/design">14 mẫu Stitch</Link>}
    </div>
  ) : null;
}
export function StoreLayout() {
  const maintenance = useQuery({ queryKey: ['maintenance'], queryFn: () => http<{enabled:boolean}>('/maintenance'), enabled: !isDemo, refetchInterval: 30000, retry: false });
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
