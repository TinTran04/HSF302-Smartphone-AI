import type { ReactNode } from 'react';
import { formatVnd } from '../../shared/utils/format';
import { Icon } from '../../shared/components/Icon';
export function CartSummary({
  total,
  count,
  children,
}: {
  total: number;
  count: number;
  children?: ReactNode;
}) {
  return (
    <aside className="card panel summary">
      <h2 className="!text-xl mb-5">Tóm tắt đơn hàng</h2>
      <div className="summary-line">
        <span className="muted">Tạm tính ({count} sản phẩm)</span>
        <strong>{formatVnd(total)}</strong>
      </div>
      <div className="summary-line">
        <span className="muted">Phương thức</span>
        <span>COD</span>
      </div>
      <div className="summary-line summary-total">
        <span>Tổng tạm tính</span>
        <strong>{formatVnd(total)}</strong>
      </div>
      <p className="help-text mb-5">
        Tổng thanh toán được máy chủ kiểm tra lại trước khi xác nhận đơn hàng.
      </p>
      {children}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs muted">
        <Icon name="verified_user" className="text-green-600 !text-lg" />
        Thanh toán khi nhận hàng
      </div>
    </aside>
  );
}
