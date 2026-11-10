import { Link } from 'react-router-dom';
import type { Product } from '../../../shared/types/models';
import { formatVnd, productPrice } from '../../../shared/utils/format';
import { ProductImage } from '../../../shared/components/Ui';
import { Icon } from '../../../shared/components/Icon';
import { isProductAvailable } from '../../products/availability';
import { ComparisonTable } from '../../comparison/ComparisonTable';
import { compactSpec, keySpecs } from '../utils/answerFormat';

function summary(product: Product) {
  return ['Chip xử lý', 'RAM', 'Pin']
    .map((key) => compactSpec(product.specifications[key], 1))
    .filter(Boolean)
    .join(' · ');
}

/** One compact row per phone: picture, name, three key specs and price. */
export function ChatProductList({ products }: { products: Product[] }) {
  return (
    <ul className="chat-products" aria-label="Điện thoại được gợi ý">
      {products.map((product) => {
        const price = productPrice(product);
        return (
          <li key={product.id}>
            <Link to={`/products/${product.id}`} className="chat-product">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                className="chat-product-image"
              />
              <span className="chat-product-info">
                <span className="chat-product-name">{product.name}</span>
                <span className="chat-product-specs">{summary(product)}</span>
              </span>
              <span className="chat-product-price">
                {price !== null ? formatVnd(price) : 'Chưa có giá'}
                {!isProductAvailable(product) && <span className="chat-product-out">Hết hàng</span>}
              </span>
              <Icon name="chevron_right" className="chat-product-go" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ChatComparison({ products, open }: { products: Product[]; open: boolean }) {
  const compact = products.map((product) => ({
    ...product,
    specifications: Object.fromEntries(
      keySpecs
        .filter((key) => product.specifications[key] !== undefined)
        .map((key) => [key, compactSpec(product.specifications[key])]),
    ),
  }));
  const hasKeySpecs = compact.some((product) => Object.keys(product.specifications).length);
  return (
    <details className="chat-compare" open={open}>
      <summary>
        <Icon name="table_chart" className="!text-base" />
        Bảng so sánh {products.length} máy
        <Icon name="expand_more" className="chat-compare-chevron !text-base" />
      </summary>
      <ComparisonTable products={hasKeySpecs ? compact : products} />
    </details>
  );
}
