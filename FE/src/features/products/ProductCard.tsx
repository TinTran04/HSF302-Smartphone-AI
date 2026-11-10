import { Link } from 'react-router-dom';
import type { Product } from '../../shared/types/models';
import { ProductImage } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatVnd, productPrice } from '../../shared/utils/format';
import { useComparison } from '../comparison/ComparisonProvider';
import { isProductAvailable } from './availability';
import './Storefront.css';
export function ProductCard({ product }: { product: Product }) {
  const comparison = useComparison();
  const selected = comparison.products.some((p) => p.id === product.id);
  const price = productPrice(product);
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
        <Link className="button button-primary" to={`/products/${product.id}`}>
          Xem chi tiết
        </Link>
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
    </article>
  );
}
