import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ProductCard } from './ProductCard';
import { ComparisonProvider } from '../comparison/ComparisonProvider';
import { AuthProvider } from '../auth/AuthProvider';
import { CartProvider } from '../cart/CartProvider';
import { ToastProvider } from '../../shared/components/Ui';
import { mockBrands, mockProducts } from '../../mocks/products';
import ProductDetailPage from '../../pages/storefront/ProductDetailPage';
import ProductManagementPage from '../../pages/admin/ProductManagementPage';
import ProductFormPage from '../../pages/admin/ProductFormPage';
import type { Product } from '../../shared/types/models';

const clients: QueryClient[] = [];
afterEach(() => clients.splice(0).forEach((client) => client.clear()));

function renderProduct(product: Product, path: string, element: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  client.setQueryData(['me'], null);
  client.setQueryData(['product', false, product.id], product);
  client.setQueryData(['product', true, product.id], product);
  client.setQueryData(['products', true, ''], {
    items: [product],
    page: 1,
    size: 6,
    totalItems: 1,
    totalPages: 1,
  });
  client.setQueryData(['brands', true], mockBrands);
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ComparisonProvider>
                <Routes>
                  <Route path="/products/:id" element={element} />
                  <Route path="/admin/products" element={element} />
                  <Route path="/admin/products/:id/edit" element={element} />
                </Routes>
              </ComparisonProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('sold-out product presentation', () => {
  it('keeps an active product selectable and requests its variant before adding', () => {
    const product = structuredClone(mockProducts[0]);
    const html = renderProduct(product, `/products/${product.id}`, <ProductDetailPage />);
    expect(html).toContain('Thêm vào giỏ hàng');
    expect(html).toContain('Vui lòng chọn đầy đủ màu sắc và dung lượng.');
    expect(html).not.toContain('Hết hàng');
    const storageOption = (html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? [])
      .find((button) => button.includes(`>${product.variants[0].storage}</button>`));
    expect(storageOption).toBeDefined();
    expect(storageOption).not.toContain('disabled=""');
  });

  it.each(['product', 'variants'] as const)(
    'labels sold-out %s cards and keeps their details link',
    (unavailable) => {
      const product = structuredClone(mockProducts[0]);
      if (unavailable === 'product') product.status = 'INACTIVE';
      else
        product.variants.forEach((variant) => {
          variant.status = 'INACTIVE';
        });
      const html = renderProduct(
        product,
        `/products/${product.id}`,
        <ProductCard product={product} />,
      );
      expect(html).toContain('Hết hàng');
      expect(html).toContain(`href="/products/${product.id}"`);
      expect(html).toContain(`Thêm ${product.name} vào so sánh`);
    },
  );

  it.each(['product', 'variants'] as const)(
    'disables buying sold-out %s on the detail page',
    (unavailable) => {
      const product = structuredClone(mockProducts[0]);
      if (unavailable === 'product') product.status = 'INACTIVE';
      else
        product.variants.forEach((variant) => {
          variant.status = 'INACTIVE';
        });
      const html = renderProduct(product, `/products/${product.id}`, <ProductDetailPage />);
      const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? [];
      expect(
        buttons.some((button) => button.includes('Hết hàng') && button.includes('disabled=""')),
      ).toBe(true);
      expect(html).toContain('badge-error');
      expect(html).not.toContain('Vui lòng chọn đầy đủ màu sắc và dung lượng.');
      expect(html).toContain('Thông số kỹ thuật');
      expect(html).toContain('Thêm so sánh');
    },
  );

  it('lets administrators mark products sold out and reopen sales', () => {
    const product = { ...structuredClone(mockProducts[0]), status: 'INACTIVE' as const };
    const html = renderProduct(product, '/admin/products', <ProductManagementPage />);
    expect(html).toContain('<option value="INACTIVE">Hết hàng</option>');
    expect(html).toContain(`aria-label="Mở bán ${product.name}"`);
    expect(html).not.toContain('Tạm ẩn');
  });

  it('labels both product and variant availability in the edit form', () => {
    const product = { ...structuredClone(mockProducts[0]), status: 'INACTIVE' as const };
    product.variants[0].status = 'INACTIVE';
    const html = renderProduct(product, `/admin/products/${product.id}/edit`, <ProductFormPage />);
    expect(html.match(/>Hết hàng<\/option>/g)).toHaveLength(product.variants.length + 1);
    expect(html.match(/>Đang mở bán<\/option>/g)).toHaveLength(product.variants.length + 1);
    expect(html).not.toContain('Tạm ẩn');
  });
});
