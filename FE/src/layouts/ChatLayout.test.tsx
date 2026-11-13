import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import type { Role, Conversation } from '../shared/types/models';
import { ChatLayout } from './ChatLayout';

vi.mock('../features/auth/AuthProvider', () => ({ useAuth: vi.fn() }));

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const conversations: Conversation[] = [
  { id: 'current', title: 'Tư vấn điện thoại', topic: 'PHONE_CONSULTATION', messages: [] },
  { id: 'other', title: 'Hỗ trợ đơn hàng', topic: 'SHOP_SUPPORT', messages: [] },
];

function session(role: Role | null) {
  vi.mocked(useAuth).mockReturnValue({
    user: role
      ? {
          id: 'account',
          fullName: 'Account',
          email: 'account@example.test',
          phone: '0900000000',
          address: '',
          role,
        }
      : null,
    loading: false,
    error: null,
    retry: vi.fn(),
    setUser: vi.fn(),
    logout: vi.fn(),
  });
}

function renderChat() {
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/ai/conversations/current']}>
        <ChatLayout />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  session('CUSTOMER');
  client.setQueryData(['conversations', 'account'], conversations);
});
afterEach(() => client.clear());

describe('conversation history controls', () => {
  it('shows chat topics in the sidebar for quick context switching', () => {
    const html = renderChat();

    expect(html).toContain('Chủ đề trợ lý');
    expect(html).toContain('href="/ai?topic=PHONE_CONSULTATION"');
    expect(html).toContain('href="/ai?topic=SHOP_SUPPORT"');
    expect(html).toContain('Tư vấn mua điện thoại');
    expect(html).toContain('Hỗ trợ cửa hàng');
  });

  it('gives each conversation a separately labelled delete control outside its link', () => {
    const html = renderChat();

    expect(html).toContain('aria-label="Xóa cuộc trò chuyện Tư vấn điện thoại"');
    expect(html).toContain('aria-label="Xóa cuộc trò chuyện Hỗ trợ đơn hàng"');
    expect(html).toContain('href="/ai/conversations/current"');
    for (const link of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? []) {
      expect(link).not.toContain('<button');
    }
  });

  it.each([null, 'ADMIN'] as const)('does not enable history fetching for %s', (role) => {
    session(role);
    renderChat();

    const history = client.getQueryCache().find({
      queryKey: ['conversations', role ? 'account' : 'guest'],
      exact: true,
    });
    expect(history?.options).toMatchObject({ enabled: false });
  });

  it('keeps deletion disabled while a chat operation is pending', async () => {
    const mutation = client.getMutationCache().build(client, {
      mutationKey: ['chat', 'account', 'current', 'send'],
      mutationFn: () => new Promise<void>(() => {}),
    });
    void mutation.execute(undefined);
    await vi.waitFor(() => expect(mutation.state.status).toBe('pending'));

    const html = renderChat();

    expect(html).toMatch(
      /<button[^>]*aria-label="Xóa cuộc trò chuyện Tư vấn điện thoại"[^>]*disabled=""/,
    );
    expect(html).toMatch(
      /<button[^>]*aria-label="Xóa cuộc trò chuyện Hỗ trợ đơn hàng"[^>]*disabled=""/,
    );
  });
});
