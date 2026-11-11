import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import AiSettingsPage from './AiSettingsPage';
import AdminOperationsPage from './AdminOperationsPage';
import { ToastProvider } from '../../shared/components/Ui';

vi.mock('../../shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/api')>()),
  isDemo: false,
}));

function renderWithSettings(key: string[], settings: unknown, content: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(key, settings);
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <ToastProvider>{content}</ToastProvider>
    </QueryClientProvider>,
  );
}

describe('Gemini administration settings', () => {
  it('suggests Gemini 3.6 Flash for the first chat configuration', () => {
    const html = renderWithSettings(['ai-settings'], [{ provider: 'GEMINI', model: '', maskedKey: '', maskedBackupKey: '', active: false, tested: false }], <AiSettingsPage />);
    expect(html).toContain('value="gemini-3.6-flash"');
  });
  it('shows operational metrics since backend startup', async () => {
    const { AiMetrics } = await import('./AiSettingsPage');
    const html = renderWithSettings(['ai-metrics'], { requests: 12, failures: 2, averageMillis: 350 }, <AiMetrics />);
    expect(html).toContain('12');
    expect(html).toContain('350 ms');
    expect(html).toContain('khởi động');
  });
  it('opens the saved Gemini chat configuration and offers the save, test and activate workflow', () => {
    const html = renderWithSettings(
      ['ai-settings'],
      [
        {
          provider: 'GEMINI',
          model: 'gemini-2.5-flash',
          maskedKey: 'masked-key',
          maskedBackupKey: '',
          active: false,
          tested: false,
        },
      ],
      <AiSettingsPage />,
    );
    expect(html).toContain('Google Gemini');
    expect(html).toContain('value="gemini-2.5-flash"');
    expect(html).toContain('Lưu cấu hình');
    expect(html).toContain('Kiểm tra kết nối');
    expect(html).toContain('Kích hoạt');
    expect(html).not.toContain('OpenAI');
  });

  it('renders named backups with count, priority and individual actions', () => {
    const html = renderWithSettings(
      ['ai-settings'],
      [
        {
          id: 'config-1',
          provider: 'GEMINI',
          model: 'gemini-2.5-flash',
          maskedKey: 'masked-key',
          maskedBackupKey: '',
          active: false,
          tested: false,
          backupKeys: [
            {
              id: 'backup-1',
              name: 'Project A',
              maskedKey: 'masked-a',
              priority: 0,
              lastStatus: 'KEY_ERROR',
              lastFailureReason: 'AI_PROVIDER_RATE_LIMIT',
              lastCheckedAt: '2026-11-09T12:00:00Z',
            },
          ],
        },
      ],
      <AiSettingsPage />,
    );
    expect(html).toContain('Key dự phòng (1/10)');
    expect(html).toContain('Project A');
    expect(html).toContain('Kiểm tra Project A');
    expect(html).toContain('Thay Project A');
    expect(html).toContain('Xóa Project A');
    expect(html).toContain('Tăng ưu tiên Project A');
    expect(html).not.toContain('API Key dự phòng mới');
  });

  it('opens the saved Gemini embedding model and dimensions', () => {
    const html = renderWithSettings(
      ['admin-ops', 'embedding'],
      {
        provider: 'GEMINI',
        model: 'gemini-embedding-001',
        dimensions: 768,
        maskedKey: 'masked-key',
      },
      <AdminOperationsPage section="embedding" />,
    );
    expect(html).toContain('Google Gemini');
    expect(html).toContain('value="gemini-embedding-001"');
    expect(html).toContain('value="768"');
    expect(html).toContain('value="masked-key"');
    const fields = html.match(/<input\b[^>]*>/g) ?? [];
    expect(fields.find((field) => field.includes('value="gemini-embedding-001"'))).toContain('readOnly=""');
    expect(fields.find((field) => field.includes('value="768"'))).toContain('readOnly=""');
    expect(html).not.toContain('OPENAI');
  });

  it('presets embedding model and dimensions before the first save', () => {
    const html = renderWithSettings(['admin-ops', 'embedding'], { configured: false },
      <AdminOperationsPage section="embedding" />);
    expect(html).toContain('value="gemini-embedding-001"');
    expect(html).toContain('value="768"');
    expect(html).toContain('Kiểm tra và lưu');
  });

  it('opens a blank Gemini embedding configuration when only a legacy provider is returned', () => {
    const html = renderWithSettings(
      ['admin-ops', 'embedding'],
      {
        provider: 'OPENAI',
        model: 'legacy-embedding-model',
        dimensions: 1536,
        maskedKey: 'legacy-key',
        reindexRequired: true,
      },
      <AdminOperationsPage section="embedding" />,
    );
    expect(html).toContain('Google Gemini');
    expect(html).not.toContain('legacy-embedding-model');
    expect(html).not.toContain('legacy-key');
    expect(html).not.toContain('OPENAI');
    expect(html).toContain('Một số tài liệu cần được lập chỉ mục lại.');
  });
});
