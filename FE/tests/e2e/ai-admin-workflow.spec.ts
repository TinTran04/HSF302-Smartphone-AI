import { expect, test, type Page } from '@playwright/test';

async function openAdmin(page: Page, modelHistory: string[] = ['custom-saved-model']) {
  await page.addInitScript((history) => {
    const providers = ['GEMINI', 'GROQ', 'DEEPSEEK'];
    sessionStorage.setItem(
      'smai-demo-settings',
      JSON.stringify(
        providers.map((provider, index) => ({
          id: 'config-' + provider,
          provider,
          model: 'saved-model',
          maskedKey: '••••AAAA',
          maskedBackupKey: '••••BBBB',
          active: index === 0,
          tested: true,
          backupKeys: Array.from({ length: 7 }, (_, i) => ({
            id: 'backup-' + i,
            name: 'Key nhóm ' + (i + 1),
            maskedKey: '••••000' + i,
            priority: i + 1,
            lastStatus: 'WORKING',
            lastFailureReason: null,
            lastCheckedAt: null,
          })),
        })),
      ),
    );
    for (const provider of providers) {
      sessionStorage.setItem(
        'smai-demo-ai-activity-' + provider,
        JSON.stringify(
          Array.from({ length: 23 }, (_, index) => ({
            id: String(index),
            type: 'KEY_CHECKED',
            model: 'saved-model',
            keyName: 'Log ' + index,
            maskedKey: '••••AAAA',
            reason: null,
            actor: 'Admin',
            createdAt: new Date(2026, 10, 13, 10, 59 - index).toISOString(),
          })),
        ),
      );
      sessionStorage.setItem('smai-demo-saved-models-' + provider, JSON.stringify(history));
    }
  }, modelHistory);
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('admin@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/ai-settings');
}

test('unified keys and activity have five/ten row pagination', async ({ page }) => {
  await openAdmin(page);
  await expect(page.getByRole('tab', { name: 'Quota', exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: /API key/ }).click();
  await expect(page.locator('.ai-key-primary')).toHaveCount(1);
  await expect(page.locator('.ai-backup-table tbody tr')).toHaveCount(5);
  const pagination = page.getByRole('navigation', { name: 'Phân trang key dự phòng' });
  await pagination.getByRole('button', { name: 'Sau', exact: true }).click();
  await expect(page.locator('.ai-backup-table tbody tr')).toHaveCount(2);
  await expect(page.locator('.ai-key-primary')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Nhật ký', exact: true }).click();
  await expect(page.locator('.ai-activity-table tbody tr')).toHaveCount(10);
  const logs = page.getByRole('navigation', { name: 'Phân trang nhật ký' });
  await logs.getByRole('button', { name: 'Sau', exact: true }).click();
  await logs.getByRole('button', { name: 'Sau', exact: true }).click();
  await expect(page.locator('.ai-activity-table tbody tr')).toHaveCount(3);
});

test('edits names and quota in one dialog and excludes saved model history for all providers', async ({
  page,
}) => {
  await openAdmin(page);
  for (const provider of ['Google Gemini', 'Groq', 'DeepSeek']) {
    await page
      .getByRole('button', { name: new RegExp(provider) })
      .first()
      .click();
    await expect(
      page.getByLabel('Chat Model', { exact: true }).locator('option[value="custom-saved-model"]'),
    ).toHaveCount(0);
    await page.getByRole('tab', { name: /API key/ }).click();
    await page.getByRole('button', { name: 'Sửa Key nhóm 1', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Tên nhận diện', { exact: true }).fill('Key ' + provider);
    await dialog.getByLabel(/Project ID|Nhóm hạn mức/).fill('my-group');
    await dialog.getByText('Hạn mức token mỗi phút để chuyển key', { exact: true }).click();
    await dialog.getByLabel('Dùng hạn mức mặc định', { exact: true }).uncheck();
    await dialog.getByLabel('Giới hạn mỗi phút', { exact: true }).fill('500000');
    await dialog.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Key ' + provider, { exact: true })).toBeVisible();
    await expect(page.getByText('my-group', { exact: true }).first()).toBeVisible();
  }
});

test('mobile key editor and pagination fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page);
  await page.getByRole('tab', { name: /API key/ }).click();
  await page.getByRole('button', { name: 'Sửa Key nhóm 1', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Tên nhận diện', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('backup deletion is visible without opening the action menu and requires confirmation', async ({
  page,
}) => {
  await openAdmin(page);
  await page.getByRole('tab', { name: /API key/ }).click();
  const remove = page.getByRole('button', { name: 'Xóa Key nhóm 1', exact: true });
  await expect(remove).toBeVisible();
  await remove.click();
  const confirmation = page.getByRole('dialog');
  await confirmation.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await expect(remove).toBeVisible();
  await remove.click();
  await confirmation.getByRole('button', { name: 'Xóa key', exact: true }).click();
  await expect(remove).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Key dự phòng (6/10)', exact: true }),
  ).toBeVisible();
});

test('chat model selector offers only three suggestions and excludes custom model entry', async ({
  page,
}) => {
  await openAdmin(page, [
    'Gemini 3.6 Flash',
    'Gemini Embedding 1',
    'gemini-embedding-001',
    'gemini-3.6-flash-lite',
    'GEMINI-3.6-FLASH-LITE',
    'custom-phone-model',
  ]);
  const models = page.getByLabel('Chat Model', { exact: true });
  await expect(models.locator('option:enabled')).toHaveCount(3);
  await expect(models.locator('optgroup[label="Model đã lưu"]')).toHaveCount(0);
  await expect(models.locator('option[value="Gemini 3.6 Flash"]')).toHaveCount(0);
  await expect(models.locator('option').filter({ hasText: /embedding/i })).toHaveCount(0);
  await expect(models.locator('option').filter({ hasText: /gemini-3.6-flash-lite/i })).toHaveCount(
    1,
  );
  await expect(models.locator('option[value="custom-phone-model"]')).toHaveCount(0);
  await expect(models.locator('option').filter({ hasText: /Khác/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lưu cấu hình', exact: true })).toBeDisabled();
  await models.selectOption('gemini-3.6-flash-lite');
  await expect(page.getByRole('button', { name: 'Lưu cấu hình', exact: true })).toBeEnabled();
});
