import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { useAuth } from '../../features/auth/AuthProvider';
import { OrderStatus } from '../../features/orders/OrderStatus';
import {
  Button,
  ConfirmDialog,
  ErrorState,
  PageHeading,
  ProductImage,
  Skeleton,
} from '../../shared/components/Ui';
import { formatDate, formatVnd, orderLabels } from '../../shared/utils/format';
import type { OrderStatus as Status } from '../../shared/types/models';
export default function OrderDetailPage({ admin = false }: { admin?: boolean }) {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const client = useQueryClient();
  const [action, setAction] = useState<Status | null>(null);
  const key = ['order', admin, user?.id, id];
  const order = useQuery({ queryKey: key, queryFn: () => api.order(id!, admin), enabled: !!id });
  const update = useMutation({
    mutationFn: () => (admin ? api.updateOrderStatus(id!, action!) : api.cancelOrder(id!)),
    onSuccess: (data) => {
      client.setQueryData(key, data);
      void client.invalidateQueries({ queryKey: ['orders'] });
      void client.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setAction(null);
    },
  });
  const transitions: Record<Status, Status[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };
  if (order.isPending) return <Skeleton count={2} />;
  if (order.error)
    return (
      <ErrorState
        error={order.error}
        retry={() => {
          void order.refetch();
        }}
      />
    );
  if (!order.data) return null;
  const data = order.data;
  return (
    <>
      <Link className="text-link text-sm" to={admin ? '/admin/orders' : '/orders'}>
        ← Quay lại đơn hàng
      </Link>
      {location.state?.placed && (
        <div className="notice mt-6 !text-green-800 !bg-green-50 !border-green-200" role="status">
          Đặt hàng thành công! Mã đơn của bạn là {data.id}.
        </div>
      )}
      <PageHeading
        title={`Đơn hàng ${data.id}`}
        description={`Đặt lúc ${formatDate(data.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-3 items-center">
            <OrderStatus status={data.status} />
            {admin
              ? transitions[data.status].map((status) => (
                  <Button
                    variant={status === 'CANCELLED' ? 'danger' : 'primary'}
                    key={status}
                    onClick={() => setAction(status)}
                  >
                    {orderLabels[status]}
                  </Button>
                ))
              : data.status === 'PENDING' && (
                  <Button variant="danger" onClick={() => setAction('CANCELLED')}>
                    Hủy đơn hàng
                  </Button>
                )}
          </div>
        }
      />
      <div className="card panel mb-6">
        <h2 className="!text-lg">Lịch sử đơn hàng</h2>
        <div className="timeline">
          {data.history.map((step, i) => (
            <div key={`${step.at}-${i}`} className="timeline-item complete">
              <strong>{orderLabels[step.status]}</strong>
              <p>{formatDate(step.at)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-6">
        <section className="card panel">
          <h2 className="!text-lg mb-4">Sản phẩm đã đặt</h2>
          {data.items.map((i) => (
            <div className="order-item" key={i.variantId}>
              <ProductImage src={i.product.images[0]} alt={i.product.name} />
              <div className="flex-1">
                <h3 className="!text-sm">{i.product.name}</h3>
                <p className="help-text mt-2">
                  {i.variant.storage} · {i.variant.color} · Số lượng {i.quantity}
                </p>
                <p className="help-text mt-1">Đơn giá: {formatVnd(i.variant.price)}</p>
              </div>
              <strong className="text-sm">{formatVnd(i.variant.price * i.quantity)}</strong>
            </div>
          ))}
          <div className="summary-line summary-total">
            <span>Tổng thanh toán</span>
            <strong>{formatVnd(data.total)}</strong>
          </div>
          <span className="badge badge-success">Thanh toán khi nhận hàng (COD)</span>
        </section>
        <section className="card panel self-start">
          <h2 className="!text-lg mb-6">Thông tin nhận hàng</h2>
          <h3 className="!text-base">{data.shipping.fullName}</h3>
          <p className="muted mt-3 text-sm">{data.shipping.phone}</p>
          <p className="muted mt-3 text-sm leading-7">{data.shipping.address}</p>
          {data.shipping.note && <p className="help-text mt-6">Ghi chú: {data.shipping.note}</p>}
        </section>
      </div>
      {action && (
        <ConfirmDialog
          title={action === 'CANCELLED' ? 'Hủy đơn hàng?' : 'Cập nhật trạng thái?'}
          message={`Xác nhận chuyển đơn ${data.id} sang trạng thái “${orderLabels[action]}”. Máy chủ sẽ kiểm tra lại trước khi cập nhật.`}
          label="Xác nhận"
          onConfirm={() => update.mutate()}
          onClose={() => {
            setAction(null);
            update.reset();
          }}
          busy={update.isPending}
          error={update.error}
        />
      )}
    </>
  );
}
