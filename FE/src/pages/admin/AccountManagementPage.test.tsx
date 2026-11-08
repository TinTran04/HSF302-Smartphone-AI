import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/AuthProvider';
import AccountManagementPage from './AccountManagementPage';

vi.mock('../../features/auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../../shared/api', () => ({ isDemo: false }));

const owner = {
  id: 'owner',
  fullName: 'Owner',
  email: 'owner@example.com',
  phone: '',
  address: '',
  role: 'ADMIN' as const,
};
const customer = {
  ...owner,
  id: 'customer',
  email: 'customer@example.com',
  role: 'CUSTOMER' as const,
};

function renderAccount(
  user = customer as typeof owner | typeof customer,
  disabled = false,
  root = false,
  active = true,
) {
  const client = new QueryClient();
  client.setQueryData(
    ['admin-accounts'],
    [
      {
        user,
        active,
        root,
        disabled,
        invitationId: active ? null : 'invite',
        invitationExpiresAt: null,
      },
    ],
  );
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <AccountManagementPage />
    </QueryClientProvider>,
  );
  client.clear();
  return html;
}

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    user: owner,
    loading: false,
    error: null,
    retry: vi.fn(),
    setUser: vi.fn(),
    logout: vi.fn(),
  });
});

describe('account disable controls', () => {
  it('offers disabling an ordinary active customer', () => {
    expect(renderAccount()).toContain('Vô hiệu hóa');
  });

  it('offers re-enabling and identifies the disabled state', () => {
    const html = renderAccount(customer, true);
    expect(html).toContain('Cho hoạt động lại');
    expect(html).toContain('Đã vô hiệu hóa');
  });

  it('keeps pending verification distinct from disabling', () => {
    expect(renderAccount(customer, false, false, false)).toContain('Chờ đặt mật khẩu');
    const disabled = renderAccount(customer, true, false, false);
    expect(disabled).toContain('Đã vô hiệu hóa');
    expect(disabled).toContain('Cho hoạt động lại');
  });

  it('protects the root and the acting Admin', () => {
    for (const root of [true, false]) {
      const html = renderAccount(owner, false, root);
      expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Vô hiệu hóa<\/button>/);
    }
  });
});
