import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, isDemo } from '../../shared/api';
import { useBrands, useProduct } from '../../features/products/useProducts';
import type { Product } from '../../shared/types/models';
import { Button, ErrorState, PageHeading, Skeleton, useToast } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
const blankProduct = (): Product => ({
  id: '',
  name: '',
  brandId: '',
  brandName: '',
  description: '',
  images: [],
  status: 'ACTIVE',
  specifications: {
    'Chip xử lý': '',
    RAM: '',
    'Màn hình': '',
    Camera: '',
    Pin: '',
    'Hệ điều hành': '',
  },
  variants: [
    {
      id: crypto.randomUUID(),
      color: '',
      colorHex: '#cccccc',
      storage: '256GB',
      price: 0,
      status: 'ACTIVE',
    },
  ],
});
export default function ProductFormPage() {
  const { id } = useParams();
  const product = useProduct(id, true);
  if (id && product.isPending) return <Skeleton count={1} />;
  if (id && product.error) return <ErrorState error={product.error} />;
  return <ProductForm key={id || 'new'} initial={product.data || blankProduct()} creating={!id} />;
}
function ProductForm({ initial, creating }: { initial: Product; creating: boolean }) {
  const [product, setProduct] = useState<Product>(structuredClone(initial));
  const [imageText, setImageText] = useState(initial.images.join('\n'));
  const [validation, setValidation] = useState('');
  const brands = useBrands();
  const client = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useToast();
  const save = useMutation({
    mutationFn: () =>
      api.saveProduct(
        {
          ...product,
          id: creating ? product.id.trim() : product.id,
          name: product.name.trim(),
          brandName: brands.data?.find((b) => b.id === product.brandId)?.name || product.brandName,
          images: imageText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          variants: creating ? product.variants : [
            ...product.variants,
            ...initial.variants.filter(old => !product.variants.some(v => v.id === old.id)).map(old => ({ ...old, status: 'INACTIVE' as const })),
          ],
        },
        creating,
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['products'] });
      void client.invalidateQueries({ queryKey: ['product'] });
      void client.invalidateQueries({ queryKey: ['admin-dashboard'] });
      notify('Đã lưu sản phẩm.');
      navigate('/admin/products');
    },
  });
  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setProduct((p) => ({ ...p, [key]: value }));
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (save.isPending) return;
    const variants = product.variants;
    const duplicate =
      new Set(
        variants.map((v) => `${v.color.trim().toLowerCase()}-${v.storage.trim().toLowerCase()}`),
      ).size !== variants.length;
    if (!product.name.trim() || (isDemo && !product.id.trim()))
      return setValidation('Tên và mã sản phẩm không được để trống.');
    if (!variants.length || duplicate)
      return setValidation('Cần ít nhất một phiên bản và không được trùng màu / dung lượng.');
    if (
      variants.some(
        (v) => !v.color.trim() || !v.storage.trim() || !Number.isFinite(v.price) || v.price < 0,
      )
    )
      return setValidation('Vui lòng kiểm tra màu sắc, dung lượng và giá của từng phiên bản.');
    if (
      imageText
        .split('\n')
        .filter((s) => s.trim())
        .some((s) => !/^(https?:\/\/|\/(?!\/))/.test(s.trim()))
    )
      return setValidation('Ảnh phải là URL http(s) hoặc đường dẫn ảnh nội bộ bắt đầu bằng /.');
    setValidation('');
    save.mutate();
  }
  return (
    <>
      <Link className="text-link text-sm" to="/admin/products">
        ← Quay lại sản phẩm
      </Link>
      <PageHeading
        title={creating ? 'Thêm sản phẩm mới' : `Chỉnh sửa ${initial.name}`}
        description="Thông tin sản phẩm, thông số kỹ thuật và các phiên bản."
      />
      <form onSubmit={submit}>
        <div className="card panel mb-6">
          <h2 className="!text-xl mb-6">Thông tin cơ bản</h2>
          <div className="form-grid">
            {(!creating || isDemo) && <label className="form-field">
              Mã sản phẩm
              <input
                required
                pattern="[a-z0-9-]+"
                title="Chữ thường, chữ số và dấu gạch ngang"
                readOnly={!creating}
                value={product.id}
                onChange={(e) => set('id', e.target.value)}
              />
            </label>}
            <label className="form-field">
              Tên sản phẩm
              <input required value={product.name} onChange={(e) => set('name', e.target.value)} />
            </label>
            <label className="form-field">
              Thương hiệu
              <select
                required
                value={product.brandId}
                onChange={(e) => set('brandId', e.target.value)}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.data?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Trạng thái
              <select
                value={product.status}
                onChange={(e) => set('status', e.target.value as Product['status'])}
              >
                <option value="ACTIVE">Đang mở bán</option>
                <option value="INACTIVE">Tạm ẩn</option>
              </select>
            </label>
            <label className="form-field col-span-full">
              Mô tả
              <textarea
                rows={4}
                value={product.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </label>
            <label className="form-field col-span-full">
              Đường dẫn hình ảnh (mỗi dòng một ảnh)
              <textarea rows={3} value={imageText} onChange={(e) => setImageText(e.target.value)} />
              <span className="help-text">
                Dùng ảnh trong /public/images hoặc URL ảnh được phép sử dụng.
              </span>
            </label>
          </div>
          {brands.error && (
            <ErrorState
              error={brands.error}
              retry={() => {
                void brands.refetch();
              }}
            />
          )}
        </div>
        <div className="card panel mb-6">
          <h2 className="!text-xl mb-6">Thông số kỹ thuật</h2>
          <div className="form-grid">
            {Object.entries(product.specifications).map(([key, value]) => (
              <label className="form-field" key={key}>
                {key}
                <input
                  value={value ?? ''}
                  onChange={(e) =>
                    set('specifications', { ...product.specifications, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
        </div>
        <div className="card panel">
          <div className="flex justify-between flex-wrap items-center gap-4 mb-4">
            <h2 className="!text-xl">Phiên bản sản phẩm</h2>
            <Button
              variant="secondary"
              onClick={() =>
                set('variants', [
                  ...product.variants,
                  {
                    id: crypto.randomUUID(),
                    color: '',
                    colorHex: '#cccccc',
                    storage: '',
                    price: 0,
                    status: 'ACTIVE',
                  },
                ])
              }
            >
              <Icon name="add" />
              Thêm phiên bản
            </Button>
          </div>
          {product.variants.map((v, i) => (
            <div className="variant-row" key={v.id}>
              <label className="form-field">
                Màu sắc
                <input
                  required
                  value={v.color}
                  onChange={(e) =>
                    set(
                      'variants',
                      product.variants.map((x, n) =>
                        n === i ? { ...x, color: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="form-field">
                Dung lượng
                <input
                  required
                  placeholder="256GB"
                  value={v.storage}
                  onChange={(e) =>
                    set(
                      'variants',
                      product.variants.map((x, n) =>
                        n === i ? { ...x, storage: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="form-field">
                Giá (VNĐ)
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={v.price}
                  onChange={(e) =>
                    set(
                      'variants',
                      product.variants.map((x, n) =>
                        n === i ? { ...x, price: e.target.valueAsNumber } : x,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="icon-button"
                aria-label={`Xóa phiên bản ${i + 1}`}
                disabled={product.variants.length <= 1}
                onClick={() =>
                  set(
                    'variants',
                    product.variants.filter((_, n) => n !== i),
                  )
                }
              >
                <Icon name="delete" />
              </button>
              <label className="form-field">
                Mã màu
                <input
                  type="color"
                  value={v.colorHex}
                  onChange={(e) =>
                    set(
                      'variants',
                      product.variants.map((x, n) =>
                        n === i ? { ...x, colorHex: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="form-field">
                Trạng thái phiên bản
                <select
                  value={v.status}
                  onChange={(e) =>
                    set(
                      'variants',
                      product.variants.map((x, n) =>
                        n === i ? { ...x, status: e.target.value as Product['status'] } : x,
                      ),
                    )
                  }
                >
                  <option value="ACTIVE">Mở bán</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
              </label>
            </div>
          ))}
        </div>
        {validation && (
          <p className="field-error mt-5" role="alert">
            {validation}
          </p>
        )}
        {save.error && <ErrorState error={save.error} />}
        <div className="flex gap-4 justify-end mt-7">
          <Link className="button button-secondary" to="/admin/products">
            Quay lại
          </Link>
          <Button type="submit" busy={save.isPending}>
            Lưu sản phẩm
          </Button>
        </div>
      </form>
    </>
  );
}
