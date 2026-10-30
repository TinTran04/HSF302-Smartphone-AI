import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../features/products/ProductCard';
import { ProductFilters } from '../../features/products/ProductFilters';
import { useProducts } from '../../features/products/useProducts';
import {
  Breadcrumb,
  Button,
  EmptyState,
  ErrorState,
  PageHeading,
  Skeleton,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
export function sanitizeCatalogParams(input: URLSearchParams) {
  const params = new URLSearchParams();
  for (const key of ['keyword', 'brandId', 'ram', 'storage'])
    if (input.get(key)?.trim()) params.set(key, input.get(key)!.trim().slice(0, 120));
  for (const key of ['minPrice', 'maxPrice']) {
    const value = input.get(key);
    if (value && Number.isFinite(Number(value)) && Number(value) >= 0)
      params.set(key, String(Number(value)));
  }
  if (
    params.has('minPrice') &&
    params.has('maxPrice') &&
    Number(params.get('maxPrice')) < Number(params.get('minPrice'))
  )
    params.delete('maxPrice');
  const page = Number(input.get('page'));
  if (Number.isSafeInteger(page) && page > 1) params.set('page', String(page));
  if (['price,asc', 'price,desc', 'name,asc'].includes(input.get('sort') || ''))
    params.set('sort', input.get('sort')!);
  return params;
}
export default function ProductListPage() {
  const [raw, setParams] = useSearchParams();
  const params = sanitizeCatalogParams(raw);
  const canonical = params.toString();
  useEffect(() => {
    if (raw.toString() !== canonical) setParams(params, { replace: true });
  }, [raw.toString(), canonical]);
  const [keyword, setKeyword] = useState(params.get('keyword') || '');
  useEffect(() => setKeyword(params.get('keyword') || ''), [params.get('keyword')]);
  const products = useProducts(params);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }
  return (
    <div className="container page">
      <Breadcrumb items={[{ label: 'Điện thoại' }]} />
      <PageHeading
        title="Khám phá điện thoại"
        description="Tìm thiết bị dành cho bạn. Lựa chọn thông minh hơn cùng AI."
      />
      <div className="catalog-layout">
        <ProductFilters
          params={params}
          update={update}
          reset={() => {
            setKeyword('');
            setParams({});
          }}
        />
        <section className="min-w-0">
          <form
            className="search-field"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update('keyword', keyword);
            }}
          >
            <Icon name="search" />
            <input
              aria-label="Tìm kiếm điện thoại"
              placeholder="Tìm theo tên điện thoại…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button className="!absolute right-1 top-1 !min-h-[38px] !py-2" type="submit">
              Tìm kiếm
            </Button>
          </form>
          <div className="catalog-toolbar">
            <p className="muted">
              {products.data
                ? `${products.data.totalItems} điện thoại phù hợp`
                : 'Đang tải sản phẩm…'}
            </p>
            <select
              aria-label="Sắp xếp sản phẩm"
              value={params.get('sort') || ''}
              onChange={(e) => update('sort', e.target.value)}
            >
              <option value="">Sắp xếp mặc định</option>
              <option value="price,asc">Giá: Thấp đến cao</option>
              <option value="price,desc">Giá: Cao đến thấp</option>
              <option value="name,asc">Tên: A–Z</option>
            </select>
          </div>
          {products.isPending ? (
            <Skeleton count={6} />
          ) : products.error ? (
            <ErrorState
              error={products.error}
              retry={() => {
                void products.refetch();
              }}
            />
          ) : !products.data?.items.length ? (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Thử thay đổi từ khóa hoặc bộ lọc của bạn."
              action={
                <Button variant="secondary" onClick={() => setParams({})}>
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
            <>
              <div className="product-grid">
                {products.data.items.map((p) => (
                  <ProductCard product={p} key={p.id} />
                ))}
              </div>
              <div className="pagination">
                <Button
                  variant="secondary"
                  disabled={products.data.page <= 1}
                  onClick={() => update('page', String(products.data!.page - 1))}
                >
                  Trước
                </Button>
                <span>
                  Trang {products.data.page} / {products.data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={products.data.page >= products.data.totalPages}
                  onClick={() => update('page', String(products.data!.page + 1))}
                >
                  Sau
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
