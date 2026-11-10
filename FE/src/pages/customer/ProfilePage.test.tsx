import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/AuthProvider';
import { ToastProvider } from '../../shared/components/Ui';
import ProfilePage from './ProfilePage';

vi.mock('../../features/auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../../shared/api', () => ({ api: { updateProfile: vi.fn() }, isDemo: true }));

const client = new QueryClient();

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    user: {
      id: 'customer',
      fullName: 'Customer Name',
      email: 'customer@example.test',
      phone: '0900000000',
      address: 'Customer address',
      role: 'CUSTOMER',
    },
    loading: false,
    error: null,
    retry: vi.fn(),
    setUser: vi.fn(),
    logout: vi.fn(),
  });
});

afterEach(() => client.clear());

function renderProfile() {
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <ProfilePage />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('profile editing', () => {
  it.each(['CUSTOMER', 'ADMIN'] as const)(
    'disables every profile field until a %s starts editing',
    (role) => {
      const auth = useAuth();
      vi.mocked(useAuth).mockReturnValue({ ...auth, user: { ...auth.user!, role } });

      const html = renderProfile();
      const inputs = html.match(/<input\b[^>]*>/g) ?? [];

      expect(inputs).toHaveLength(role === 'CUSTOMER' ? 4 : 3);
      for (const input of inputs) expect(input).toContain('disabled=""');
      const phone = inputs.find((input) => input.includes('type="tel"'))!;
      expect(phone.includes('required=""')).toBe(role === 'CUSTOMER');
      expect(html).toContain('profile-form');
      expect(html).toContain('Chỉnh sửa thông tin');
      expect(html).not.toContain('Lưu thay đổi');
      if (role === 'ADMIN') {
        expect(html).not.toContain('Địa chỉ mặc định');
        expect(html).not.toContain('địa chỉ nhận hàng');
        expect(html).not.toContain('Chọn vị trí trên bản đồ');
        expect(html).not.toContain('Vị trí hiện tại');
      } else {
        expect(html).toContain('Địa chỉ mặc định');
      }
    },
  );
});
