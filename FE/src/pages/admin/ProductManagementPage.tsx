import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProducts } from '../../features/products/useProducts';
import { api } from '../../shared/api';
import type { Product } from '../../shared/types/models';
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
export default function ProductManagementPage() {
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('keyword') || '');
  const [changing, setChanging] = useState<Product | null>(null);
  const client = useQueryClient();
  const { notify } = useToast();
  const products = useProducts(params, true);
  const status = useMutation({
    mutationFn: () =>
      api.productStatus(changing!.id, changing!.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['products'] });
      void client.invalidateQueries({ queryKey: ['product'] });
      void client.invalidateQueries({ queryKey: ['admin-dashboard'] });
      void client.invalidateQueries({ queryKey: ['cart'] });
      setChanging(null);
      notify('Đã cập nhật trạng thái sản phẩm.');
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
            <option value="INACTIVE">Tạm ẩn</option>
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
                        <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : ''}`}>
                          {p.status === 'ACTIVE' ? 'Đang mở bán' : 'Tạm ẩn'}
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
                            className="icon-button"
                            aria-label={`${p.status === 'ACTIVE' ? 'Ẩn' : 'Mở bán'} ${p.name}`}
                            onClick={() => setChanging(p)}
                          >
                            <Icon
                              name={p.status === 'ACTIVE' ? 'visibility_off' : 'visibility'}
                              className="!text-lg"
                            />
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
          title={changing.status === 'ACTIVE' ? 'Tạm ẩn sản phẩm?' : 'Mở bán sản phẩm?'}
          message={`Xác nhận thay đổi trạng thái ${changing.name}.`}
          onConfirm={() => status.mutate()}
          onClose={() => {
            setChanging(null);
            status.reset();
          }}
          busy={status.isPending}
          error={status.error}
        />
      )}
    </>
  );
}
