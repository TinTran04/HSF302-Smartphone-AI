import { Link } from 'react-router-dom';
import { HomeHero } from '../../design/components/HomeHero';
import { useBrands, useProducts } from '../../features/products/useProducts';
import { ProductCard } from '../../features/products/ProductCard';
import { chatTopics } from '../../features/ai-chat/constants/chatTopics';
import { Icon } from '../../shared/components/Icon';
import { EmptyState, ErrorState, Skeleton } from '../../shared/components/Ui';

export default function HomePage() {
  const products = useProducts(new URLSearchParams({ size: '4' }));
  const brands = useBrands();
  return (
    <div className="storefront-home">
      <HomeHero />
      <section className="storefront-brands" aria-label="Khám phá theo thương hiệu">
        <div className="container">
          <p className="storefront-label">Thương hiệu bạn yêu thích</p>
          <div className="storefront-brand-grid">
            {brands.data?.map((brand) => (
              <Link
                key={brand.id}
                className="storefront-brand"
                to={`/products?brandId=${brand.id}`}
              >
                <span>{brand.name}</span>
                <Icon name="arrow_outward" />
              </Link>
            ))}
          </div>
          {brands.isPending && (
            <p className="muted" role="status">
              Đang tải thương hiệu…
            </p>
          )}
          {brands.error && (
            <ErrorState
              error={brands.error}
              retry={() => {
                void brands.refetch();
              }}
            />
          )}
        </div>
      </section>
      <section className="storefront-section">
        <div className="container">
          <div className="storefront-section-heading">
            <div>
              <p className="storefront-kicker">Bộ sưu tập điện thoại</p>
              <h2>Khám phá chiếc máy tiếp theo</h2>
              <p className="muted">Thông số rõ ràng. Dễ tìm hiểu, dễ so sánh.</p>
            </div>
            <Link className="storefront-section-link" to="/products">
              Xem tất cả <Icon name="arrow_forward" />
            </Link>
          </div>
          {products.isPending ? (
            <Skeleton count={4} />
          ) : products.error ? (
            <ErrorState
              error={products.error}
              retry={() => {
                void products.refetch();
              }}
            />
          ) : products.data?.items.length ? (
            <div className="product-grid home-products storefront-products">
              {products.data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có sản phẩm" description="Sản phẩm sẽ được cập nhật tại đây." />
          )}
        </div>
      </section>
      <section className="storefront-section storefront-ai-section">
        <div className="container">
          <div className="storefront-section-heading">
            <div>
              <p className="storefront-kicker">
                <Icon name="auto_awesome" /> Trợ lý SmartPhone AI
              </p>
              <h2>Chọn dễ hơn cùng một cuộc trò chuyện</h2>
              <p className="muted">Chia sẻ nhu cầu hoặc chọn chủ đề để bắt đầu.</p>
            </div>
          </div>
          <div className="storefront-topics">
            {chatTopics.map((topic) => (
              <Link key={topic.id} to={`/ai?topic=${topic.id}`} className="storefront-topic">
                <span className="storefront-topic-icon">
                  <Icon name={topic.icon} />
                </span>
                <div>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                  <span className="storefront-topic-action">
                    Bắt đầu trò chuyện <Icon name="arrow_forward" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="storefront-section">
        <div className="container storefront-shopping-guide">
          <div>
            <p className="storefront-kicker">Mua sắm theo cách của bạn</p>
            <h2>Từ tìm hiểu đến lựa chọn</h2>
          </div>
          {[
            {
              icon: 'tune',
              title: 'Tìm đúng nhu cầu',
              text: 'Lọc theo thương hiệu, ngân sách, RAM và dung lượng lưu trữ.',
            },
            {
              icon: 'compare_arrows',
              title: 'So sánh trước khi chọn',
              text: 'Đặt các thiết bị cạnh nhau để xem cấu hình và giá.',
            },
            {
              icon: 'payments',
              title: 'Đặt hàng rõ ràng',
              text: 'Kiểm tra phiên bản và đơn hàng trước khi thanh toán khi nhận hàng.',
            },
          ].map((item) => (
            <div className="storefront-guide-item" key={item.title}>
              <Icon name={item.icon} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
