import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../shared/components/Ui';
import { AiQuotaSettings, quotaPayload } from './AiQuotaSettings';

vi.mock('../../shared/api', () => ({ isDemo: false }));

const quota = {
  configId: '42',
  model: 'gemini-2.5-flash',
  keys: [
    {
      keyRef: 'primary',
      name: 'Key chính',
      maskedKey: '***1234',
      projectName: 'project-a',
      tpmLimit: 10000,
      estimatedInputTokens: 8100,
    },
    {
      keyRef: 'backup:7',
      name: 'Dự phòng',
      maskedKey: '***5678',
      projectName: null,
      tpmLimit: null,
      estimatedInputTokens: 0,
    },
  ],
};
function render(configId = '42') {
  const client = new QueryClient();
  client.setQueryData(['ai-quota'], quota);
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <AiQuotaSettings configId={configId} />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('Gemini quota settings', () => {
  it('shows masked keys, project fields, live usage and the shared quota estimate explanation', () => {
    const html = render();
    expect(html).toContain('***1234');
    expect(html).toContain('Project ID');
    expect(html).toContain('10000');
    expect(html).toContain('8100');
    expect(html).toContain('80%');
    expect(html).toContain('khi mức sử dụng ước tính đạt 80%');
    expect(html).toContain('maxLength="100"');
    expect(html).toContain('max="1000000000"');
    expect(html).toContain('60 giây');
    expect(html).toContain('dùng chung');
    expect(html).toContain('Lưu quota');
  });
  it('requires saving Gemini keys before quota setup for an unsaved configuration', () => {
    const html = render('');
    expect(html).toContain('Lưu cấu hình Gemini');
    expect(html).not.toContain('Lưu quota');
  });
  it('prevents editing quota for a different saved configuration', () => {
    const html = render('41');
    expect(html).toContain('Cấu hình Gemini đã thay đổi');
    expect(html).not.toContain('Lưu quota');
  });
  it('builds numeric config IDs and clearable metadata without sending masked keys or usage', () => {
    expect(
      quotaPayload('42', [
        { keyRef: 'primary', projectName: ' project-a ', tpmLimit: '10000' },
        { keyRef: 'backup:7', projectName: '', tpmLimit: '' },
      ]),
    ).toEqual({
      configId: 42,
      keys: [
        { keyRef: 'primary', projectName: 'project-a', tpmLimit: 10000 },
        { keyRef: 'backup:7', projectName: null, tpmLimit: null },
      ],
    });
  });
  it.each(['0', '-1', '1.5', 'NaN', '1000000001', '9007199254740992'])(
    'rejects invalid token limits %s',
    (limit) => {
      expect(() =>
        quotaPayload('42', [{ keyRef: 'primary', projectName: 'a', tpmLimit: limit }]),
      ).toThrow();
    },
  );
  it('requires both project ID and limit to enable a project quota', () => {
    expect(() =>
      quotaPayload('42', [{ keyRef: 'primary', projectName: '', tpmLimit: '10000' }]),
    ).toThrow();
    expect(() =>
      quotaPayload('42', [{ keyRef: 'primary', projectName: 'a', tpmLimit: '' }]),
    ).toThrow();
  });
  it('requires the same limit for keys in the same project', () => {
    expect(() =>
      quotaPayload('42', [
        { keyRef: 'primary', projectName: 'a', tpmLimit: '10000' },
        { keyRef: 'backup:7', projectName: 'a', tpmLimit: '20000' },
      ]),
    ).toThrow();
  });
  it('normalizes project IDs case-insensitively before comparing limits', () => {
    expect(
      quotaPayload('42', [{ keyRef: 'primary', projectName: ' Project-A ', tpmLimit: '1000' }])
        .keys[0].projectName,
    ).toBe('project-a');
    expect(() =>
      quotaPayload('42', [
        { keyRef: 'primary', projectName: 'Project-A', tpmLimit: '1000' },
        { keyRef: 'backup:7', projectName: 'project-a', tpmLimit: '2000' },
      ]),
    ).toThrow();
  });
  it.each(['project name', '-project', 'project/a', 'a'.repeat(101)])(
    'rejects unsupported project ID %s',
    (projectName) => {
      expect(() =>
        quotaPayload('42', [{ keyRef: 'primary', projectName, tpmLimit: '1000' }]),
      ).toThrow();
    },
  );
  it('accepts the maximum TPM and project ID length allowed by the backend', () => {
    expect(
      quotaPayload('42', [
        { keyRef: 'primary', projectName: 'a'.repeat(100), tpmLimit: '1000000000' },
      ]).keys[0].tpmLimit,
    ).toBe(1_000_000_000);
  });
});
