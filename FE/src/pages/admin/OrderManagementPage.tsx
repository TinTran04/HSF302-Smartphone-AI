import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { OrderStatus } from '../../features/orders/OrderStatus';
import { EmptyState, ErrorState, PageHeading, Skeleton, Button } from '../../shared/components/Ui';
import { formatDate, formatVnd, orderLabels } from '../../shared/utils/format';
export default function OrderManagementPage() {
  const query = useQuery({ queryKey: ['orders', 'admin'], queryFn: () => api.orders(true) });
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const orders = query.data?.filter(
    (o) =>
      (!status || o.status === status) &&
      `${o.id} ${o.customerName}`.toLowerCase().includes(keyword.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Quản lý đơn hàng COD"
        description="Xác nhận đơn và cập nhật trạng thái theo luồng xử lý."
        action={
          <Button
            variant="secondary"
            busy={query.isFetching}
            onClick={() => {
              void query.refetch();
            }}
          >
            Làm mới
          </Button>
        }
      />
      <section className="card panel">
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            className="flex-1 min-w-[200px]"
            aria-label="Tìm đơn hàng"
            placeholder="Tìm mã đơn hoặc khách hàng…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select
            className="!w-auto"
            aria-label="Lọc trạng thái quản trị"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(orderLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {query.isPending ? (
          <Skeleton count={1} />
        ) : query.error ? (
          <ErrorState
            error={query.error}
            retry={() => {
              void query.refetch();
            }}
          />
        ) : !orders?.length ? (
          <EmptyState
            title="Chưa có đơn hàng phù hợp"
            description="Đơn đặt hàng mới sẽ xuất hiện tại đây."
            icon="receipt_long"
          />
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap">
                      <Link className="text-link" to={`/admin/orders/${o.id}`}>
                        {o.id}
                      </Link>
                    </td>
                    <td>
                      <strong>{o.customerName}</strong>
                      <p className="help-text mt-1">{o.shipping.phone}</p>
                    </td>
                    <td className="whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td className="whitespace-nowrap">{formatVnd(o.total)}</td>
                    <td>
                      <OrderStatus status={o.status} />
                    </td>
                    <td>
                      <Link className="text-link whitespace-nowrap" to={`/admin/orders/${o.id}`}>
                        Xem chi tiết →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
