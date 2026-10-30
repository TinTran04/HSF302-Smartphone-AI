import type { OrderStatus as Status } from '../../shared/types/models';
import { orderLabels } from '../../shared/utils/format';
export function OrderStatus({ status }: { status: Status }) {
  return (
    <span
      className={`badge badge-${{ PENDING: 'warning', CONFIRMED: 'blue', SHIPPING: 'ai', COMPLETED: 'success', CANCELLED: 'error' }[status]}`}
    >
      {orderLabels[status]}
    </span>
  );
}
