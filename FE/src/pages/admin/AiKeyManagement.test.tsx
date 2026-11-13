import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../shared/components/Ui';
import { AiKeyManagement } from './AiKeyManagement';

describe('API key identity management', () => {
  it.each([
    ['RATE_LIMIT', 'AI_PROVIDER_DAILY_LIMIT', 'Chạm hạn mức ngày'],
    ['RATE_LIMIT', 'AI_PROVIDER_MINUTE_LIMIT', 'Chạm hạn mức phút'],
    ['RATE_LIMIT', 'AI_PROVIDER_RATE_LIMIT', 'Chạm hạn mức · Chưa rõ loại'],
    ['PROVIDER_ERROR', 'AI_PROVIDER_BUSY', 'Nhà cung cấp đang bận'],
  ])('shows provider status %s %s beside a low daily estimate', (status, reason, label) => {
    const client = new QueryClient();
    client.setQueryData(['ai-key-management', 'GEMINI', '42'], {
      configId: '42',
      active: true,
      keys: [
        {
          keyRef: 'PRIMARY',
          identity: 'identity-primary',
          name: 'Primary',
          maskedKey: '••••1234',
          priority: 0,
        },
      ],
    });
    client.setQueryData(['ai-quota', 'GEMINI', '42', 'model-a'], {
      configId: '42',
      model: 'model-a',
      keys: [
        {
          keyRef: 'PRIMARY',
          name: 'Primary',
          estimatedInputTokens: 0,
          tpmLimit: 10000,
          requestsToday: 2,
          dailyRequestLimit: 500,
          status,
          reason,
        },
      ],
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AiKeyManagement
            provider="GEMINI"
            configId="42"
            model="model-a"
            disabled={false}
            mode="keys"
          />
        </ToastProvider>
      </QueryClientProvider>,
    );
    expect(html).toContain(label);
    expect(html).toContain('Ước tính còn 498 / 500 yêu cầu/ngày');
    expect(html.indexOf(label)).toBeLessThan(html.indexOf('Ước tính còn 498'));
  });
  it('does not show another model daily estimate after switching models', () => {
    const client = new QueryClient();
    client.setQueryData(['ai-key-management', 'GEMINI', '42'], {
      configId: '42',
      active: true,
      keys: [
        {
          keyRef: 'PRIMARY',
          identity: 'identity-primary',
          name: 'Primary',
          maskedKey: '••••1234',
          priority: 0,
        },
      ],
    });
    client.setQueryData(['ai-quota', 'GEMINI', '42', 'model-a'], {
      configId: '42',
      model: 'model-a',
      keys: [{ keyRef: 'PRIMARY', requestsToday: 2, dailyRequestLimit: 500 }],
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AiKeyManagement
            provider="GEMINI"
            configId="42"
            model="model-b"
            disabled={false}
            mode="keys"
          />
        </ToastProvider>
      </QueryClientProvider>,
    );
    expect(html).not.toContain('498 / 500');
    expect(html).toContain('Chưa có số liệu');
  });
  it('offers a new primary when the retained configuration has no keys', () => {
    const client = new QueryClient();
    client.setQueryData(['ai-key-management', 'GEMINI', '42'], {
      configId: '42',
      active: false,
      keys: [],
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AiKeyManagement
            provider="GEMINI"
            configId="42"
            model="model-a"
            disabled={false}
            mode="keys"
          />
        </ToastProvider>
      </QueryClientProvider>,
    );
    expect(html).toContain('Thêm key chính');
    expect(html).not.toContain('Thêm key dự phòng');
  });
  it('shows fixed names, current roles, last promotion time and saved switch history', () => {
    const client = new QueryClient();
    client.setQueryData(['ai-quota', 'GEMINI', '42', 'gemini-test'], {
      configId: '42',
      model: 'gemini-test',
      keys: [
        {
          keyRef: 'PRIMARY',
          name: 'Project B',
          maskedKey: '••••BBBB',
          projectName: 'project-b',
          tpmLimit: 10000,
          estimatedInputTokens: 8000,
        },
      ],
    });
    client.setQueryData(['ai-key-management', 'GEMINI', '42'], {
      configId: '42',
      active: true,
      keys: [
        {
          keyRef: 'PRIMARY',
          identity: 'fixed-b-12345678',
          name: 'Project B',
          maskedKey: '••••BBBB',
          priority: 0,
          lastPrimaryAt: '2026-11-12T12:00:00Z',
        },
        {
          keyRef: '12',
          identity: 'fixed-a-12345678',
          name: 'Project A',
          maskedKey: '••••AAAA',
          priority: 1,
          lastPrimaryAt: '2026-11-12T11:00:00Z',
        },
      ],
      history: [
        {
          id: 3,
          fromName: 'Project A',
          fromMaskedKey: '••••AAAA',
          toName: 'Project B',
          toMaskedKey: '••••BBBB',
          actor: 'admin',
          changedAt: '2026-11-12T12:00:00Z',
        },
      ],
    });
    client.setQueryData(['ai-activity', 'GEMINI', 0], {
      total: 1,
      page: 0,
      size: 10,
      items: [
        {
          id: 'SWAP-3',
          type: 'PRIMARY_CHANGED',
          model: 'gemini-test',
          keyName: 'Project B',
          maskedKey: '••••BBBB',
          actor: 'admin',
          createdAt: '2026-11-12T12:00:00Z',
          reason: 'Project A (••••AAAA) → Project B (••••BBBB)',
        },
      ],
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AiKeyManagement provider="GEMINI" configId="42" model="gemini-test" disabled={false} />
        </ToastProvider>
      </QueryClientProvider>,
    );
    expect(html).toContain('Key chính');
    expect(html).toContain('Dự phòng 1');
    expect(html).toContain('Đặt Project A làm key chính');
    expect(html).not.toContain('Đặt Project B làm key chính');
    expect(html).toContain('Project A (••••AAAA) → Project B (••••BBBB)');
    expect(html).toContain('Lần gần nhất đặt làm chính');
    expect(html).toContain('fixed-b-1234');
    expect(html).toContain('Ước tính còn lại/ngày · Chưa xác định');
    expect(html).not.toContain('Đã dùng khoảng 80% giới hạn token mỗi phút');
    expect(html).not.toContain('Số yêu cầu còn lại mỗi ngày là ước tính');
    expect(html).toContain('Xóa Project B');
    expect(html).toContain('Xóa Project A');
  });
});
