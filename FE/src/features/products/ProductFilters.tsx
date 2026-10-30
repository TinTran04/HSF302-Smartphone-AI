import { useBrands } from './useProducts';
import { Button } from '../../shared/components/Ui';
export function ProductFilters({
  params,
  update,
  reset,
}: {
  params: URLSearchParams;
  update: (key: string, value: string) => void;
  reset: () => void;
}) {
  const brands = useBrands();
  return (
    <aside className="card filters">
      <div className="flex items-center justify-between gap-2">
        <h2 className="!text-sm">Bộ lọc tìm kiếm</h2>
        <Button variant="ghost" className="!text-xs !p-0 !min-h-0" onClick={reset}>
          Đặt lại
        </Button>
      </div>
      <div className="filter-content">
        <fieldset className="filter-group">
          <legend>Thương hiệu</legend>
          <label className="check-label">
            <input
              type="radio"
              name="brand"
              checked={!params.get('brandId')}
              onChange={() => update('brandId', '')}
            />
            Tất cả
          </label>
          {brands.data?.map((b) => (
            <label className="check-label" key={b.id}>
              <input
                type="radio"
                name="brand"
                value={b.id}
                checked={params.get('brandId') === b.id}
                onChange={() => update('brandId', b.id)}
              />
              {b.name}
            </label>
          ))}
        </fieldset>
        <fieldset className="filter-group">
          <legend>Khoảng giá</legend>
          <label className="form-field help-text">
            Từ (VNĐ)
            <input
              type="number"
              min="0"
              step="100000"
              aria-label="Giá tối thiểu"
              value={params.get('minPrice') || ''}
              onChange={(e) => update('minPrice', e.target.value)}
            />
          </label>
          <label className="form-field help-text">
            Đến (VNĐ)
            <input
              type="number"
              min={params.get('minPrice') || 0}
              step="100000"
              aria-label="Giá tối đa"
              value={params.get('maxPrice') || ''}
              onChange={(e) => update('maxPrice', e.target.value)}
            />
          </label>
        </fieldset>
        {[
          { name: 'Dung lượng RAM', key: 'ram', values: ['8 GB', '12 GB', '16 GB'] },
          { name: 'Bộ nhớ trong', key: 'storage', values: ['256GB', '512GB', '1TB'] },
        ].map((group) => (
          <fieldset className="filter-group" key={group.key}>
            <legend>{group.name}</legend>
            <select
              aria-label={group.name}
              value={params.get(group.key) || ''}
              onChange={(e) => update(group.key, e.target.value)}
            >
              <option value="">Tất cả</option>
              {group.values.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </fieldset>
        ))}
      </div>
    </aside>
  );
}
