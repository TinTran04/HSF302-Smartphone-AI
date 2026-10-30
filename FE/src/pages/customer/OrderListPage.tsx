import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { useAuth } from '../../features/auth/AuthProvider';
import { OrderStatus } from '../../features/orders/OrderStatus';
import { EmptyState, ErrorState, PageHeading, Skeleton } from '../../shared/components/Ui';
import { formatDate, formatVnd, orderLabels } from '../../shared/utils/format';
export default function OrderListPage() {
  const { user } = useAuth();
  const orders = useQuery({ queryKey: ['orders', user?.id], queryFn: () => api.orders() });
  const [status, setStatus] = useState('');
  const filtered = orders.data?.filter((o) => !status || o.status === status);
  return (
    <>
      <PageHeading
        title="Đơn hàng của tôi"
        description="Theo dõi trạng thái và xem lại các đơn hàng đã đặt."
      />
      <select
        aria-label="Lọc trạng thái đơn hàng"
        className="!w-auto mb-6"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Tất cả trạng thái</option>
        {Object.entries(orderLabels).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      {orders.isPending ? (
        <Skeleton count={1} />
      ) : orders.error ? (
        <ErrorState
          error={orders.error}
          retry={() => {
            void orders.refetch();
          }}
        />
      ) : !filtered?.length ? (
        <EmptyState
          icon="receipt_long"
          title="Chưa có đơn hàng phù hợp"
          action={
            <Link className="button button-primary" to="/products">
              Khám phá điện thoại
            </Link>
          }
        />
      ) : (
        <div className="card table-scroll">
          <table className="text-sm">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link className="text-link" to={`/orders/${o.id}`}>
                      {o.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td className="whitespace-nowrap">{formatVnd(o.total)}</td>
                  <td>
                    <OrderStatus status={o.status} />
                  </td>
                  <td>
                    <Link className="text-link whitespace-nowrap" to={`/orders/${o.id}`}>
                      Xem đơn
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
