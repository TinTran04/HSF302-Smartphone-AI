import { useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from '../shared/components/AppHeader';
import { AppFooter } from '../shared/components/AppFooter';
import { CompareTray } from '../features/comparison/CompareTray';
import { isDemo } from '../shared/api';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { ApiError, http } from '../shared/api/httpClient';
import { useAuth } from '../features/auth/AuthProvider';
import { ErrorState, Skeleton } from '../shared/components/Ui';
import { Icon } from '../shared/components/Icon';
import { MaintenanceScreen } from './MaintenanceScreen';

const authPaths = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/accept-invitation',
  '/admin/invite',
  '/account/invite',
]);
const shopQueryKeys = new Set([
  'products',
  'product',
  'brands',
  'cart',
  'conversations',
  'conversation',
  'orders',
  'order',
]);

export function subscribeToMaintenance(client: QueryClient) {
  let previousEnabled = client.getQueryData<{ enabled: boolean }>(['maintenance'])?.enabled;
  const enterMaintenance = (error: unknown) => {
    if (!(error instanceof ApiError) || error.code !== 'MAINTENANCE_MODE') return;
    void client.cancelQueries({ queryKey: ['maintenance'], exact: true });
    client.setQueryData(['maintenance'], { enabled: true });
  };
  const unsubscribeQueries = client.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated') return;
    if (event.action.type === 'error') enterMaintenance(event.action.error);
    if (event.query.queryKey[0] !== 'maintenance' || event.action.type !== 'success') return;
    const enabled = client.getQueryData<{ enabled: boolean }>(['maintenance'])?.enabled;
    const ended = previousEnabled === true && enabled === false;
    previousEnabled = enabled;
    if (!ended) return;
    void client.invalidateQueries({
      predicate: (query) =>
        query.state.status === 'error' &&
        shopQueryKeys.has(String(query.queryKey[0])) &&
        query.queryKey[1] !== true &&
        query.queryKey[1] !== 'admin',
    });
  });
  const unsubscribeMutations = client.getMutationCache().subscribe((event) => {
    if (event.type === 'updated' && event.action.type === 'error')
      enterMaintenance(event.action.error);
  });
  return () => {
    unsubscribeQueries();
    unsubscribeMutations();
  };
}

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
  const { pathname, search } = useLocation();
  const client = useQueryClient();
  const authRoute = authPaths.has(pathname.replace(/\/+$/, '').toLowerCase());
  const maintenance = useQuery({
    queryKey: ['maintenance'],
    queryFn: ({ signal }) => http<{ enabled: boolean }>('/maintenance', { signal }),
    enabled: !isDemo && !loading && user?.role !== 'ADMIN',
    refetchInterval: (query) => (query.state.data?.enabled ? false : 30000),
    retry: false,
  });
  useEffect(() => {
    if (isDemo || loading || user?.role === 'ADMIN') return;
    return subscribeToMaintenance(client);
  }, [client, loading, user?.role]);

  if (!loading && user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (!authRoute && loading)
    return (
      <div className="container page">
        <Skeleton count={1} />
      </div>
    );
  if (!authRoute && !isDemo && !maintenance.data)
    return (
      <main id="main" className="maintenance-page">
        <section className="maintenance-card maintenance-check">
          {maintenance.isError ? (
            <>
              <h1>Chưa thể kết nối cửa hàng</h1>
              <ErrorState error={maintenance.error} retry={() => void maintenance.refetch()} />
            </>
          ) : (
            <div role="status">
              <Icon name="progress_activity" className="spin" />
              <h1>Đang kiểm tra cửa hàng</h1>
              <p>Vui lòng chờ một chút nhé.</p>
            </div>
          )}
          {!user && (
            <Link to="/login" state={{ from: `${pathname}${search}` }} className="text-link">
              Đăng nhập
            </Link>
          )}
        </section>
      </main>
    );
  if (!authRoute && !isDemo && maintenance.data?.enabled)
    return <MaintenanceScreen />;
  const showChrome = !authRoute || (!loading && (isDemo || maintenance.data?.enabled === false));
  return (
    <div className="min-h-screen flex flex-col">
      {showChrome && (
        <>
          <a href="#main" className="skip-link">
            Đến nội dung chính
          </a>
          <AppHeader />
          <DemoBanner />
        </>
      )}
      <main id="main" className="flex-1 min-w-0">
        <Outlet />
      </main>
      {showChrome && (
        <>
          <AppFooter />
          <CompareTray />
        </>
      )}
    </div>
  );
}
