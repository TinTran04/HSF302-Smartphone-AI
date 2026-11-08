import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProducts } from '../../features/products/useProducts';
import { api } from '../../shared/api';
import type { PageResult, Product } from '../../shared/types/models';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeading,
  ProductImage,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatVnd, productPrice } from '../../shared/utils/format';

export function productParamsAfterDelete(
  params: URLSearchParams,
  page: Pick<PageResult<Product>, 'page' | 'items'> | undefined,
  deletedId: string,
) {
  const next = new URLSearchParams(params);
  if (page && page.page > 1 && page.items.length === 1 && page.items[0].id === deletedId)
    next.set('page', String(Math.max(1, page.page - 1)));
  return next;
}

export default function ProductManagementPage() {
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('keyword') || '');
  const [changing, setChanging] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const client = useQueryClient();
  const { notify } = useToast();
  const products = useProducts(params, true);
  const status = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      api.productStatus(changing!.id, changing!.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['products'] });
      void client.invalidateQueries({ queryKey: ['product'] });
      void client.invalidateQueries({ queryKey: ['admin-dashboard'] });
      void client.invalidateQueries({ queryKey: ['cart'] });
      setChanging(null);
      notify(
        changing?.status === 'ACTIVE' ? 'Đã đánh dấu sản phẩm hết hàng.' : 'Đã mở bán sản phẩm.',
      );
    },
  });
  const remove = useMutation({
    meta: { toast: { success: false } },
    mutationFn: (product: Product) => api.deleteProduct(product.id),
    onSuccess: (_result, deleted) => {
      const nextParams = productParamsAfterDelete(params, products.data, deleted.id);
      if (nextParams.toString() !== params.toString()) setParams(nextParams, { replace: true });
      void client.invalidateQueries({ queryKey: ['products'] });
      void client.invalidateQueries({ queryKey: ['product'] });
      void client.invalidateQueries({ queryKey: ['admin-dashboard'] });
      void client.invalidateQueries({ queryKey: ['cart'] });
      setDeleting(null);
      notify('Đã xóa vĩnh viễn sản phẩm.');
    },
  });
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }
  return (
    <>
      <PageHeading
        title="Quản lý sản phẩm"
        description="Quản lý điện thoại, thông số và các phiên bản đang mở bán."
        action={
          <Link className="button button-primary" to="/admin/products/new">
            <Icon name="add" />
            Thêm sản phẩm
          </Link>
        }
      />
      <section className="card panel">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <form
            className="search-field flex-1 min-w-[200px]"
            onSubmit={(e) => {
              e.preventDefault();
              update('keyword', keyword);
            }}
          >
            <Icon name="search" />
            <input
              placeholder="Tìm tên sản phẩm…"
              aria-label="Tìm sản phẩm quản trị"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="sr-only">
              Tìm kiếm
            </button>
          </form>
          <select
            className="!w-auto"
            aria-label="Trạng thái sản phẩm"
            value={params.get('status') || ''}
            onChange={(e) => update('status', e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang mở bán</option>
            <option value="INACTIVE">Hết hàng</option>
          </select>
        </div>
        {products.isPending ? (
          <Skeleton count={1} />
        ) : products.error ? (
          <ErrorState
            error={products.error}
            retry={() => {
              void products.refetch();
            }}
          />
        ) : !products.data?.items.length ? (
          <EmptyState title="Chưa có sản phẩm phù hợp" />
        ) : (
          <>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Thương hiệu</th>
                    <th>Giá khởi điểm</th>
                    <th>Biến thể</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.data.items.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <ProductImage
                            className="product-thumbnail"
                            src={p.images[0]}
                            alt={p.name}
                          />
                          <strong className="whitespace-nowrap">{p.name}</strong>
                        </div>
                      </td>
                      <td>{p.brandName}</td>
                      <td className="whitespace-nowrap">
                        {productPrice(p) === null ? 'Chưa có giá' : formatVnd(productPrice(p)!)}
                      </td>
                      <td>{p.variants.length}</td>
                      <td>
                        <span
                          className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}
                        >
                          {p.status === 'ACTIVE' ? 'Đang mở bán' : 'Hết hàng'}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <Link
                            className="icon-button"
                            aria-label={`Sửa ${p.name}`}
                            to={`/admin/products/${p.id}/edit`}
                          >
                            <Icon name="edit" className="!text-lg" />
                          </Link>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`${p.status === 'ACTIVE' ? 'Đánh dấu hết hàng' : 'Mở bán'} ${p.name}`}
                            onClick={() => setChanging(p)}
                            disabled={status.isPending || remove.isPending}
                          >
                            <Icon
                              name={p.status === 'ACTIVE' ? 'remove_shopping_cart' : 'shopping_bag'}
                              className="!text-lg"
                            />
                          </button>
                          <button
                            type="button"
                            className="icon-button text-red-600"
                            aria-label={`Xóa vĩnh viễn ${p.name}`}
                            disabled={status.isPending || remove.isPending}
                            onClick={() => {
                              remove.reset();
                              setDeleting(p);
                            }}
                          >
                            <Icon name="delete" className="!text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                {products.data.page} / {products.data.totalPages} · {products.data.totalItems} sản
                phẩm
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
      {changing && (
        <ConfirmDialog
          title={changing.status === 'ACTIVE' ? 'Đánh dấu sản phẩm hết hàng?' : 'Mở bán sản phẩm?'}
          message={
            changing.status === 'ACTIVE'
              ? `${changing.name} sẽ hiển thị Hết hàng và dừng nhận đơn mua.`
              : `${changing.name} sẽ mở bán khi có phiên bản đang mở bán.`
          }
          label={changing.status === 'ACTIVE' ? 'Đánh dấu hết hàng' : 'Mở bán'}
          onConfirm={() => status.mutate()}
          onClose={() => {
            setChanging(null);
            status.reset();
          }}
          busy={status.isPending}
          error={status.error}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Xóa vĩnh viễn sản phẩm?"
          message={`${deleting.name} sẽ bị xóa vĩnh viễn cùng các phiên bản và bị gỡ khỏi giỏ hàng. Thao tác này không thể hoàn tác. Thông tin trong các đơn hàng đã đặt vẫn được giữ lại.`}
          label="Xóa vĩnh viễn"
          onConfirm={() => {
            if (!remove.isPending) remove.mutate(deleting);
          }}
          onClose={() => {
            setDeleting(null);
            remove.reset();
          }}
          busy={remove.isPending}
          error={remove.error}
        />
      )}
    </>
  );
}
