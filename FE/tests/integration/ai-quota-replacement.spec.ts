import { expect, test } from '@playwright/test';

for (const mobile of [false, true]) {
  test(`replacement key and quota save together on ${mobile ? 'mobile' : 'desktop'}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    let settings = {
      id: '1',
      provider: 'GEMINI',
      model: 'test-model',
      maskedKey: '••••OLD1',
      maskedBackupKey: '',
      backupKeys: [],
      active: true,
      tested: true,
    };
    let quota = {
      configId: '1',
      provider: 'GEMINI',
      model: 'test-model',
      keys: [
        {
          keyRef: 'PRIMARY',
          name: 'Key chính',
          maskedKey: '••••OLD1',
          projectName: 'old-project',
          tpmLimit: 10000,
          estimatedInputTokens: 6000,
          limitSource: 'MANUAL',
          status: 'WORKING',
        },
      ],
    };
    let saves = 0;
    await page.route(
      (url) => url.pathname.startsWith('/api/'),
      async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname;
        let response: unknown = {};
        if (path === '/api/users/me')
          response = { id: '1', role: 'ADMIN', fullName: 'Admin', email: 'admin@example.com' };
        else if (path.endsWith('/ai-settings/quota')) {
          expect(url.searchParams.get('provider')).toBe('GEMINI');
          expect(url.searchParams.get('model')).toBe('test-model');
          response = quota;
        } else if (path.endsWith('/key-management/key')) {
          const payload = request.postDataJSON();
          expect(payload).toMatchObject({
            provider: 'GEMINI',
            configId: '1',
            model: 'test-model',
            keyRef: 'PRIMARY',
            name: 'Key chính',
            apiKey: 'test-replacement-key',
            projectName: 'new-project',
            tpmLimit: 20000,
            useDefault: false,
            dailyRequestLimit: null,
            useDefaultDaily: true,
          });
          saves++;
          settings = { ...settings, id: '2', maskedKey: '••••NEW2' };
          quota = {
            ...quota,
            configId: '2',
            keys: [
              {
                ...quota.keys[0],
                maskedKey: '••••NEW2',
                projectName: 'new-project',
                tpmLimit: 20000,
                estimatedInputTokens: 0,
              },
            ],
          };
          response = settings;
        } else if (path.endsWith('/key-management/models')) response = ['test-model'];
        else if (path.endsWith('/key-management/activity'))
          response = { items: [], total: 0, page: 0, size: 10 };
        else if (path.endsWith('/ai-settings/key-management'))
          response = {
            configId: settings.id,
            active: settings.active,
            history: [],
            keys: [
              {
                keyRef: 'PRIMARY',
                identity: `identity-${settings.id}`,
                name: 'Key chính',
                priority: 0,
                maskedKey: settings.maskedKey,
                lastPrimaryAt: null,
              },
            ],
          };
        else if (path.endsWith('/ai-settings/models'))
          response = {
            provider: 'GEMINI',
            source: 'NONE',
            note: '',
            savedModels: ['test-model'],
            models: [
              {
                id: 'test-model',
                displayName: 'Test',
                requestsPerDay: null,
                tokensPerMinute: null,
              },
            ],
          };
        else if (path.endsWith('/ai-settings')) response = [settings];
        else if (path.endsWith('/key-alert')) response = { alert: null };
        else if (path.endsWith('/notifications')) response = { unreadCount: 0, items: [] };
        else if (path.endsWith('/metrics'))
          response = { requests: 0, failures: 0, averageMillis: 0 };
        await route.fulfill({ json: response });
      },
    );
    await page.goto('/admin/ai-settings');
    await page.getByRole('tab', { name: 'API key (1)', exact: true }).click();
    await page.getByRole('button', { name: 'Sửa Key chính', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Thay API key', { exact: true }).fill('test-replacement-key');
    await dialog.getByLabel('Project ID', { exact: true }).fill('new-project');
    await dialog.getByText('Hạn mức token mỗi phút để chuyển key', { exact: true }).click();
    await dialog.getByLabel('Dùng hạn mức mặc định', { exact: true }).uncheck();
    await dialog.getByLabel('Giới hạn mỗi phút', { exact: true }).fill('20000');
    await dialog.getByRole('button', { name: 'Kiểm tra và lưu', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('new-project', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Sửa Key chính', exact: true }).click();
    await dialog.getByText('Hạn mức token mỗi phút để chuyển key', { exact: true }).click();
    await expect(dialog.getByLabel('Giới hạn mỗi phút', { exact: true })).toHaveValue('20000');
    expect(saves).toBe(1);
    await expect(page.getByRole('tab', { name: 'Quota', exact: true })).toHaveCount(0);
  });
}
