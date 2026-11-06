import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';
import OrderListPage from '../../pages/customer/OrderListPage';
import OrderManagementPage from '../../pages/admin/OrderManagementPage';
import type { Order, User } from '../../shared/types/models';

const clients: QueryClient[] = [];
afterEach(() => clients.splice(0).forEach((client) => client.clear()));

describe('newest order lists', () => {
  it.each(['customer', 'admin'] as const)(
    'renders newest %s orders first without mutating cached results',
    (role) => {
      const user: User = {
        id: 'customer',
        fullName: 'Customer',
        email: 'customer@example.test',
        phone: '0912345678',
        address: 'TP. Hồ Chí Minh',
        role: 'CUSTOMER',
      };
      const order = (id: string, createdAt: string): Order => ({
        id,
        createdAt,
        userId: user.id,
        customerName: user.fullName,
        status: 'PENDING',
        items: [],
        shipping: { fullName: user.fullName, phone: user.phone, address: user.address, note: '' },
        total: 0,
        paymentMethod: 'COD',
        history: [{ status: 'PENDING', at: createdAt }],
      });
      const orders = [
        order('Z-old', '2026-10-01T08:00:00+07:00'),
        order('A-new', '2026-11-05T01:00:00Z'),
        order('B-new', '2026-11-05T08:00:00+07:00'),
        order('Z-precision-old', '2026-11-06T10:00:00.000001Z'),
        order('A-precision-new', '2026-11-06T10:00:00.000999Z'),
      ];
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      clients.push(client);
      client.setQueryData(['me'], user);
      const key = ['orders', role === 'customer' ? user.id : 'admin'];
      client.setQueryData(key, orders);
      const html = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <AuthProvider>
              {role === 'customer' ? <OrderListPage /> : <OrderManagementPage />}
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>,
      );
      expect(html.indexOf('B-new')).toBeLessThan(html.indexOf('A-new'));
      expect(html.indexOf('A-new')).toBeLessThan(html.indexOf('Z-old'));
      expect(html.indexOf('A-precision-new')).toBeLessThan(html.indexOf('Z-precision-old'));
      expect(html.indexOf('Z-precision-old')).toBeLessThan(html.indexOf('B-new'));
      expect(client.getQueryData<Order[]>(key)?.map((item) => item.id)).toEqual([
        'Z-old',
        'A-new',
        'B-new',
        'Z-precision-old',
        'A-precision-new',
      ]);
    },
  );
});
