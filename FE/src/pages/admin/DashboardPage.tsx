import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { Icon } from '../../shared/components/Icon';
import { ErrorState, PageHeading, Skeleton, EmptyState } from '../../shared/components/Ui';
import { OrderStatus } from '../../features/orders/OrderStatus';
import { formatVnd, formatDate } from '../../shared/utils/format';
export default function DashboardPage() {
  const stats = useQuery({ queryKey: ['admin-dashboard'], queryFn: api.dashboard });
  const orders = useQuery({ queryKey: ['orders', 'admin'], queryFn: () => api.orders(true) });
  return (
    <>
      <PageHeading
        eyebrow="Báo cáo vận hành"
        title="Tổng quan quản trị"
        description="Sản phẩm, đơn hàng COD và kho kiến thức AI."
        action={
          <Link className="button button-primary" to="/admin/products/new">
            <Icon name="add" />
            Thêm sản phẩm mới
          </Link>
        }
      />
      {stats.isPending ? (
        <Skeleton count={4} />
      ) : stats.error ? (
        <ErrorState
          error={stats.error}
          retry={() => {
            void stats.refetch();
          }}
        />
      ) : (
        stats.data && (
          <div className="stats-grid">
            {[
              {
                label: 'Tổng sản phẩm',
                value: stats.data.products,
                icon: 'smartphone',
                note: 'Các sản phẩm trong hệ thống',
              },
              {
                label: 'Tổng đơn hàng',
                value: stats.data.orders,
                icon: 'shopping_bag',
                note: 'Đặt hàng thanh toán COD',
              },
              {
                label: 'Đơn chờ xác nhận',
                value: stats.data.pendingOrders,
                icon: 'schedule',
                note: 'Đơn hàng cần được xử lý',
              },
              {
                label: 'Đơn đã hoàn thành',
                value: stats.data.completedOrders,
                icon: 'check_circle',
                note: 'Trạng thái hoàn thành từ hệ thống',
              },
            ].map((s) => (
              <div className="card stat-card" key={s.label}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">{s.label}</span>
                  <span className="icon-tile !w-9 !h-9">
                    <Icon name={s.icon} />
                  </span>
                </div>
                <strong>{s.value}</strong>
                <p>{s.note}</p>
              </div>
            ))}
          </div>
        )
      )}
      <div className="admin-columns">
        <section className="card panel min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="!text-xl">Đơn hàng COD gần đây</h2>
            <Link className="text-link text-xs" to="/admin/orders">
              Xem tất cả đơn hàng →
            </Link>
          </div>
          {orders.isPending ? (
            <Skeleton count={1} />
          ) : orders.error ? (
            <ErrorState error={orders.error} />
          ) : !orders.data?.length ? (
            <EmptyState
              title="Chưa có đơn hàng"
              description="Đơn hàng mới sẽ xuất hiện tại đây."
              icon="receipt_long"
            />
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.data.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link className="text-link" to={`/admin/orders/${o.id}`}>
                          {o.id}
                        </Link>
                        <p className="help-text mt-2 whitespace-nowrap">
                          {formatDate(o.createdAt)}
                        </p>
                      </td>
                      <td>{o.customerName}</td>
                      <td className="whitespace-nowrap">{formatVnd(o.total)}</td>
                      <td>
                        <OrderStatus status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <aside className="card panel self-start">
          <span className="icon-tile mb-5">
            <Icon name="dataset" />
          </span>
          <h2 className="!text-xl">Kho tri thức AI</h2>
          <p className="muted text-sm my-5">
            Quản lý tài liệu để Backend truy xuất thông tin và cung cấp nguồn tham khảo.
          </p>
          {stats.data && (
            <>
              <div className="summary-line">
                <span>Tài liệu sẵn sàng</span>
                <strong>{stats.data.readyDocuments}</strong>
              </div>
              <div className="summary-line mb-5">
                <span>Đang xử lý</span>
                <strong>{stats.data.processingDocuments}</strong>
              </div>
            </>
          )}
          <Link className="button button-secondary w-full" to="/admin/knowledge">
            Quản lý kho kiến thức
          </Link>
        </aside>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {[
          {
            title: 'Quản lý sản phẩm & biến thể',
            to: '/admin/products',
            icon: 'inventory_2',
            description: 'Cập nhật giá, màu sắc và cấu hình thiết bị.',
          },
          {
            title: 'Cấu hình nhà cung cấp AI',
            to: '/admin/ai-settings',
            icon: 'tune',
            description: 'Quản lý Chat Model và kích hoạt nhà cung cấp.',
          },
        ].map((x) => (
          <Link className="card panel flex items-center gap-5" to={x.to} key={x.to}>
            <span className="icon-tile">
              <Icon name={x.icon} />
            </span>
            <div>
              <h3 className="!text-base">{x.title}</h3>
              <p className="help-text mt-2">{x.description}</p>
            </div>
            <Icon name="arrow_forward" className="ml-auto" />
          </Link>
        ))}
      </div>
    </>
  );
}
