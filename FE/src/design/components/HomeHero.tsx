import { Link } from 'react-router-dom';
import { Icon } from '../../shared/components/Icon';
import '../../features/products/Storefront.css';

export function HomeHero() {
  return (
    <section className="storefront-hero" aria-labelledby="storefront-hero-title">
      <div className="container storefront-hero-grid">
        <div className="storefront-hero-copy">
          <p className="storefront-kicker">
            <Icon name="auto_awesome" />
            Công nghệ trong tầm tay
          </p>
          <h1 id="storefront-hero-title">
            Điện thoại phù hợp.
            <span>Lựa chọn của bạn.</span>
          </h1>
          <p className="storefront-hero-description">
            Khám phá điện thoại, so sánh cấu hình và tìm chiếc máy đáp ứng nhu cầu của bạn cùng trợ
            lý AI.
          </p>
          <div className="storefront-hero-actions">
            <Link className="button button-primary" to="/products">
              Khám phá điện thoại <Icon name="arrow_forward" />
            </Link>
            <Link className="button storefront-ai-button" to="/ai">
              <Icon name="auto_awesome" /> Tư vấn cùng AI
            </Link>
          </div>
          <p className="storefront-hero-note">
            Từ ngân sách đến cấu hình, bắt đầu với điều bạn cần.
          </p>
        </div>
        <figure className="storefront-hero-visual">
          <img
            src="/images/ec1933ac81872449.webp"
            alt="Hai điện thoại được trưng bày cạnh nhau trên bục tại cửa hàng"
            width="512"
            height="279"
            fetchPriority="high"
          />
          <figcaption>
            <span className="storefront-visual-icon">
              <Icon name="compare_arrows" />
            </span>
            <span>
              <strong>Hiểu rõ trước khi chọn</strong>
              <span>Khám phá thông số và so sánh điện thoại.</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
