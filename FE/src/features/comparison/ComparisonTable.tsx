import { Link } from 'react-router-dom';
import type { Product } from '../../shared/types/models';
import { formatVnd, productPrice } from '../../shared/utils/format';
import { ProductImage } from '../../shared/components/Ui';
export function ComparisonTable({
  products,
  differencesOnly = false,
}: {
  products: Product[];
  differencesOnly?: boolean;
}) {
  const specs = [...new Set(products.flatMap((p) => Object.keys(p.specifications)))];
  return (
    <div className="comparison-scroll">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Thông số sản phẩm</th>
            {products.map((p) => (
              <th key={p.id}>
                <ProductImage src={p.images[0]} alt={p.name} />
                <Link
                  to={`/products/${p.id}`}
                  className="text-link !text-sm !normal-case !tracking-normal"
                >
                  {p.name}
                </Link>
                <p className="text-primary text-base mt-3 normal-case tracking-normal">
                  {productPrice(p) !== null ? `Từ ${formatVnd(productPrice(p)!)}` : 'Chưa có giá'}
                </p>
                <p className="help-text !normal-case !tracking-normal mt-2">
                  Giá theo phiên bản khả dụng
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specs
            .filter(
              (key) =>
                !differencesOnly || new Set(products.map((p) => p.specifications[key])).size > 1,
            )
            .map((key) => (
              <tr key={key}>
                <td>{key}</td>
                {products.map((p) => (
                  <td key={p.id}>{p.specifications[key] ?? 'Đang cập nhật'}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
