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

  it('lists Gemini, Groq and DeepSeek as switchable chat platforms', () => {
    const blank = (provider: string) => ({ id: '', provider, model: '', maskedKey: '', maskedBackupKey: '', active: false, tested: false, backupKeys: [] });
    const html = renderWithSettings(['ai-settings'], [blank('GEMINI'), blank('GROQ'), blank('DEEPSEEK')], <AiSettingsPage />);
    expect(html).toContain('Cấu hình nền tảng Chat AI');
    expect(html).toContain('Google Gemini');
    expect(html).toContain('Groq');
    expect(html).toContain('DeepSeek');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toContain('Cấu hình chi tiết — Google Gemini');
  });

  it('opens the active platform form with its own default model and hides Gemini quota tools', () => {
    const html = renderWithSettings(
      ['ai-settings'],
      [
        { id: '', provider: 'GEMINI', model: '', maskedKey: '', maskedBackupKey: '', active: false, tested: false, backupKeys: [] },
        { id: '7', provider: 'GROQ', model: 'llama-3.3-70b-versatile', maskedKey: 'masked', maskedBackupKey: '', active: true, tested: true, activeModel: 'llama-3.3-70b-versatile', backupKeys: [] },
        { id: '', provider: 'DEEPSEEK', model: '', maskedKey: '', maskedBackupKey: '', active: false, tested: false, backupKeys: [] },
      ],
      <AiSettingsPage />,
    );
    expect(html).toContain('Cấu hình chi tiết — Groq');
    expect(html).toContain('value="llama-3.3-70b-versatile"');
    expect(html).toContain('Đang hoạt động: llama-3.3-70b-versatile');
    expect(html).not.toContain('Quota Gemini theo project');
  });

  it('turns the chat model into a dropdown of the top free models and keeps the saved model selectable', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(['ai-settings'], [
      { id: '', provider: 'GEMINI', model: '', maskedKey: '', maskedBackupKey: '', active: false, tested: false, backupKeys: [] },
      { id: '7', provider: 'GROQ', model: 'qwen/qwen3-32b', maskedKey: 'masked', maskedBackupKey: '', active: true, tested: true, activeModel: 'qwen/qwen3-32b', backupKeys: [] },
      { id: '', provider: 'DEEPSEEK', model: '', maskedKey: '', maskedBackupKey: '', active: false, tested: false, backupKeys: [] },
    ]);
    client.setQueryData(['ai-models', 'GROQ', '7', 0], {
      provider: 'GROQ',
      source: 'LIVE',
      note: 'Hạn mức đọc trực tiếp từ tài khoản Groq.',
      fetchedAt: '2026-11-12T00:00:00Z',
      models: [
        { id: 'llama-3.1-8b-instant', displayName: 'llama-3.1-8b-instant', requestsPerDay: 14400, tokensPerMinute: 6000 },
        { id: 'llama-3.3-70b-versatile', displayName: 'llama-3.3-70b-versatile', requestsPerDay: 1000, tokensPerMinute: 12000 },
      ],
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AiSettingsPage />
        </ToastProvider>
      </QueryClientProvider>,
    );
    expect(html).toMatch(/<select[^>]*required/);
    expect(html).not.toContain('placeholder="Nhập mã model Groq');
    expect(html).toContain('1. llama-3.1-8b-instant — 14.400 lượt/ngày · 6.000 token/phút');
    expect(html).toContain('2. llama-3.3-70b-versatile — 1.000 lượt/ngày · 12.000 token/phút');
    expect(html).toMatch(/<option value="qwen\/qwen3-32b" selected="">qwen\/qwen3-32b \(đang lưu\)<\/option>/);
    expect(html).toContain('Top 2 model có hạn mức miễn phí lớn nhất.');
    expect(html).toContain('Tải danh sách model');
  });

  it('labels estimated Gemini limits and DeepSeek models without a free tier', async () => {
    const { modelOptionLabel } = await import('./AiSettingsPage');
    expect(modelOptionLabel({ id: 'gemini-3.6-flash-lite', displayName: '', requestsPerDay: 1000, tokensPerMinute: 250000 }, 'ESTIMATE', 1))
      .toBe('1. gemini-3.6-flash-lite — ~1.000 lượt/ngày · 250.000 token/phút (ước tính)');
    expect(modelOptionLabel({ id: 'deepseek-chat', displayName: '', requestsPerDay: null, tokensPerMinute: null }, 'NONE', 2))
      .toBe('2. deepseek-chat');
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
