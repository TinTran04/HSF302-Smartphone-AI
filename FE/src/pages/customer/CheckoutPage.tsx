import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { ApiError } from '../../shared/api/httpClient';
import { useAuth } from '../../features/auth/AuthProvider';
import { useCart } from '../../features/cart/CartProvider';
import { CartSummary } from '../../features/cart/CartSummary';
import {
  Breadcrumb,
  Button,
  EmptyState,
  ErrorState,
  PageHeading,
  ProductImage,
  Skeleton,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import type { OrderPreview, ShippingInfo } from '../../shared/types/models';
import { formatVnd } from '../../shared/utils/format';
type OrderAttempt = { previewId: string; shipping: ShippingInfo; paymentMethod: 'COD'; key: string; userId: string };
const pendingKey = 'smartphone-ai-pending-order';
function readAttempt(userId?: string): OrderAttempt | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(pendingKey) || 'null');
    return value && value.userId === userId && typeof value.previewId === 'string' && typeof value.key === 'string' && value.shipping ? value : null;
  } catch { return null; }
}
export default function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIds] = useState<string[]>(() => {
    if (Array.isArray(location.state?.variantIds)) return location.state.variantIds;
    try { const saved = JSON.parse(sessionStorage.getItem('smartphone-ai-checkout-items') || 'null'); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  const client = useQueryClient();
  const [savedAttempt] = useState(() => readAttempt(user?.id));
  const attempt = useRef<OrderAttempt | null>(savedAttempt);
  const [uncertain, setUncertain] = useState(!!savedAttempt);
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: savedAttempt?.shipping.fullName ?? user?.fullName ?? '',
    phone: savedAttempt?.shipping.phone ?? user?.phone ?? '',
    address: savedAttempt?.shipping.address ?? user?.address ?? '',
    note: savedAttempt?.shipping.note ?? '',
  });
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [priceChanged, setPriceChanged] = useState(false);
  const key = useRef(savedAttempt?.key ?? crypto.randomUUID());
  const submit = useMutation({
    mutationFn: async () => {
      if (attempt.current) {
        const { key: savedKey, userId: _userId, ...data } = attempt.current;
        return api.placeOrder(data, savedKey);
      }
      const selected = selectedIds.length ? selectedIds : cart.cart?.items.map(i => i.variantId) ?? [];
      const latest = await api.previewOrder(shipping, selected);
      const changed =
        !preview ? latest.priceChanged : latest.total !== preview.total ||
          JSON.stringify(preview.items.map((i) => [i.variantId, i.quantity, i.currentUnitPrice ?? i.variant?.price])) !==
            JSON.stringify(latest.items.map((i) => [i.variantId, i.quantity, i.currentUnitPrice ?? i.variant?.price]));
      setPreview(latest);
      if (!preview || changed) {
        setPriceChanged(!!changed);
        return null;
      }
      const data = { previewId: latest.previewId, shipping, paymentMethod: 'COD' as const };
      attempt.current = { ...data, key: key.current, userId: user!.id };
      sessionStorage.setItem(pendingKey, JSON.stringify(attempt.current));
      return api.placeOrder(data, key.current);
    },
    onSuccess: (order) => {
      if (order) {
        attempt.current = null;
        sessionStorage.removeItem(pendingKey);
        sessionStorage.removeItem('smartphone-ai-checkout-items');
        void client.invalidateQueries({ queryKey: ['cart'] });
        void client.invalidateQueries({ queryKey: ['orders'] });
        navigate(`/orders/${order.id}`, { state: { placed: true }, replace: true });
      }
    },
    onError: (error) => {
      if (attempt.current && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500)) {
        setUncertain(true);
        return;
      }
      attempt.current = null;
      sessionStorage.removeItem(pendingKey);
      setUncertain(false);
      if (error instanceof ApiError && error.code === 'PRICE_CHANGED') {
        setPreview(null);
        setPriceChanged(true);
        key.current = crypto.randomUUID();
      }
    },
  });
  const update = (field: keyof ShippingInfo, value: string) => {
    setShipping((s) => ({ ...s, [field]: value }));
    setPreview(null);
    key.current = crypto.randomUUID();
  };
  return (
    <div className="container page">
      <Breadcrumb items={[{ label: 'Giỏ hàng', to: '/cart' }, { label: 'Đặt hàng COD' }]} />
      <PageHeading
        title="Đặt hàng COD"
        description="Kiểm tra thông tin và thanh toán khi nhận hàng."
      />
      {cart.loading ? (
        <Skeleton count={2} />
      ) : cart.error ? (
        <ErrorState error={cart.error} retry={cart.retry} />
      ) : !cart.cart?.items.length && uncertain ? (
        <div className="card panel"><p>Không nhận được kết quả đặt hàng. Hãy thử lại để kiểm tra đơn đã gửi.</p>{submit.error && <ErrorState error={submit.error} />}<Button className="mt-4" busy={submit.isPending} onClick={() => submit.mutate()}>Thử lại xác nhận</Button></div>
      ) : !cart.cart?.items.length ? (
        <EmptyState
          title="Giỏ hàng đang trống"
          action={
            <Link className="button button-primary" to="/products">
              Khám phá điện thoại
            </Link>
          }
        />
      ) : !uncertain && selectedIds.some(id => cart.cart!.unavailableVariantIds.includes(id) || !cart.cart!.items.some(item => item.variantId === id)) ? (
        <ErrorState
          error={new Error('Có phiên bản không khả dụng. Vui lòng quay lại giỏ hàng để kiểm tra.')}
        />
      ) : (
        <form
          className="split-layout"
          onSubmit={(e) => {
            e.preventDefault();
            if (!submit.isPending) submit.mutate();
          }}
        >
          <section className="space-y-6">
            <div className="card panel">
              <h2 className="!text-xl mb-7">1. Thông tin nhận hàng</h2>
              <div className="form-grid">
                <label className="form-field">
                  Họ tên người nhận
                  <input
                    required
                    autoComplete="name"
                    value={shipping.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    disabled={submit.isPending || uncertain}
                  />
                </label>
                <label className="form-field">
                  Số điện thoại
                  <input
                    type="tel"
                    required
                    pattern="[+0-9][0-9 -]{8,14}"
                    autoComplete="tel"
                    value={shipping.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    disabled={submit.isPending || uncertain}
                  />
                </label>
                <label className="form-field col-span-full">
                  Địa chỉ nhận hàng
                  <textarea
                    required
                    minLength={8}
                    autoComplete="street-address"
                    rows={3}
                    value={shipping.address}
                    onChange={(e) => update('address', e.target.value)}
                    disabled={submit.isPending || uncertain}
                  />
                </label>
                <label className="form-field col-span-full">
                  Ghi chú (tùy chọn)
                  <textarea
                    rows={2}
                    value={shipping.note}
                    onChange={(e) => update('note', e.target.value)}
                    disabled={submit.isPending || uncertain}
                  />
                </label>
              </div>
            </div>
            <div className="card panel">
              <h2 className="!text-xl mb-6">2. Phương thức thanh toán</h2>
              <label className="flex items-start gap-3 p-5 rounded-xl border border-primary bg-blue-50">
                <input type="radio" name="payment" checked readOnly />
                <span>
                  <strong className="text-sm">Thanh toán khi nhận hàng (COD)</strong>
                  <span className="block muted text-xs mt-2">
                    Thanh toán trực tiếp khi nhận đơn hàng.
                  </span>
                </span>
              </label>
            </div>
            <div className="card panel">
              <h2 className="!text-xl mb-4">3. Kiểm tra sản phẩm</h2>
              {(preview?.items || cart.cart.items.filter(i => !selectedIds.length || selectedIds.includes(i.variantId))).map((i) => {
                const original = cart.cart!.items.find(item => item.variantId === i.variantId);
                const product = i.product ?? original?.product;
                const variant = i.variant ?? original?.variant;
                if (!product || !variant) return null;
                const price = 'currentUnitPrice' in i ? i.currentUnitPrice ?? variant.price : variant.price;
                return (
                <div className="order-item" key={i.variantId}>
                  <ProductImage src={product.images[0]} alt={product.name} />
                  <div className="flex-1">
                    <h3 className="!text-sm">{product.name}</h3>
                    <p className="help-text mt-2">
                      {variant.storage} · {variant.color} · SL: {i.quantity}
                    </p>
                    {'priceChanged' in i && i.priceChanged && <p className="field-error">Giá trước: {formatVnd(i.oldUnitPrice ?? 0)} · Giá hiện tại: {formatVnd(price)}</p>}
                  </div>
                  <strong className="text-sm">{formatVnd(price * i.quantity)}</strong>
                </div>
              ); })}
            </div>
          </section>
          <CartSummary total={preview?.total ?? cart.cart.items.filter(i => !selectedIds.length || selectedIds.includes(i.variantId)).reduce((sum, i) => sum + i.variant.price * i.quantity, 0)} count={cart.cart.items.filter(i => !selectedIds.length || selectedIds.includes(i.variantId)).reduce((sum, i) => sum + i.quantity, 0)}>
            {priceChanged && (
              <div className="notice mb-5" role="alert">
                Giá hoặc thông tin đơn đã thay đổi. Hãy kiểm tra tổng tiền mới và xác nhận lại.
              </div>
            )}
            {uncertain && <p className="notice mb-5">Chưa nhận được kết quả. Thử lại sẽ kiểm tra đúng yêu cầu đặt hàng trước đó.</p>}
            {preview && (
              <p className="text-sm text-green-700 mb-5" role="status">
                Đã kiểm tra giá với máy chủ. Vui lòng xác nhận đặt hàng.
              </p>
            )}
            {submit.error && <ErrorState error={submit.error} />}
            <Button type="submit" busy={submit.isPending} className="w-full">
              <Icon name="verified_user" />
              {uncertain ? 'Thử lại xác nhận' : preview ? 'Xác nhận đặt hàng' : 'Kiểm tra đơn hàng'}
            </Button>
            <Link className="block text-link text-xs text-center mt-5" to="/cart">
              Quay lại giỏ hàng
            </Link>
          </CartSummary>
        </form>
      )}
    </div>
  );
}
