import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import type { Role } from '../../shared/types/models';
import { AssistantWidget } from './AssistantWidget';
import { mascotSkins, skinById } from './skins';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../../shared/api', () => ({ api: {}, isDemo: false }));

const client = new QueryClient();
function render(role: Role | null, path = '/') {
  vi.mocked(useAuth).mockReturnValue({
    user: role
      ? { id: 'account', fullName: 'A', email: 'a@example.test', phone: '', address: '', role }
      : null,
    loading: false,
    error: null,
    retry: vi.fn(),
    setUser: vi.fn(),
    logout: vi.fn(),
  });
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AssistantWidget />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
afterEach(() => vi.clearAllMocks());

describe('floating assistant', () => {
  it('shows a collapsed mascot launcher on storefront pages for guests and customers', () => {
    for (const role of [null, 'CUSTOMER'] as const) {
      const html = render(role, '/products');
      expect(html).toContain('aria-label="Mở trợ lý AI"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('mascot-fallback');
      expect(html).not.toContain('role="dialog"');
    }
  });
  it('stays out of the full chat page and the admin area', () => {
    expect(render('CUSTOMER', '/ai/conversations/1')).toBe('');
    expect(render('ADMIN', '/')).toBe('');
  });
  it('offers distinct skins including the FPT student uniform', () => {
    expect(new Set(mascotSkins.map((skin) => skin.id)).size).toBe(mascotSkins.length);
    const fpt = skinById('fpt-university');
    expect(fpt.name).toBe('FPT University');
    expect(fpt.outfit).toBe('jacket');
    expect(fpt.accessories).toContain('nameTag');
    expect(mascotSkins).toHaveLength(5);
    expect(skinById('unknown').id).toBe(mascotSkins[0].id);
  });
});
