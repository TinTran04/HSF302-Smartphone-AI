import { expect, test, type Page } from '@playwright/test';

async function openSettings(page: Page, options: { singleKey?: boolean; daily?: boolean } = {}) {
  await page.addInitScript((options) => {
    const backup = (id: string, name: string, priority: number) => ({
      id,
      name,
      priority,
      maskedKey: `••••${id}`,
      lastStatus: 'WORKING',
      lastFailureReason: null,
      lastCheckedAt: null,
    });
    sessionStorage.setItem(
      'smai-demo-settings',
      JSON.stringify([
        {
          id: 'config-1',
          provider: 'GEMINI',
          model: 'demo-model',
          maskedKey: '••••AAAA',
          maskedBackupKey: '••••BBBB',
          active: true,
          tested: true,
          backupKeys: options.singleKey
            ? []
            : [backup('BBBB', 'Project B', 1), backup('CCCC', 'Project C', 2)],
        },
      ]),
    );
    sessionStorage.setItem(
      'smai-demo-key-management-GEMINI',
      JSON.stringify({
        configId: 'config-1',
        active: true,
        history: [],
        keys: [
          {
            keyRef: 'PRIMARY',
            identity: 'identity-a',
            name: 'Project A',
            maskedKey: '••••AAAA',
            priority: 0,
            lastPrimaryAt: null,
          },
        ],
      }),
    );
    if (options.daily)
      sessionStorage.setItem(
        'smai-demo-quota-GEMINI-demo-model',
        JSON.stringify({
          'identity-a': {
            requestsToday: 2,
            dailyRequestLimit: 500,
            dailyLimitSource: 'MANUAL',
            estimatedInputTokens: 10,
            tpmLimit: 250000,
            status: 'RATE_LIMIT',
            reason: 'AI_PROVIDER_DAILY_LIMIT',
          },
        }),
      );
  }, options);
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('admin@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/ai-settings');
}

test('admin selects a suggested model and saves, tests and activates it', async ({ page }) => {
  await openSettings(page);
  const modelSelect = page.getByLabel('Chat Model', { exact: true });
  await expect(modelSelect.locator('option:enabled')).toHaveCount(3);
  await expect(modelSelect.locator('option[value="demo-model"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lưu cấu hình', exact: true })).toBeDisabled();
  await modelSelect.selectOption('gemini-3.6-flash');
  await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
  await expect(modelSelect).toHaveValue('gemini-3.6-flash');
  await page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true }).click();
  await page.getByRole('button', { name: 'Kích hoạt', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đang hoạt động', exact: true })).toBeVisible();
  const savedSettings = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('smai-demo-settings') || '[]'),
  );
  expect(
    savedSettings.find((setting: { provider: string }) => setting.provider === 'GEMINI').model,
  ).toBe('gemini-3.6-flash');
});

