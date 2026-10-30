import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { ErrorState, Skeleton } from '../../shared/components/Ui';
export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading)
    return (
      <div className="container page">
        <Skeleton count={1} />
      </div>
    );
  if (auth.error)
    return (
      <div className="container page">
        <ErrorState error={auth.error} retry={auth.retry} />
      </div>
    );
  if (!auth.user)
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  return <Outlet />;
}
