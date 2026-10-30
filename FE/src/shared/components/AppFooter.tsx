import { Link } from 'react-router-dom';
import { Brand } from './AppHeader';
export function AppFooter() {
  return (
    <footer className="store-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p>
              Hệ thống bán điện thoại thông minh kết hợp trợ lý AI, giúp bạn lựa chọn chiếc máy phù
              hợp.
            </p>
            <span className="badge badge-success mt-4">Thanh toán khi nhận hàng</span>
          </div>
          <div>
            <h3>Khám phá</h3>
            {['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'vivo'].map((b) => (
              <Link key={b} to={`/products?brandId=${b.toLowerCase()}`}>
                {b}
              </Link>
            ))}
          </div>
          <div>
            <h3>Tài khoản & đơn hàng</h3>
            <Link to="/profile">Tài khoản của tôi</Link>
            <Link to="/orders">Theo dõi đơn hàng</Link>
            <Link to="/cart">Giỏ hàng</Link>
            <Link to="/ai">Hỗ trợ chính sách cửa hàng</Link>
          </div>
          <div>
            <h3>Trợ lý AI</h3>
            <Link to="/ai?topic=PHONE_CONSULTATION">Tư vấn mua điện thoại</Link>
            <Link to="/compare">So sánh cấu hình</Link>
            <Link to="/ai?topic=SHOP_SUPPORT">Hỏi đáp chính sách</Link>
            <Link to="/ai?topic=GENERAL_CHAT">Trò chuyện cùng AI</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>SmartPhone AI · Công nghệ bạn yêu. Lựa chọn thông minh hơn.</span>
          <span>© {new Date().getFullYear()} SmartPhone AI</span>
        </div>
      </div>
    </footer>
  );
}
