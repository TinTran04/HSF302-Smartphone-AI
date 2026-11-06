import { Link } from 'react-router-dom';
import { Icon } from '../shared/components/Icon';
import { Button } from '../shared/components/Ui';
import './MaintenanceScreen.css';

export function MaintenanceScreen({
  busy,
  onRetry,
  error,
}: {
  busy: boolean;
  onRetry: () => void;
  error: unknown;
}) {
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
          {busy
            ? 'Đang kiểm tra trạng thái cửa hàng…'
            : error
              ? 'Chưa thể cập nhật trạng thái. Bạn thử lại sau một chút nhé.'
              : 'Trang sẽ tự động mở lại khi cửa hàng sẵn sàng.'}
        </p>
        <div className="maintenance-actions">
          <Button busy={busy} onClick={onRetry}>
            {!busy && <Icon name="refresh" />}
            Thử lại
          </Button>
          <Link to="/login" className="button button-secondary">
            <Icon name="admin_panel_settings" />
            Đăng nhập quản trị
          </Link>
        </div>
      </section>
      <p className="maintenance-signoff">SmartPhone AI · Hẹn bạn ở lần khám phá tiếp theo</p>
    </main>
  );
}
