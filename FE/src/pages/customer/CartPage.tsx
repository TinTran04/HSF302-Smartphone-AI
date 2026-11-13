import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../features/cart/CartProvider';
import { CartSummary } from '../../features/cart/CartSummary';
import {
  Breadcrumb,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeading,
  ProductImage,
  Skeleton,
  Modal,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatVnd } from '../../shared/utils/format';
import type { CartItem, UnavailableCartItem } from '../../shared/types/models';
export default function CartPage() {
  const cart = useCart();
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<unknown>();
  const [excluded, setExcluded] = useState<string[]>([]);
  const [changing, setChanging] = useState<CartItem | UnavailableCartItem | null>(null);
  const [targetVariantId, setTargetVariantId] = useState('');
  const selected = cart.cart?.items.filter(i => !excluded.includes(i.variantId)) ?? [];
  const selectedTotal = selected.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  const changeVariants = changing?.product?.status === 'ACTIVE'
    ? changing.product.variants.filter((variant) => variant.status === 'ACTIVE')
    : [];
  const targetVariant = changeVariants.find((variant) => variant.id === targetVariantId);
  function openVariantPicker(item: CartItem | UnavailableCartItem) {
    const options = item.product?.status === 'ACTIVE'
      ? item.product.variants.filter((variant) => variant.status === 'ACTIVE')
      : [];
    setChanging(item);
    setTargetVariantId(options.find((variant) => variant.id !== item.variantId)?.id ?? options[0]?.id ?? '');
  }
  async function applyVariantChange() {
    if (!changing || !targetVariant || targetVariant.id === changing.variantId) return;
    try {
      await cart.changeVariant(changing.variantId, targetVariant.id);
      setChanging(null);
      setTargetVariantId('');
      setExcluded((current) => current.filter((id) => id !== changing.variantId));
    } catch {
      // CartProvider reports the failure through a toast and leaves the cart unchanged.
    }
  }
  async function change(id: string, quantity: number) {
    try {
      await cart.update(id, quantity);
    } catch {
      /* The mutation notification reports the failure. Keep the existing quantity. */
    }
  }
  async function remove() {
    try {
      await cart.remove(removing!);
      setRemoving(null);
      setError(undefined);
    } catch (e) {
      setError(e);
    }
  }
  return (
    <div className="container page">
      <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />
      <PageHeading title="Giỏ hàng của bạn" description={`${cart.count} sản phẩm đang chờ bạn.`} />
      {cart.loading ? (
        <Skeleton count={2} />
      ) : cart.error ? (
        <ErrorState error={cart.error} retry={cart.retry} />
      ) : (
        <>
          {!!cart.cart?.unavailableVariantIds.length && (
            <div className="notice mb-6">
              Một số phiên bản đã ngừng bán và không thể đặt hàng.
              {cart.cart.unavailableItems.map(({ variantId: id, product, variant, quantity }) => (
                <div className="mt-3" key={id}>
                  <div className="flex items-center gap-3 mb-3">
                    {product && <ProductImage src={variant?.image || product.images[0]} alt={product.name} className="cart-item-image" />}
                    <div><strong>{product?.name || 'Sản phẩm không còn tồn tại'}</strong>
                      <p>{variant ? variant.color + ' · ' + variant.storage : 'Mã phiên bản: ' + id} · Số lượng {quantity}</p>
                      <span className="badge badge-error">Hết hàng</span></div>
                  </div>
                  {product && product.variants.some((option) => option.status === 'ACTIVE') && (
                    <Button variant="secondary" disabled={cart.pending} onClick={() => openVariantPicker({ variantId: id, quantity, product, variant })}>
                      Chọn loại khác
                    </Button>
                  )}
                  <Button variant="danger" disabled={cart.pending} onClick={() => setRemoving(id)}>
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}
          {!cart.cart?.items.length ? (
            <EmptyState
              title={cart.cart?.unavailableItems.length ? 'Không có sản phẩm có thể đặt' : 'Giỏ hàng của bạn đang trống'}
              description="Khám phá bộ sưu tập và tìm chiếc điện thoại phù hợp với bạn."
              icon="shopping_bag"
              action={
                <Link className="button button-primary" to="/products">
                  Khám phá điện thoại
                </Link>
              }
            />
          ) : (
            <div className="split-layout">
              <section>
                <div className="space-y-4">
                  {cart.cart.items.map((i) => (
                    <article className="card cart-item cart-item-layout" key={i.variantId}>
                      <label><input type="checkbox" aria-label={`Chọn ${i.product.name}`} checked={!excluded.includes(i.variantId)} onChange={(e) => setExcluded(current => e.target.checked ? current.filter(id => id !== i.variantId) : [...current, i.variantId])} /></label>
                      <Link className="cart-item-product-link" to={`/products/${i.product.id}`}>
                        <ProductImage
                          src={i.variant.image || i.product.images[0]}
                          alt={i.product.name}
                          className="cart-item-image"
                        />
                      </Link>
                      <div className="cart-item-info">
                        <Link to={`/products/${i.product.id}`}>
                          <h3>{i.product.name}</h3>
                        </Link>
                        <p>
                          {i.variant.color} · {i.variant.storage}
                        </p>
                        <div className="cart-item-controls">
                          <div className="quantity">
                            <button
                              disabled={i.quantity <= 1 || cart.pending}
                              onClick={() => change(i.variantId, i.quantity - 1)}
                              aria-label={`Giảm số lượng ${i.product.name}`}
                            >
                              <Icon name="remove" />
                            </button>
                            <span aria-live="polite">{i.quantity}</span>
                            <button
                              disabled={cart.pending}
                              onClick={() => change(i.variantId, i.quantity + 1)}
                              aria-label={`Tăng số lượng ${i.product.name}`}
                            >
                              <Icon name="add" />
                            </button>
                          </div>
                          {i.product.variants.some((variant) => variant.status === 'ACTIVE' && variant.id !== i.variantId) && (
                            <Button variant="secondary" className="cart-item-variant-button" disabled={cart.pending} onClick={() => openVariantPicker(i)}>
                              Chọn màu / dung lượng
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="cart-item-price-actions">
                        <strong className="text-primary block text-base">
                          {formatVnd(i.variant.price * i.quantity)}
                        </strong>
                        <button
                          className="cart-item-remove text-xs muted inline-flex items-center gap-1"
                          onClick={() => setRemoving(i.variantId)}
                          disabled={cart.pending}
                        >
                          <Icon name="delete" className="!text-base" />
                          Xóa
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="notice mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="!text-base">Cần tư vấn thêm trước khi chốt đơn?</h3>
                    <p className="mt-2 text-xs">
                      Cùng AI kiểm tra lựa chọn phù hợp với nhu cầu của bạn.
                    </p>
                  </div>
                  <Link to="/ai" className="button button-secondary !text-secondary">
                    <Icon name="auto_awesome" />
                    Hỏi trợ lý AI
                  </Link>
                </div>
              </section>
              <CartSummary total={selectedTotal} count={selected.reduce((sum, item) => sum + item.quantity, 0)}>
                {!selected.length ? (
                  <Button disabled className="w-full">
                    Chọn sản phẩm để đặt hàng
                  </Button>
                ) : (
                  <Link className="button button-primary w-full" to="/checkout" state={{ variantIds: selected.map(i => i.variantId) }} onClick={() => sessionStorage.setItem('smartphone-ai-checkout-items', JSON.stringify(selected.map(i => i.variantId)))}>
                    Tiến hành đặt hàng
                    <Icon name="arrow_forward" />
                  </Link>
                )}
                <Link to="/products" className="block text-link text-xs text-center mt-4">
                  Tiếp tục mua sắm
                </Link>
              </CartSummary>
            </div>
          )}
        </>
      )}
      {removing && (
        <ConfirmDialog
          title="Xóa sản phẩm?"
          message="Sản phẩm sẽ được bỏ khỏi giỏ hàng của bạn."
          label="Xóa sản phẩm"
          onConfirm={remove}
          onClose={() => {
            setRemoving(null);
            setError(undefined);
          }}
          busy={cart.pending}
          error={error}
        />
      )}
      {changing && (
        <Modal
          title={`Chọn loại khác — ${changing.product?.name ?? 'sản phẩm'}`}
          onClose={() => setChanging(null)}
          busy={cart.pending}
        >
          {changeVariants.length ? (
            <>
              <label className="form-field">
                Màu sắc · dung lượng
                <select
                  value={targetVariantId}
                  onChange={(event) => setTargetVariantId(event.target.value)}
                >
                  {changeVariants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.color} · {variant.storage} — {formatVnd(variant.price)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="muted mt-3 text-sm">Số lượng hiện tại được giữ nguyên. Nếu loại đã chọn có sẵn trong giỏ, số lượng sẽ được gộp.</p>
              <div className="modal-actions">
                <Button variant="secondary" disabled={cart.pending} onClick={() => setChanging(null)}>Hủy</Button>
                <Button busy={cart.pending} disabled={!targetVariant || targetVariant.id === changing.variantId} onClick={() => void applyVariantChange()}>
                  Áp dụng loại này
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="muted">Sản phẩm hiện không còn phiên bản nào đang mở bán.</p>
              <div className="modal-actions">
                <Button variant="secondary" onClick={() => setChanging(null)}>Đóng</Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
