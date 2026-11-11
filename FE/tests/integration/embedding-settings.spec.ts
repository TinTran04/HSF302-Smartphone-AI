import { expect, test } from '@playwright/test';

for (const configured of [false, true]) {
  test(`embedding setup only asks for a key with configured=${configured}`, async ({ page }) => {
    let saved = configured;
    const requests: Record<string, unknown>[] = [];
    const settings = () => ({ configured: saved, provider: 'GEMINI',
      model: configured ? 'existing-embedding-model' : 'gemini-embedding-001',
      dimensions: configured ? 1536 : 768, maskedKey: saved ? '••••••••' : '', reindexRequired: false });
    await page.context().addCookies([{ name: 'XSRF-TOKEN', value: 'embedding-test-token', url: 'http://127.0.0.1:15173' }]);
    await page.route(/^http:\/\/127\.0\.0\.1:15173\/api\//, async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/api/users/me') return route.fulfill({ json: {
        id: 'embedding-admin', fullName: 'Admin', email: 'admin@example.test', role: 'ADMIN', phone: '', address: '',
      } });
      if (path === '/api/auth/csrf') return route.fulfill({ json: { token: 'embedding-test-token' } });
      if (path === '/api/maintenance') return route.fulfill({ json: { enabled: false } });
      if (path === '/api/admin/ai-settings/key-alert') return route.fulfill({ json: { alert: null } });
      if (path === '/api/admin/ai-settings/notifications') return route.fulfill({ json: { items: [], unreadCount: 0, latestId: null } });
      if (path === '/api/admin/embedding-settings') {
        if (route.request().method() === 'PUT') {
          requests.push(route.request().postDataJSON());
          saved = true;
        }
        return route.fulfill({ json: settings() });
      }
      return route.fulfill({ status: 404, json: {} });
    });
    await page.goto('/admin/embedding');
    const model = page.getByLabel('Model', { exact: true });
    await expect(model).toHaveValue(settings().model);
    await expect(model).toHaveAttribute('readonly', '');
    await expect(page.getByLabel('Số chiều', { exact: true })).toHaveValue(String(settings().dimensions));
    await expect(page.getByLabel('Số chiều', { exact: true })).toHaveAttribute('readonly', '');
    await page.getByLabel('API key mới', { exact: true }).fill('embedding-fixture-key');
    await page.getByRole('button', { name: 'Kiểm tra và lưu', exact: true }).click();
    await expect(page.getByText('Đã kiểm tra và lưu cấu hình embedding.', { exact: true })).toBeVisible();
    expect(requests).toEqual([{ provider: 'GEMINI', apiKey: 'embedding-fixture-key' }]);
    await expect(page.getByLabel('API key mới', { exact: true })).toHaveValue('');
    await expect(model).toHaveValue(settings().model);
  });
}
