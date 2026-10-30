import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProduct } from '../../features/products/useProducts';
import { useCart } from '../../features/cart/CartProvider';
import { useComparison } from '../../features/comparison/ComparisonProvider';
import {
  Breadcrumb,
  Button,
  ErrorState,
  ProductImage,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { errorMessage, formatVnd, productPrice } from '../../shared/utils/format';
import type { Product } from '../../shared/types/models';
export default function ProductDetailPage() {
  const { id } = useParams();
  const product = useProduct(id);
  return (
    <div className="container page">
      {product.isPending ? (
        <Skeleton count={2} />
      ) : product.error ? (
        <ErrorState
          error={product.error}
          retry={() => {
            void product.refetch();
          }}
        />
      ) : (
        product.data && <ProductDetails key={product.data.id} product={product.data} />
      )}
    </div>
  );
}
function ProductDetails({ product }: { product: Product }) {
  const [storage, setStorage] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(0);
  const [tab, setTab] = useState('specs');
  const cart = useCart();
  const comparison = useComparison();
  const { notify } = useToast();
  const active = product.variants.filter((v) => v.status === 'ACTIVE');
  const variant = active.find((v) => v.storage === storage && v.color === color);
  const lowest = productPrice(product);
  async function add() {
    if (!variant || cart.pending) return;
    try {
      await cart.add({ variantId: variant.id, quantity });
      notify(`Đã thêm ${product.name} (${variant.storage}, ${variant.color}) vào giỏ hàng.`);
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  }
  return (
    <>
      <Breadcrumb items={[{ label: 'Điện thoại', to: '/products' }, { label: product.name }]} />
      <div className="detail-layout">
        <div>
          <div className="gallery-main">
            <ProductImage
              src={variant?.image || product.images[image]}
              alt={`${product.name}${color ? ` màu ${color}` : ''}`}
              eager
            />
          </div>
          <div className="gallery-thumbnails">
            {product.images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                className={image === i ? 'selected' : ''}
                onClick={() => setImage(i)}
                aria-label={`Xem ảnh ${i + 1} của ${product.name}`}
              >
                <ProductImage src={src} alt={`${product.name}, ảnh ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="notice mt-6 flex gap-3">
            <Icon name="verified_user" />
            <span>Thông tin rõ ràng. Thanh toán khi nhận hàng (COD).</span>
          </div>
        </div>
        <div>
          <span className="badge badge-ai">{product.brandName}</span>
          <h1 className="mt-4">{product.name}</h1>
          <p className="muted mt-4 text-sm">
            {product.specifications['Chip xử lý']} · {product.specifications['Màn hình']}
          </p>
          <p className="detail-price">
            {variant ? (
              formatVnd(variant.price)
            ) : lowest !== null ? (
              <>Từ {formatVnd(lowest)}</>
            ) : (
              'Chưa có giá'
            )}
          </p>
          <fieldset className="variant-group">
            <legend>Dung lượng: {storage || 'Chọn dung lượng'}</legend>
            <div className="variant-options">
              {[...new Set(active.map((v) => v.storage))].map((s) => (
                <button
                  key={s}
                  className={`variant-option ${s === storage ? 'selected' : ''}`}
                  aria-pressed={s === storage}
                  onClick={() => {
                    setStorage(s);
                    if (color && !active.some((v) => v.storage === s && v.color === color))
                      setColor('');
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="variant-group">
            <legend>Màu sắc: {color || 'Chọn màu sắc'}</legend>
            <div className="variant-options">
              {[...new Map(active.map((v) => [v.color, v])).values()].map((v) => (
                <button
                  key={v.color}
                  disabled={
                    !!storage && !active.some((x) => x.storage === storage && x.color === v.color)
                  }
                  className={`variant-option ${v.color === color ? 'selected' : ''}`}
                  aria-pressed={v.color === color}
                  onClick={() => setColor(v.color)}
                >
                  <span className="color-dot" style={{ backgroundColor: v.colorHex }} />
                  {v.color}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center gap-5 my-6">
            <span className="text-sm font-medium">Số lượng</span>
            <div className="quantity">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
                aria-label="Giảm số lượng"
              >
                <Icon name="remove" />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Tăng số lượng">
                <Icon name="add" />
              </button>
            </div>
          </div>
          <Button
            className="w-full"
            busy={cart.pending}
            disabled={!variant || product.status !== 'ACTIVE'}
            onClick={add}
          >
            <Icon name="shopping_bag" />
            Thêm vào giỏ hàng
          </Button>
          {!variant && (
            <p className="help-text mt-3">Vui lòng chọn đầy đủ màu sắc và dung lượng.</p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="secondary" onClick={() => comparison.toggle(product)}>
              <Icon name="compare_arrows" />
              {comparison.products.some((p) => p.id === product.id) ? 'Bỏ so sánh' : 'Thêm so sánh'}
            </Button>
            <Link
              className="button button-ghost !text-secondary"
              to={`/ai?topic=PHONE_CONSULTATION&productIds=${product.id}`}
            >
              <Icon name="auto_awesome" />
              Hỏi SmartPhone AI
            </Link>
          </div>
        </div>
      </div>
      <section className="mt-16">
        <div className="tabs" role="tablist" aria-label="Thông tin sản phẩm">
          <button
            id="tab-specs"
            role="tab"
            aria-controls="product-tab-panel"
            aria-selected={tab === 'specs'}
            className={tab === 'specs' ? 'active' : ''}
            onClick={() => setTab('specs')}
          >
            Thông số kỹ thuật
          </button>
          <button
            id="tab-description"
            role="tab"
            aria-controls="product-tab-panel"
            aria-selected={tab === 'description'}
            className={tab === 'description' ? 'active' : ''}
            onClick={() => setTab('description')}
          >
            Giới thiệu sản phẩm
          </button>
        </div>
        <div
          id="product-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className="card panel"
        >
          {tab === 'specs' ? (
            <>
              <h2 className="mb-5">Thông số {product.name}</h2>
              <table className="spec-table">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value ?? 'Đang cập nhật'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <h2 className="mb-5">{product.name}</h2>
              <p className="muted leading-7">{product.description}</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
