import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductFormPage from './ProductFormPage';
import ProductManagementPage, { productParamsAfterDelete } from './ProductManagementPage';
import { mockBrands, mockProducts } from '../../mocks/products';

vi.mock('../../shared/api', () => ({ api: {}, isDemo: false }));

const clients: QueryClient[] = [];
afterEach(() => clients.splice(0).forEach((client) => client.clear()));

function renderAdminPage(editing: boolean) {
  const product = structuredClone(mockProducts[0]);
  product.variants[0].image = '/api/product-images/variant.png';
  const client = new QueryClient();
  clients.push(client);
  client.setQueryData(['product', true, product.id], product);
  client.setQueryData(['brands', true], mockBrands);
  client.setQueryData(['products', true, ''], {
    items: [product],
    page: 1,
    size: 6,
    totalItems: 1,
    totalPages: 1,
  });
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter
        initialEntries={[editing ? `/admin/products/${product.id}/edit` : '/admin/products']}
      >
        <Routes>
          <Route path="/admin/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/admin/products" element={<ProductManagementPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('admin product media and deletion controls', () => {
  it('returns to the previous page with every filter when its only product is deleted', () => {
    const params = new URLSearchParams(
      'keyword=Phone&status=ACTIVE&brandId=apple&sort=name%2Casc&page=2',
    );
    const next = productParamsAfterDelete(
      params,
      { page: 2, items: [mockProducts[0]] },
      mockProducts[0].id,
    );
    expect([...next.entries()]).toEqual([
      ['keyword', 'Phone'],
      ['status', 'ACTIVE'],
      ['brandId', 'apple'],
      ['sort', 'name,asc'],
      ['page', '1'],
    ]);
    expect(params.get('page')).toBe('2');
  });

  it('stays on the page when other products remain or the deleted product is from another result', () => {
    const params = new URLSearchParams('status=ACTIVE&page=3');
    expect(
      productParamsAfterDelete(
        params,
        { page: 3, items: mockProducts.slice(0, 2) },
        mockProducts[0].id,
      ).get('page'),
    ).toBe('3');
    expect(
      productParamsAfterDelete(
        params,
        { page: 3, items: [mockProducts[0]] },
        'another-product',
      ).get('page'),
    ).toBe('3');
    expect(
      productParamsAfterDelete(
        new URLSearchParams('page=1'),
        { page: 1, items: [mockProducts[0]] },
        mockProducts[0].id,
      ).get('page'),
    ).toBe('1');
  });

  it('replaces gallery URLs with file selection and offers an image for every variant', () => {
    const html = renderAdminPage(true);
    expect(html.match(/type="file"/g)).toHaveLength(mockProducts[0].variants.length + 1);
    expect(html).toContain('src="/api/product-images/variant.png"');
    expect(html).not.toContain('Đường dẫn hình ảnh');
    expect(html).not.toContain('URL ảnh');
  });

  it('offers a separate permanent delete action alongside editing and availability', () => {
    const html = renderAdminPage(false);
    expect(html).toContain(`aria-label="Xóa vĩnh viễn ${mockProducts[0].name}"`);
    expect(html).toContain(`aria-label="Sửa ${mockProducts[0].name}"`);
    expect(html).toContain(`aria-label="Đánh dấu hết hàng ${mockProducts[0].name}"`);
  });
});