for (const mobile of [false, true]) {
  test(`admin key tabs and repeated swaps work on ${mobile ? 'mobile' : 'desktop'}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await openSettings(page);
    await expect(page.getByRole('tabpanel', { name: 'Kết nối', exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Thêm key dự phòng', exact: true }),
    ).not.toBeVisible();
    await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
    await expect(page.locator('.ai-key-primary:visible')).toHaveCount(1);
    await expect(page.locator('.ai-backup-table:visible tbody tr')).toHaveCount(2);
    await expect(page.getByRole('tabpanel', { name: 'Kết nối', exact: true })).not.toBeVisible();
    await page.getByRole('button', { name: 'Đặt Project B làm key chính', exact: true }).click();
    await page.getByRole('button', { name: 'Hoán đổi key', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Đặt Project A làm key chính', exact: true }),
    ).toBeEnabled();
    await page.getByRole('tab', { name: 'Nhật ký', exact: true }).click();
    await expect(
      page.getByText('Project A (••••AAAA) → Project B (••••BBBB)', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lưu cấu hình', exact: true })).not.toBeVisible();
    await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
    await page.getByRole('button', { name: 'Đặt Project A làm key chính', exact: true }).click();
    await page.getByRole('button', { name: 'Hoán đổi key', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Đặt Project B làm key chính', exact: true }),
    ).toBeEnabled();
    await expect(
      page
        .getByRole('tabpanel', { name: 'API key (3)', exact: true })
        .getByText('Project B', { exact: true }),
    ).toHaveCount(1);
    const closeNotifications = page.getByRole('button', { name: 'Đóng thông báo', exact: true });
    while (await closeNotifications.count()) await closeNotifications.first().click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/ai-settings-keys-${mobile ? 'mobile' : 'desktop'}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('editing a key saves its metadata directly and retains it across tabs', async ({ page }) => {
  await openSettings(page);
  await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
  await page.getByRole('button', { name: 'Sửa Project B', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByLabel('Tên nhận diện', { exact: true }).fill('Project B renamed');
  await modal.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(modal).not.toBeVisible();
  await page.getByRole('tab', { name: 'Kết nối', exact: true }).click();
  await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
  await expect(page.getByText('Project B renamed', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Đặt Project B renamed làm key chính', exact: true }),
  ).toBeEnabled();
});

for (const mobile of [false, true]) {
  test(
    'primary deletion chooses a replacement on ' + (mobile ? 'mobile' : 'desktop'),
    async ({ page }) => {
      if (mobile) await page.setViewportSize({ width: 390, height: 844 });
      await openSettings(page);
      await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
      await page.getByRole('button', { name: 'Xóa Project A', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('button', { name: 'Xóa key', exact: true })).toBeDisabled();
      await dialog.getByLabel('Key dự phòng thay thế', { exact: true }).selectOption('CCCC');
      await dialog.getByRole('button', { name: 'Xóa key', exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.getByRole('tab', { name: 'API key (2)', exact: true })).toBeVisible();
      await expect(
        page.locator('.ai-key-primary').getByText('Project C', { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Xóa Project A', exact: true })).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    },
  );
}

test('last key deletion warns and a retained configuration accepts a new primary', async ({
  page,
}) => {
  await openSettings(page, { singleKey: true });
  await page.getByRole('tab', { name: 'API key (1)', exact: true }).click();
  await page.getByRole('button', { name: 'Xóa Project A', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByText(
      'Đây là key cuối cùng. Nền tảng này sẽ bị tắt. Chat sẽ dừng cho đến khi bạn thêm key mới.',
      {
        exact: true,
      },
    ),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Xóa key', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'API key (0)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Thêm key chính', exact: true }).click();
  await dialog.getByLabel('API key', { exact: true }).fill('new-primary-secret');
  await dialog.getByRole('button', { name: 'Kiểm tra và lưu', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('tab', { name: 'API key (1)', exact: true })).toBeVisible();
  await expect(page.locator('.ai-key-primary')).toBeVisible();
});

test('daily blocking status stays prominent despite unused estimated requests', async ({
  page,
}) => {
  await openSettings(page, { daily: true });
  await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
  const primary = page.locator('.ai-key-primary');
  await expect(primary.getByText('Chạm hạn mức ngày', { exact: true })).toBeVisible();
  await expect(
    primary.getByText('Ước tính còn 498 / 500 yêu cầu/ngày', { exact: true }),
  ).toBeVisible();
  await expect(
    primary.getByText('Theo lượt gọi AI do ứng dụng ghi nhận, theo nhóm hạn mức và model.', {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(primary.getByText('Chi tiết mức sử dụng theo phút', { exact: true })).toHaveCount(0);
  await expect(primary.getByText('Đặt lại ngày', { exact: false })).toHaveCount(0);
  await expect(primary.getByText('Bắt đầu ghi nhận', { exact: false })).toHaveCount(0);
});

test('daily settings are independent from minute rotation settings', async ({ page }) => {
  await openSettings(page);
  await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
  await page.getByRole('button', { name: 'Sửa Project A', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Dùng hạn mức ngày mặc định', { exact: true }).uncheck();
  await dialog.getByLabel('Giới hạn yêu cầu mỗi ngày', { exact: true }).fill('500');
  await dialog.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page
      .locator('.ai-key-primary')
      .getByText('Ước tính còn 500 / 500 yêu cầu/ngày', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sửa Project A', exact: true }).click();
  await expect(dialog.getByLabel('Giới hạn yêu cầu mỗi ngày', { exact: true })).toHaveValue('500');
  await expect(dialog.getByLabel('Dùng hạn mức ngày mặc định', { exact: true })).not.toBeChecked();
  await expect(dialog.getByLabel('Giới hạn mỗi phút', { exact: true })).not.toBeVisible();
});

for (const action of ['delete', 'edit', 'promote'] as const) {
  test(
    'closes stale ' + action + ' dialog after a concurrent primary promotion',
    async ({ page }) => {
      await openSettings(page);
      await page.getByRole('tab', { name: 'API key (3)', exact: true }).click();
      const actionName = {
        delete: 'Xóa Project A',
        edit: 'Sửa Project A',
        promote: 'Đặt Project C làm key chính',
      }[action];
      await page.getByRole('button', { name: actionName, exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      if (action === 'delete')
        await dialog.getByLabel('Key dự phòng thay thế', { exact: true }).selectOption('CCCC');
      if (action === 'edit')
        await dialog.getByLabel('Tên nhận diện', { exact: true }).fill('Stale edit');
      await page.evaluate(async () => {
        // The same mock backend instance represents a second admin updating the provider.
        const modulePath = '/src/shared/api/index.ts';
        const { api } = await import(modulePath);
        await api.promoteAiKey('config-1', 'BBBB');
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await expect(dialog).not.toBeVisible({ timeout: 20000 });
      await expect(
        page.locator('.ai-key-primary').getByText('Project B', { exact: true }),
      ).toBeVisible();
      const keys = await page.evaluate(async () => {
        const modulePath = '/src/shared/api/index.ts';
        const { api } = await import(modulePath);
        return (await api.aiKeyManagement('GEMINI')).keys;
      });
      expect(keys).toHaveLength(3);
      expect(keys.find((key: { keyRef: string }) => key.keyRef === 'PRIMARY').name).toBe(
        'Project B',
      );
      expect(keys.some((key: { name: string }) => key.name === 'Stale edit')).toBe(false);
    },
  );
}
