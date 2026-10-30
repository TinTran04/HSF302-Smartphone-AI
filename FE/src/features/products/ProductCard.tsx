import { Link } from 'react-router-dom';
import type { Product } from '../../shared/types/models';
import { ProductImage } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatVnd, productPrice } from '../../shared/utils/format';
import { useComparison } from '../comparison/ComparisonProvider';
export function ProductCard({ product }: { product: Product }) {
  const comparison = useComparison();
  const selected = comparison.products.some((p) => p.id === product.id);
  const price = productPrice(product);
  return (
    <article className="card product-card">
      <Link
        className="product-image"
        to={`/products/${product.id}`}
        aria-label={`Xem ${product.name}`}
      >
        <ProductImage src={product.images[0]} alt={product.name} />
      </Link>
      <Link to={`/products/${product.id}`}>
        <h3>{product.name}</h3>
      </Link>
      <p className="spec-preview">
        {product.specifications['Chip xử lý']} · {product.specifications.RAM} RAM
        <br />
        {product.specifications['Màn hình']}
      </p>
      <p className="price">{price === null ? 'Chưa có giá' : formatVnd(price)}</p>
      <div className="product-actions">
        <Link className="button button-primary" to={`/products/${product.id}`}>
          Xem chi tiết
        </Link>
        <button
          className={`icon-button ${selected ? 'text-primary bg-blue-50' : ''}`}
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
