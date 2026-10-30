import { Link, useLocation } from 'react-router-dom';
import { useComparison } from './ComparisonProvider';
import { Icon } from '../../shared/components/Icon';
export function CompareTray() {
  const { products, toggle, clear } = useComparison();
  const { pathname } = useLocation();
  if (!products.length || pathname === '/compare' || pathname.startsWith('/ai')) return null;
  return (
    <aside className="compare-tray" aria-label="Điện thoại đang chọn so sánh">
      <p>So sánh ({products.length}/3)</p>
      {products.map((p) => (
        <span key={p.id} className="badge">
          {p.name}
          <button aria-label={`Bỏ ${p.name}`} onClick={() => toggle(p)}>
            <Icon name="close" className="!text-sm" />
          </button>
        </span>
      ))}
      <Link className="button button-primary" to="/compare">
        So sánh ngay
      </Link>
      <button className="icon-button" onClick={clear} aria-label="Xóa danh sách so sánh">
        <Icon name="close" />
      </button>
    </aside>
  );
}
