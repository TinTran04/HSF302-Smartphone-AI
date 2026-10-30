import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Brand } from '../shared/components/AppHeader';
import { Icon } from '../shared/components/Icon';
import { DemoBanner } from './StoreLayout';
import { useAuth } from '../features/auth/AuthProvider';
import { Button, useToast } from '../shared/components/Ui';
import { errorMessage } from '../shared/utils/format';
const links = [
  { to: '/admin', name: 'Tổng quan', icon: 'dashboard' },
  { to: '/admin/products', name: 'Quản lý sản phẩm', icon: 'smartphone' },
  { to: '/admin/brands', name: 'Thương hiệu', icon: 'category' },
  { to: '/admin/admins', name: 'Quản trị viên', icon: 'manage_accounts' },
  { to: '/admin/maintenance', name: 'Bảo trì', icon: 'settings' },
  { to: '/admin/orders', name: 'Quản lý đơn hàng', icon: 'receipt_long' },
  { to: '/admin/knowledge', name: 'Kho kiến thức AI', icon: 'dataset' },
  { to: '/admin/ai-settings', name: 'Cấu hình AI', icon: 'tune' },
  { to: '/admin/embedding', name: 'Cấu hình embedding', icon: 'dataset' },
];
export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="admin-shell">
      <a href="#main" className="skip-link">
        Đến nội dung chính
      </a>
      <aside className="admin-sidebar">
        <div>
          <Brand />
          <p className="eyebrow !mb-0 ml-12 mt-1">Admin Portal</p>
        </div>
        <nav className="admin-nav" aria-label="Quản trị">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/admin'}>
              <Icon name={l.icon} />
              {l.name}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto sidebar-bottom">
          <Link to="/" className="text-link text-xs flex items-center gap-2 mb-6">
            <Icon name="arrow_back" />
            Quay lại cửa hàng
          </Link>
          <div className="bg-surface-container-low p-4 rounded-xl">
            <p className="text-sm font-semibold">{user?.fullName}</p>
            <p className="help-text mt-1">Quản trị viên</p>
            <Button
              className="mt-3 !px-0 !min-h-0"
              variant="ghost"
              busy={pending}
              onClick={signOut}
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            SmartPhone AI /{' '}
            {links.find((l) => l.to !== '/admin' && pathname.startsWith(l.to))?.name ||
              'Bảng điều khiển'}
          </span>
          <Link to="/" className="text-link flex items-center gap-2">
            <Icon name="storefront" />
            Cửa hàng
          </Link>
          <Button className="admin-mobile-logout" variant="ghost" busy={pending} onClick={signOut}>Đăng xuất quản trị</Button>
        </header>
        <DemoBanner />
        <main id="main" className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
