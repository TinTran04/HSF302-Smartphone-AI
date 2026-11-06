import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useId, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { CartProvider } from '../features/cart/CartProvider';
import { ComparisonProvider } from '../features/comparison/ComparisonProvider';
import { ToastProvider } from '../shared/components/Ui';
import { ApiError } from '../shared/api/httpClient';
import type { Role, User } from '../shared/types/models';
import { StoreLayout, subscribeToMaintenance } from './StoreLayout';

vi.mock('../features/auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../shared/api')>()),
  isDemo: false,
}));

const user: User = {
  id: 'account',
  fullName: 'Test Account',
  email: 'account@example.test',
  phone: '0900000000',
  address: '',
  role: 'CUSTOMER',
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

function render(path: string, content: ReactNode = <h1>Requested page content</h1>) {
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <CartProvider>
            <ComparisonProvider>
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route path="*" element={content} />
                </Route>
              </Routes>
            </ComparisonProvider>
          </CartProvider>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => session(null));
afterEach(() => client.clear());

describe('Store maintenance gate', () => {
  it.each(['/', '/products/phone', '/cart', '/checkout', '/orders', '/ai/conversations/old'])(
    'replaces the shop at %s with retry and Admin access during maintenance',
    (path) => {
      client.setQueryData(['maintenance'], { enabled: true });
      const html = render(path);

      expect(html).toContain('Shop đang bảo trì');
      expect(html).toContain('Thử lại');
      expect(html).toContain('href="/login"');
      expect(html).not.toContain('Requested page content');
      expect(html).not.toContain('class="store-header"');
      expect(html).not.toContain('class="store-footer"');
      expect(html).not.toContain('href="/products"');
      expect(html).not.toContain('href="/compare"');
    },
  );

  it('withholds shop content until its maintenance status is known', () => {
    const html = render('/products');

    expect(html).not.toContain('Requested page content');
    expect(html).not.toContain('class="store-header"');
    expect(html).toContain('Đang kiểm tra cửa hàng');
    expect(html).toContain('href="/login"');
  });

  it('restores the requested shop page when maintenance is disabled', () => {
    client.setQueryData(['maintenance'], { enabled: true });
    expect(render('/products')).not.toContain('Requested page content');

    client.setQueryData(['maintenance'], { enabled: false });
    const html = render('/products');

    expect(html).toContain('Requested page content');
    expect(html).toContain('class="store-header"');
    expect(html).not.toContain('Shop đang bảo trì');
  });

  it.each([
    '/login',
    '/register',
    '/forgot-password',
    '/accept-invitation',
    '/admin/invite',
    '/account/invite',
  ])('keeps the auth page %s reachable without shop navigation during maintenance', (path) => {
    client.setQueryData(['maintenance'], { enabled: true });
    const html = render(path);

    expect(html).toContain('Requested page content');
    expect(html).not.toContain('Shop đang bảo trì');
    expect(html).not.toContain('class="store-header"');
    expect(html).not.toContain('class="store-footer"');
  });

  it('allows auth while the account and maintenance requests are pending', () => {
    session(null, true);
    expect(render('/login')).toContain('Requested page content');
  });

  it('keeps auth field identity stable while account and maintenance requests settle', () => {
    function AuthField() {
      const id = useId();
      return <input id={id} aria-label="Email" defaultValue="draft@example.test" />;
    }
    const fieldId = () => render('/login', <AuthField />).match(/<input id="([^"]+)"/)?.[1];
    session(null, true);
    const pendingId = fieldId();
    expect(pendingId).toBeDefined();

    session(null);
    expect(fieldId()).toBe(pendingId);
    client.setQueryData(['maintenance'], { enabled: true });
    expect(fieldId()).toBe(pendingId);
    client.setQueryData(['maintenance'], { enabled: false });
    expect(fieldId()).toBe(pendingId);
  });

  it('continues to withhold the shop from an Admin during maintenance', () => {
    session('ADMIN');
    client.setQueryData(['maintenance'], { enabled: true });
    const html = render('/products');

    expect(html).not.toContain('Requested page content');
    expect(html).not.toContain('Shop đang bảo trì');
  });
});

