import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import type { AiKeyAlert } from '../../../shared/types/models';
import { AdminAiKeyAlert, reasonMessage, notificationTitle } from './AdminAiKeyAlert';
import { AdminAiNotifications } from './AdminAiNotifications';

vi.mock('../../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../../../shared/api', () => ({ api: { aiKeyAlert: vi.fn(), aiNotifications: vi.fn() } }));

const client = new QueryClient();
beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    user: {
      id: 'admin',
      fullName: 'Admin',
      email: 'admin@example.test',
      phone: '',
      address: '',
      role: 'ADMIN',
    },
    loading: false,
    error: null,
    retry: vi.fn(),
    setUser: vi.fn(),
    logout: vi.fn(),
  });
});
afterEach(() => client.clear());

function renderAlert(alert: AiKeyAlert | null) {
  client.setQueryData(['ai-key-alert', 'admin'], alert);
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminAiKeyAlert />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Admin AI key warning', () => {
  it('describes proactive quota switching in both the alert and notification title', () => {
    const html = renderAlert({
      id: 'quota',
      status: 'USING_BACKUP',
      model: 'gemini-model',
      reason: 'AI_QUOTA_NEAR_LIMIT',
      backupFailureReason: null,
      detectedAt: '2026-11-09T12:00:00Z',
    });
    expect(html).toContain('Chủ động chuyển key theo quota');
    expect(html).toContain('80%');
    expect(reasonMessage('AI_QUOTA_NEAR_LIMIT')).toContain('ước tính');
    expect(notificationTitle('USING_BACKUP', 'AI_QUOTA_NEAR_LIMIT')).toBe(
      'Chủ động chuyển key theo quota',
    );
    expect(notificationTitle('PRIMARY', null)).toBe('API key AI chính đã phục hồi');
    expect(notificationTitle('BACKUP_FAILED', 'AI_PROVIDER_AUTH_ERROR')).toBe(
      'API key AI chính gặp lỗi',
    );
  });
  it.each([
    ['USING_BACKUP', 'Đã dùng key dự phòng'],
    ['BACKUP_FAILED', 'Key dự phòng cũng gặp lỗi'],
    ['MISSING_BACKUP', 'Chưa có key dự phòng'],
  ] as const)('explains %s with the model, reason and update link', (status, message) => {
    const html = renderAlert({
      id: '1',
      status,
      model: 'configured-model',
      reason: 'AI_PROVIDER_AUTH_ERROR',
      backupFailureReason: status === 'BACKUP_FAILED' ? 'AI_PROVIDER_RATE_LIMIT' : null,
      detectedAt: '2026-11-09T12:00:00Z',
    });
    expect(html).toContain(message);
    expect(html).toContain('hết hiệu lực hoặc không có quyền truy cập');
    expect(html).toContain('configured-model');
    expect(html).toContain('Phát hiện lúc');
    expect(html).toContain('href="/admin/ai-settings"');
    if (status === 'BACKUP_FAILED') expect(html).toContain('Đã chạm quota hoặc giới hạn sử dụng.');
  });

  it('renders nothing for a healthy key or a customer', () => {
    expect(renderAlert(null)).toBe('');
    const auth = useAuth();
    vi.mocked(useAuth).mockReturnValue({ ...auth, user: { ...auth.user!, role: 'CUSTOMER' } });
    expect(
      renderAlert({
        id: '1',
        status: 'MISSING_BACKUP',
        model: 'model',
        reason: 'AI_PROVIDER_RATE_LIMIT',
        backupFailureReason: null,
        detectedAt: '2026-11-09T12:00:00Z',
      }),
    ).toBe('');
  });
});

it('shows the persistent AI bell unread count only for administrators', () => {
  client.setQueryData(['ai-notifications', 'admin'], { items: [], unreadCount: 3, latestId: '3' });
  const render = () =>
    renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AdminAiNotifications />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  expect(render()).toContain('Thông báo AI, 3 chưa đọc');
  vi.mocked(useAuth).mockReturnValue({
    ...useAuth(),
    user: { ...useAuth().user!, role: 'CUSTOMER' },
  });
  expect(render()).toBe('');
});
