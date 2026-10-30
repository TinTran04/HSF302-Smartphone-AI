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
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { errorMessage, formatVnd } from '../../shared/utils/format';
export default function CartPage() {
  const cart = useCart();
  const { notify } = useToast();
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<unknown>();
  const [excluded, setExcluded] = useState<string[]>([]);
  const selected = cart.cart?.items.filter(i => !excluded.includes(i.variantId)) ?? [];
  const selectedTotal = selected.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  async function change(id: string, quantity: number) {
    try {
      await cart.update(id, quantity);
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  }
  async function remove() {
    try {
      await cart.remove(removing!);
      setRemoving(null);
      setError(undefined);
      notify('Đã xóa sản phẩm khỏi giỏ hàng.');
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
              Một số phiên bản không còn khả dụng. Vui lòng xóa để tiếp tục.
              {cart.cart.unavailableVariantIds.map((id) => (
                <div className="mt-3" key={id}>
                  <span className="text-xs mr-4">{id}</span>
                  <Button variant="danger" disabled={cart.pending} onClick={() => setRemoving(id)}>
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}
          {!cart.cart?.items.length ? (
            <EmptyState
              title="Giỏ hàng của bạn đang trống"
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
                    <article className="card cart-item" key={i.variantId}>
                      <label><input type="checkbox" aria-label={`Chọn ${i.product.name}`} checked={!excluded.includes(i.variantId)} onChange={(e) => setExcluded(current => e.target.checked ? current.filter(id => id !== i.variantId) : [...current, i.variantId])} /></label>
                      <Link to={`/products/${i.product.id}`}>
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
                      </div>
                      <div className="text-right">
                        <strong className="text-primary block mb-3 text-base">
                          {formatVnd(i.variant.price * i.quantity)}
                        </strong>
                        <button
                          className="text-xs muted inline-flex items-center gap-1"
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
    </div>
  );
}
