import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import { useCart } from '../../features/cart/CartProvider';
import { Icon } from './Icon';
import { useToast } from './Ui';
import { errorMessage } from '../utils/format';
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="SmartPhone AI — Trang chủ">
      <Icon name="auto_awesome" />
      <span>
        SmartPhone <b>AI</b>
      </span>
    </Link>
  );
}
export function AppHeader() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [pending, setPending] = useState(false);
  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await logout();
      navigate('/');
      notify('Đã đăng xuất.');
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setPending(false);
    }
  }
  return (
    <header className="store-header">
      <div className="container header-inner">
        <Brand />
        <nav className="store-nav" aria-label="Điều hướng chính">
          <NavLink to="/" end>
            Trang chủ
          </NavLink>
          <NavLink to="/products">Điện thoại</NavLink>
          <NavLink to="/compare">So sánh</NavLink>
          <NavLink to="/ai">
            <Icon name="auto_awesome" className="!text-base" />
            Tư vấn AI
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link className="icon-button" to="/products" aria-label="Tìm kiếm điện thoại">
            <Icon name="search" />
          </Link>
          <Link
            className="icon-button cart-link"
            to="/cart"
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <Icon name="shopping_bag" />
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          {user ? (
            <details className="account-menu">
              <summary aria-label="Menu tài khoản">
                <span className="avatar">{user.fullName.charAt(0)}</span>
                <span className="text-xs account-name">{user.fullName}</span>
                <Icon name="expand_more" className="!text-base" />
              </summary>
              <div
                className="dropdown"
                onClick={(e) => {
                  const details = e.currentTarget.closest('details');
                  details?.removeAttribute('open');
                }}
              >
                <p className="help-text px-3 py-2 truncate">{user.email}</p>
                <Link to="/profile">
                  <Icon name="person" />
                  Tài khoản của tôi
                </Link>
                <Link to="/orders">
                  <Icon name="receipt_long" />
                  Đơn hàng của tôi
                </Link>
                <Link to="/ai">
                  <Icon name="auto_awesome" />
                  Lịch sử AI
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin">
                    <Icon name="dashboard" />
                    Trang quản trị
                  </Link>
                )}
                <button disabled={pending} onClick={signOut}>
                  <Icon name="logout" />
                  Đăng xuất
                </button>
              </div>
            </details>
          ) : (
            <Link className="icon-button" to="/login" aria-label="Đăng nhập">
              <Icon name="account_circle" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
