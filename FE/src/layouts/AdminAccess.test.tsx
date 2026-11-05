import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { CartProvider } from '../features/cart/CartProvider';
import { ComparisonProvider } from '../features/comparison/ComparisonProvider';
import { ToastProvider } from '../shared/components/Ui';
import type { Role, User } from '../shared/types/models';
import { AdminLayout } from './AdminLayout';
import { StoreLayout } from './StoreLayout';

vi.mock('../features/auth/AuthProvider', () => ({ useAuth: vi.fn() }));

const user: User = {
  id: 'account',
  fullName: 'Test Account',
  email: 'account@example.test',
  phone: '0900000000',
  address: '',
  role: 'ADMIN',
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function session(role: Role | null, loading = false) {
  vi.mocked(useAuth).mockReturnValue({
    user: role ? { ...user, role } : null,
    loading,
    error: null,
    retry: vi.fn(),
    setUser: vi.fn(),
    logout: vi.fn(),
  });
}

function render(path: string, admin = false) {
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <CartProvider>
            <ComparisonProvider>
              <Routes>
                <Route element={admin ? <AdminLayout /> : <StoreLayout />}>
                  <Route path="*" element={<h1>Storefront content</h1>} />
                </Route>
              </Routes>
            </ComparisonProvider>
          </CartProvider>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => session('ADMIN'));
afterEach(() => client.clear());

describe('Admin portal separation', () => {
  it.each(['/', '/products', '/products/1', '/compare', '/cart', '/checkout', '/profile', '/orders', '/ai', '/ai/conversations/old', '/login', '/register', '/forgot-password'])(
    'withholds storefront content for an Admin at %s',
    (path) => {
      expect(render(path)).not.toContain('Storefront content');
    },
  );

  it.each(['CUSTOMER', null] as const)('keeps the storefront accessible for %s', (role) => {
    session(role);
    expect(render('/products')).toContain('Storefront content');
  });

  it('waits for the current account before mounting storefront content', () => {
    session(null, true);
    expect(render('/products')).not.toContain('Storefront content');
  });

  it('keeps portal navigation inside the portal and exposes personal settings', () => {
    const html = render('/admin', true);
    expect(html).toContain('href="/admin/profile"');
    expect(html).toContain('href="/admin/products"');
    expect(html).toContain('href="/admin/accounts"');
    expect(html).not.toContain('href="/"');
  });
});
