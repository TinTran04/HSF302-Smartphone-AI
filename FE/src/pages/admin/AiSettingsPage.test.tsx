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
  it('opens the saved Gemini chat configuration and offers the save, test and activate workflow', () => {
    const html = renderWithSettings(['ai-settings'], [
      { provider: 'GEMINI', model: 'gemini-2.5-flash', maskedKey: 'masked-key', maskedBackupKey: '', active: false, tested: false },
    ], <AiSettingsPage />);
    expect(html).toContain('Google Gemini');
    expect(html).toContain('value="gemini-2.5-flash"');
    expect(html).toContain('Lưu cấu hình');
    expect(html).toContain('Kiểm tra kết nối');
    expect(html).toContain('Kích hoạt');
    expect(html).not.toContain('OpenAI');
  });

  it('opens the saved Gemini embedding model and dimensions', () => {
    const html = renderWithSettings(['admin-ops', 'embedding'],
      { provider: 'GEMINI', model: 'gemini-embedding-001', dimensions: 768, maskedKey: 'masked-key' },
      <AdminOperationsPage section="embedding" />);
    expect(html).toContain('Google Gemini');
    expect(html).toContain('value="gemini-embedding-001"');
    expect(html).toContain('value="768"');
    expect(html).toContain('value="masked-key"');
    expect(html).not.toContain('OPENAI');
  });

  it('opens a blank Gemini embedding configuration when only a legacy provider is returned', () => {
    const html = renderWithSettings(['admin-ops', 'embedding'],
      { provider: 'OPENAI', model: 'legacy-embedding-model', dimensions: 1536, maskedKey: 'legacy-key', reindexRequired: true },
      <AdminOperationsPage section="embedding" />);
    expect(html).toContain('Google Gemini');
    expect(html).not.toContain('legacy-embedding-model');
    expect(html).not.toContain('legacy-key');
    expect(html).not.toContain('OPENAI');
    expect(html).toContain('Một số tài liệu cần được lập chỉ mục lại.');
  });
});
