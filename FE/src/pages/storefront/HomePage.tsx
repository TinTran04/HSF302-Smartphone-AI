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
    <>
      <HomeHero />
      <section className="brand-strip">
        <div className="container">
          <div className="brand-grid">
            {brands.data?.map((b) => (
              <Link key={b.id} className="brand-card" to={`/products?brandId=${b.id}`}>
                <Icon name="smartphone" />
                <span>
                  {b.name}
                  <small className="block text-[10px] font-normal muted mt-1">
                    Khám phá thiết bị
                  </small>
                </span>
                <Icon name="chevron_right" className="ml-auto !text-base" />
              </Link>
            ))}
          </div>
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
      <section className="section">
        <div className="container">
          <div className="ai-heading">
            <p className="eyebrow">Công nghệ cốt lõi</p>
            <h2>
              Chưa biết chọn điện thoại nào?
              <br />
              Hãy để AI giúp bạn.
            </h2>
            <p className="muted text-sm mt-4">
              Trợ lý thông minh đồng hành từ việc tìm chiếc máy phù hợp đến tra cứu thông tin và
              chính sách cửa hàng.
            </p>
          </div>
          <div className="topic-grid">
            {chatTopics.map((t, i) => (
              <Link key={t.id} to={`/ai?topic=${t.id}`} className="card topic-card">
                <span className="icon-tile">
                  <Icon name={t.icon} />
                </span>
                <p className="eyebrow !mt-5 !mb-0">Module 0{i + 1}</p>
                <h3 className="!mt-2">{t.title}</h3>
                <p>{t.description}</p>
                <span className="text-link">
                  Bắt đầu trò chuyện
                  <Icon name="arrow_forward" className="!text-base" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-subtle">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Bộ sưu tập điện thoại</p>
              <h2>Khám phá chiếc máy tiếp theo.</h2>
            </div>
            <Link className="text-link text-sm" to="/products">
              Xem tất cả <span aria-hidden="true">→</span>
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
            <div className="product-grid home-products">
              {products.data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có sản phẩm" description="Sản phẩm sẽ được cập nhật tại đây." />
          )}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="text-center mb-10">
            <p className="eyebrow">Trải nghiệm mua sắm thông minh</p>
            <h2>Vì sao chọn SmartPhone AI?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'psychology',
                title: 'Tư vấn theo nhu cầu',
                text: 'Cùng AI tìm hiểu sản phẩm, so sánh cấu hình và lựa chọn phiên bản phù hợp.',
              },
              {
                icon: 'payments',
                title: 'Thanh toán khi nhận hàng',
                text: 'Đặt hàng bằng phương thức COD với thông tin đơn hàng rõ ràng.',
              },
              {
                icon: 'description',
                title: 'Thông tin có nguồn tham khảo',
                text: 'Tra cứu chính sách từ tài liệu cửa hàng cung cấp qua trợ lý AI.',
              },
            ].map((x) => (
              <div className="card panel" key={x.title}>
                <span className="icon-tile mb-5">
                  <Icon name={x.icon} />
                </span>
                <h3 className="!text-base">{x.title}</h3>
                <p className="muted text-sm mt-3">{x.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 p-8 rounded-2xl bg-gradient-to-r from-secondary to-[#5540b0] text-white flex flex-wrap items-center justify-between gap-5">
            <div>
              <h3>Cần hỗ trợ so sánh cấu hình?</h3>
              <p className="text-sm mt-2 opacity-80">
                Bắt đầu với một chủ đề phù hợp cùng trợ lý AI.
              </p>
            </div>
            <Link className="button !bg-white !text-secondary !rounded-full" to="/ai">
              Khởi động AI Trợ lý
              <Icon name="arrow_forward" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
