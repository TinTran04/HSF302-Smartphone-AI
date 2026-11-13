import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../shared/types/models';
import { Button, Modal, ProductImage } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatVnd, productPrice } from '../../shared/utils/format';
import { useComparison } from '../comparison/ComparisonProvider';
import { useCart } from '../cart/CartProvider';
import { catalogVariants, isProductAvailable } from './availability';
import './Storefront.css';
export function ProductCard({ product }: { product: Product }) {
  const [variantPickerOpen, setVariantPickerOpen] = useState(false);
  const [storage, setStorage] = useState('');
  const [color, setColor] = useState('');
  const comparison = useComparison();
  const cart = useCart();
  const selected = comparison.products.some((p) => p.id === product.id);
  const price = productPrice(product);
  const available = isProductAvailable(product);
  const variants = catalogVariants(product).filter((variant) => variant.status === 'ACTIVE');
  const storages = [...new Set(variants.map((variant) => variant.storage))];
  const colors = [...new Map(
    variants
      .filter((variant) => !storage || variant.storage === storage)
      .map((variant) => [variant.color, variant]),
  ).values()];
  const selectedVariant = variants.find(
    (variant) => variant.storage === storage && variant.color === color,
  );

  function openVariantPicker() {
    const initialStorage = storages.length === 1 ? storages[0] : '';
    const initialColors = variants.filter((variant) => !initialStorage || variant.storage === initialStorage);
    setStorage(initialStorage);
    setColor(initialColors.length === 1 ? initialColors[0].color : '');
    setVariantPickerOpen(true);
  }

  function closeVariantPicker() {
    setVariantPickerOpen(false);
    setStorage('');
    setColor('');
  }

  async function addVariant(variantId: string) {
    if (cart.pending) return;
    try {
      await cart.add({ variantId, quantity: 1 });
      closeVariantPicker();
    } catch {
      // CartProvider reports mutation failures through the app's error handling.
    }
  }

  return (
    <article className="card product-card commerce-product-card">
      <Link
        className="product-image"
        to={`/products/${product.id}`}
        aria-label={`Xem ${product.name}`}
      >
        <ProductImage src={product.images[0]} alt={product.name} />
      </Link>
      <p className="commerce-product-brand">{product.brandName}</p>
      <Link className="commerce-product-title" to={`/products/${product.id}`}>
        <h3>{product.name}</h3>
      </Link>
      {!isProductAvailable(product) && <span className="badge badge-error mt-3">Hết hàng</span>}
      <ul className="commerce-product-specs">
        {['Chip xử lý', 'RAM', 'Màn hình'].map((key) =>
          product.specifications[key] ? (
            <li key={key}>
              <span>{key}</span>
              <span>{product.specifications[key]}</span>
            </li>
          ) : null,
        )}
      </ul>
      <p className="price">
        {price !== null && <span className="commerce-price-label">Giá từ</span>}
        {price === null ? 'Chưa có giá' : formatVnd(price)}
      </p>
      <div className="product-actions">
        <Button
          className="commerce-card-add"
          disabled={!available || cart.pending}
          onClick={() => {
            if (variants.length === 1) void addVariant(variants[0].id);
            else openVariantPicker();
          }}
        >
          <Icon name={available ? 'shopping_bag' : 'remove_shopping_cart'} />
          {available ? 'Thêm vào giỏ' : 'Hết hàng'}
        </Button>
        <button
          type="button"
          className={`icon-button commerce-compare-button ${selected ? 'commerce-compare-selected' : ''}`}
          aria-label={`${selected ? 'Bỏ' : 'Thêm'} ${product.name} ${selected ? 'khỏi' : 'vào'} so sánh`}
          aria-pressed={selected}
          onClick={() => comparison.toggle(product)}
        >
          <Icon name={selected ? 'check' : 'compare_arrows'} />
        </button>
      </div>
      {variantPickerOpen && (
        <Modal
          title={`Chọn phiên bản — ${product.name}`}
          onClose={closeVariantPicker}
          busy={cart.pending}
        >
          <p className="muted mb-5">Chọn dung lượng và màu sắc bạn muốn mua.</p>
          <fieldset className="commerce-picker-group">
            <legend>Dung lượng</legend>
            <div className="variant-options">
              {storages.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`variant-option ${storage === option ? 'selected' : ''}`}
                  aria-pressed={storage === option}
                  onClick={() => {
                    setStorage(option);
                    if (!variants.some((variant) => variant.storage === option && variant.color === color))
                      setColor('');
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="commerce-picker-group">
            <legend>Màu sắc</legend>
            <div className="variant-options">
              {colors.map((option) => (
                <button
                  key={option.color}
                  type="button"
                  className={`variant-option ${color === option.color ? 'selected' : ''}`}
                  aria-pressed={color === option.color}
                  onClick={() => setColor(option.color)}
                >
                  <span className="color-dot" style={{ backgroundColor: option.colorHex }} />
                  {option.color}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="commerce-picker-price" aria-live="polite">
            <span>{selectedVariant ? `${storage} · ${color}` : 'Giá phiên bản đã chọn'}</span>
            <strong>{selectedVariant ? formatVnd(selectedVariant.price) : 'Chọn đủ phiên bản'}</strong>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" disabled={cart.pending} onClick={closeVariantPicker}>
              Hủy
            </Button>
            <Button
              busy={cart.pending}
              disabled={!selectedVariant}
              onClick={() => {
                if (selectedVariant) void addVariant(selectedVariant.id);
              }}
            >
              <Icon name="shopping_bag" /> Thêm vào giỏ
            </Button>
          </div>
        </Modal>
      )}
    </article>
  );
}
