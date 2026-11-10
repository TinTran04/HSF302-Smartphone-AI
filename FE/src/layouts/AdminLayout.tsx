import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Brand } from '../shared/components/AppHeader';
import { Icon } from '../shared/components/Icon';
import { DemoBanner } from './StoreLayout';
import { useAuth } from '../features/auth/AuthProvider';
import { Button, Modal, useToast } from '../shared/components/Ui';
import { errorMessage } from '../shared/utils/format';
import { AdminAiKeyAlert } from '../features/ai-chat/components/AdminAiKeyAlert';
import { AdminAiNotifications } from '../features/ai-chat/components/AdminAiNotifications';
import './AdminLayout.css';
const links = [
  { to: '/admin', name: 'Tổng quan', icon: 'dashboard', group: 'Không gian làm việc' },
  { to: '/admin/products', name: 'Quản lý sản phẩm', icon: 'smartphone', group: 'Cửa hàng' },
  { to: '/admin/orders', name: 'Quản lý đơn hàng', icon: 'receipt_long', group: 'Cửa hàng' },
  { to: '/admin/brands', name: 'Thương hiệu', icon: 'category', group: 'Cửa hàng' },
  { to: '/admin/accounts', name: 'Quản lý tài khoản', icon: 'manage_accounts', group: 'Tài khoản' },
  { to: '/admin/profile', name: 'Thông tin tài khoản', icon: 'person', group: 'Tài khoản' },
  { to: '/admin/knowledge', name: 'Kho kiến thức AI', icon: 'dataset', group: 'Trợ lý AI' },
  { to: '/admin/ai-settings', name: 'Cấu hình AI', icon: 'tune', group: 'Trợ lý AI' },
  { to: '/admin/embedding', name: 'Cấu hình embedding', icon: 'dataset', group: 'Trợ lý AI' },
  { to: '/admin/maintenance', name: 'Bảo trì', icon: 'settings', group: 'Hệ thống' },
];

function AdminNavigation({ onSelect }: { onSelect?: () => void }) {
  return (
    <nav className="admin-nav" aria-label="Quản trị">
      {[...new Set(links.map((link) => link.group))].map((group) => (
        <div className="admin-nav-group" key={group}>
          <p className="admin-nav-label">{group}</p>
          {links
            .filter((link) => link.group === group)
            .map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/admin'} onClick={onSelect}>
                <Icon name={link.icon} />
                <span>{link.name}</span>
              </NavLink>
            ))}
        </div>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [pending, setPending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLink = links.find(
    (link) => link.to !== '/admin' && pathname.startsWith(`${link.to}`),
  );
  const detailTitle =
    pathname === '/admin/products/new'
      ? 'Thêm sản phẩm'
      : /^\/admin\/products\/[^/]+\/edit$/.test(pathname)
        ? 'Chỉnh sửa sản phẩm'
        : /^\/admin\/orders\/[^/]+$/.test(pathname)
          ? 'Chi tiết đơn hàng'
          : '';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await logout();
      navigate('/login');
      notify('Đã đăng xuất.');
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
        <div className="admin-brand-block">
          <Brand to="/admin" />
          <p className="admin-portal-label">Không gian quản trị</p>
        </div>
        <AdminNavigation />
        <div className="mt-auto sidebar-bottom">
          <div className="admin-account-card">
            <p className="text-sm font-semibold">{user?.fullName}</p>
            <p className="help-text mt-1">Quản trị viên</p>
            <Button className="admin-signout" variant="ghost" busy={pending} onClick={signOut}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <Button
            className="admin-menu-button"
            variant="secondary"
            aria-label="Mở menu quản trị"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
            <span>Menu</span>
          </Button>
          <nav className="admin-breadcrumb" aria-label="Đường dẫn quản trị">
            <Link to="/admin">SmartPhone AI</Link>
            <Icon name="chevron_right" />
            {detailTitle && currentLink ? (
              <>
                <Link to={currentLink.to}>{currentLink.name}</Link>
                <Icon name="chevron_right" />
                <span aria-current="page">{detailTitle}</span>
              </>
            ) : (
              <span aria-current="page">{currentLink?.name || 'Tổng quan'}</span>
            )}
          </nav>
          <AdminAiNotifications />
          <Link to="/admin/profile" className="admin-profile-link">
            <Icon name="person" />
            <span>Tài khoản của tôi</span>
          </Link>
          <Button className="admin-mobile-logout" variant="ghost" busy={pending} onClick={signOut}>
            Đăng xuất quản trị
          </Button>
        </header>
        <DemoBanner admin />
        <main id="main" className="admin-content">
          <AdminAiKeyAlert />
          <Outlet />
        </main>
      </div>
      {menuOpen && (
        <Modal title="Menu quản trị" onClose={() => setMenuOpen(false)}>
          <div className="admin-drawer-content">
            <AdminNavigation onSelect={() => setMenuOpen(false)} />
            <div className="admin-account-card">
              <p className="font-semibold">{user?.fullName}</p>
              <p className="help-text mt-1">Quản trị viên</p>
              <Button className="admin-signout" variant="ghost" busy={pending} onClick={signOut}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
