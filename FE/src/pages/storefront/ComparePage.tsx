import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../../features/comparison/ComparisonProvider';
import { ComparisonTable } from '../../features/comparison/ComparisonTable';
import { useProducts } from '../../features/products/useProducts';
import {
  Breadcrumb,
  Button,
  EmptyState,
  ErrorState,
  Modal,
  PageHeading,
  ProductImage,
  Skeleton,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
export default function ComparePage() {
  const { products, toggle, clear } = useComparison();
  const [picker, setPicker] = useState(false);
  const [diff, setDiff] = useState(false);
  const [keyword, setKeyword] = useState('');
  const catalog = useProducts(new URLSearchParams({ keyword, size: '100' }));
  return (
    <div className="container page">
      <Breadcrumb items={[{ label: 'So sánh' }]} />
      <PageHeading
        title="So sánh điện thoại thông minh"
        description="Đặt tối đa 3 thiết bị cạnh nhau và tìm ra lựa chọn phù hợp."
        action={
          <Button
            variant="secondary"
            onClick={() => setPicker(true)}
            disabled={products.length === 3}
          >
            <Icon name="add" />
            Thêm điện thoại
          </Button>
        }
      />
      <div className="notice flex flex-wrap items-center justify-between gap-5 mb-8">
        <div>
          <h3 className="!text-base">Bạn muốn AI phân tích sâu hơn?</h3>
          <p className="text-sm mt-2">Chọn ít nhất 2 máy để bắt đầu cuộc trò chuyện so sánh.</p>
        </div>
        {products.length >= 2 ? (
          <Link
            className="button button-ai"
            to={`/ai?topic=PHONE_COMPARISON&productIds=${products.map((p) => p.id).join(',')}`}
          >
            <Icon name="auto_awesome" />
            So sánh cùng AI
          </Link>
        ) : (
          <Button variant="ai" disabled>
            So sánh cùng AI
          </Button>
        )}
      </div>
      {products.length ? (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            {products.map((p) => (
              <Button key={p.id} variant="secondary" onClick={() => toggle(p)}>
                {p.name}
                <Icon name="close" className="!text-base" />
              </Button>
            ))}
            <Button variant="ghost" onClick={clear}>
              Đặt lại
            </Button>
          </div>
          <label className="check-label mb-6">
            <input type="checkbox" checked={diff} onChange={(e) => setDiff(e.target.checked)} />
            Chỉ hiển thị khác biệt
          </label>
          <ComparisonTable products={products} differencesOnly={diff} />
          {products.length === 1 && (
            <p className="help-text mt-5">Hãy thêm ít nhất một điện thoại nữa để so sánh.</p>
          )}
        </>
      ) : (
        <EmptyState
          icon="compare_arrows"
          title="Chọn điện thoại để so sánh"
          description="Bạn có thể chọn từ 2 đến 3 thiết bị, mỗi mẫu máy chỉ xuất hiện một lần."
          action={<Button onClick={() => setPicker(true)}>Chọn điện thoại</Button>}
        />
      )}
      {picker && (
        <Modal title="Chọn điện thoại so sánh" onClose={() => setPicker(false)}>
          <input
            aria-label="Tìm máy so sánh"
            placeholder="Tìm theo tên máy…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {catalog.isPending ? (
            <Skeleton count={1} />
          ) : catalog.error ? (
            <ErrorState error={catalog.error} />
          ) : (
            <div className="mt-5 space-y-2">
              {catalog.data?.items
                .filter((p) => !products.some((selected) => selected.id === p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low w-full text-left"
                    disabled={products.length >= 3}
                    onClick={() => {
                      toggle(p);
                      setPicker(false);
                    }}
                  >
                    <ProductImage
                      src={p.images[0]}
                      alt={p.name}
                      className="w-14 h-16 object-contain"
                    />
                    <span className="font-medium text-sm">{p.name}</span>
                    <Icon name="add_circle" className="ml-auto text-primary" />
                  </button>
                ))}
              {!catalog.data?.items.filter((p) => !products.some((s) => s.id === p.id)).length && (
                <p className="muted text-sm p-5">Không có sản phẩm phù hợp.</p>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