describe('Maintenance cache recovery', () => {
  it('refreshes an active failed cart when maintenance ends', async () => {
    client.setQueryData(['maintenance'], { enabled: true });
    client
      .getQueryCache()
      .build(client, { queryKey: ['cart', 'guest'] })
      .setState({
        status: 'error',
        error: new ApiError(503, 'Cửa hàng đang bảo trì.', 'MAINTENANCE_MODE'),
      });
    const observer = new QueryObserver(client, {
      queryKey: ['cart', 'guest'],
      queryFn: async () => ({ items: [] }),
      retryOnMount: false,
    });
    const unsubscribeCart = observer.subscribe(() => {});
    const unsubscribe = subscribeToMaintenance(client);

    try {
      client.setQueryData(['maintenance'], { enabled: false });

      await vi.waitFor(() => {
        expect(client.getQueryData(['cart', 'guest'])).toEqual({ items: [] });
      });
    } finally {
      unsubscribe();
      unsubscribeCart();
    }
  });

  it('invalidates failed shop data while preserving healthy, auth and Admin data', () => {
    client.setQueryData(['maintenance'], { enabled: true });
    const failedShopKeys = [
      ['products', false, ''],
      ['product', false, 'phone'],
      ['brands', false],
      ['cart', 'guest'],
      ['conversations', 'guest'],
      ['conversation', 'guest', 'old'],
      ['orders', 'customer'],
      ['order', false, 'customer', 'order'],
    ];
    const excludedKeys = [
      ['me'],
      ['products', true, ''],
      ['product', true, 'phone'],
      ['brands', true],
      ['orders', 'admin'],
      ['order', true, 'admin', 'order'],
      ['admin-dashboard'],
      ['admin-accounts'],
      ['admin-ops', 'maintenance'],
      ['knowledge'],
      ['ai-settings'],
    ];
    for (const queryKey of [...failedShopKeys, ...excludedKeys]) {
      client
        .getQueryCache()
        .build(client, { queryKey })
        .setState({
          status: 'error',
          error: new ApiError(503, 'Cửa hàng đang bảo trì.', 'MAINTENANCE_MODE'),
        });
    }
    client.setQueryData(['products', false, 'healthy'], { items: [] });
    const unsubscribe = subscribeToMaintenance(client);

    try {
      client.setQueryData(['maintenance'], { enabled: false });

      for (const key of failedShopKeys) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
      for (const key of excludedKeys) expect(client.getQueryState(key)?.isInvalidated).toBe(false);
      expect(client.getQueryState(['products', false, 'healthy'])?.isInvalidated).toBe(false);
      expect(client.getQueryState(['maintenance'])?.isInvalidated).toBe(false);
    } finally {
      unsubscribe();
    }
  });

  it('leaves failed shop data untouched on an initial disabled status', () => {
    client
      .getQueryCache()
      .build(client, { queryKey: ['cart', 'guest'] })
      .setState({
        status: 'error',
        error: new ApiError(503, 'Cửa hàng đang bảo trì.', 'MAINTENANCE_MODE'),
      });
    const unsubscribe = subscribeToMaintenance(client);

    try {
      client.setQueryData(['maintenance'], { enabled: false });

      expect(client.getQueryState(['cart', 'guest'])?.isInvalidated).toBe(false);
    } finally {
      unsubscribe();
    }
  });

  it('enters maintenance when a shop query loses a race with the status poll', async () => {
    client.setQueryData(['maintenance'], { enabled: false });
    const unsubscribe = subscribeToMaintenance(client);
    const error = new ApiError(503, 'Cửa hàng đang bảo trì.', 'MAINTENANCE_MODE');

    try {
      await expect(
        client.fetchQuery({
          queryKey: ['products', false, ''],
          queryFn: async () => {
            throw error;
          },
        }),
      ).rejects.toBe(error);

      expect(client.getQueryData(['maintenance'])).toEqual({ enabled: true });
    } finally {
      unsubscribe();
    }
  });

  it('enters maintenance when a business mutation is rejected during a race', async () => {
    client.setQueryData(['maintenance'], { enabled: false });
    const unsubscribe = subscribeToMaintenance(client);
    const error = new ApiError(503, 'Cửa hàng đang bảo trì.', 'MAINTENANCE_MODE');

    try {
      const mutation = client.getMutationCache().build(client, {
        mutationFn: async () => {
          throw error;
        },
      });
      await expect(mutation.execute(undefined)).rejects.toBe(error);

      expect(client.getQueryData(['maintenance'])).toEqual({ enabled: true });
    } finally {
      unsubscribe();
    }
  });

  it('stops bridging query errors after the layout unsubscribes', async () => {
    client.setQueryData(['maintenance'], { enabled: false });
    const unsubscribe = subscribeToMaintenance(client);
    unsubscribe();
    const error = new ApiError(503, 'Cửa hàng đang bảo trì.', 'MAINTENANCE_MODE');

    await expect(
      client.fetchQuery({
        queryKey: ['products', false, ''],
        queryFn: async () => {
          throw error;
        },
      }),
    ).rejects.toBe(error);

    expect(client.getQueryData(['maintenance'])).toEqual({ enabled: false });
  });
});
