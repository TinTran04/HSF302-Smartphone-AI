import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { Icon } from '../shared/components/Icon';
export function AccountLayout() {
  const { user } = useAuth();
  return (
    <div className="container page">
      <div className="account-layout">
        <aside className="card account-sidebar">
          <div className="account-user px-3 pb-5 mb-3 border-b">
            <span className="avatar mb-3">{user?.fullName[0]}</span>
            <h3 className="!text-sm">{user?.fullName}</h3>
            <p className="help-text mt-1 break-all">{user?.email}</p>
          </div>
          <NavLink to="/profile">
            <Icon name="person" />
            Thông tin tài khoản
          </NavLink>
          <NavLink to="/orders">
            <Icon name="receipt_long" />
            Đơn hàng của tôi
          </NavLink>
          <NavLink to="/ai">
            <Icon name="auto_awesome" />
            Lịch sử AI
          </NavLink>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
