import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { Icon } from '../shared/components/Icon';
import './MaintenanceScreen.css';

export function MaintenanceScreen() {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  return (
    <main id="main" className="maintenance-page">
      <div className="brand maintenance-brand" aria-label="SmartPhone AI">
        <Icon name="auto_awesome" />
        <span>
          SmartPhone <b>AI</b>
        </span>
      </div>
      <section className="maintenance-card" aria-labelledby="maintenance-heading">
        <p className="maintenance-badge">
          <span />
          Tạm dừng để nâng cấp
        </p>
        <div className="maintenance-illustration" aria-hidden="true">
          <span className="maintenance-spark maintenance-spark-one">+</span>
          <div className="maintenance-icon">
            <Icon name="construction" />
          </div>
          <span className="maintenance-spark maintenance-spark-two">+</span>
          <span className="maintenance-tool">
            <Icon name="settings" />
          </span>
        </div>
        <p className="eyebrow">Thông báo hệ thống</p>
        <h1 id="maintenance-heading">Shop đang bảo trì</h1>
        <p className="maintenance-description">
          Chúng mình đang nâng cấp cửa hàng để bạn có trải nghiệm tốt hơn. Cảm ơn bạn đã chờ, hẹn
          gặp lại bạn sớm nhé!
        </p>
        <div className="maintenance-blocks" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="maintenance-update" role="status" aria-live="polite">
          Vui lòng tải lại trang để cập nhật khi bảo trì kết thúc.
        </p>
        {!user && (
          <div className="maintenance-actions">
            <Link
              to="/login"
              state={{ from: `${pathname}${search}` }}
              className="button button-secondary"
            >
              <Icon name="login" />
              Đăng nhập
            </Link>
          </div>
        )}
      </section>
      <p className="maintenance-signoff">SmartPhone AI · Hẹn bạn ở lần khám phá tiếp theo</p>
    </main>
  );
}
