import { expect, test } from '@playwright/test';

test('deletion completes in the UI even when refreshing the remaining history is slow', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('customer@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/ai');
  await page.getByRole('button', { name: /Tư vấn mua điện thoại/ }).click();
  await expect(page).toHaveURL(/\/ai\/conversations\//);
  await expect(page.locator('.chat-history-row')).toHaveCount(1);
  await page.evaluate(async () => {
    const modulePath = '/src/shared/api/index.ts';
    const { api } = await import(modulePath);
    const original = api.conversations;
    const state = window as Window & { releaseHistoryRefresh?: () => void; historyRefreshStarted?: boolean };
    api.conversations = async () => {
      state.historyRefreshStarted = true;
      await new Promise<void>((resolve) => { state.releaseHistoryRefresh = resolve; });
      return original();
    };
  });
  try {
    await page.locator('.chat-history-row').getByRole('button', { name: /Xóa cuộc trò chuyện/ }).click();
    await page.getByRole('dialog', { name: 'Xóa cuộc trò chuyện', exact: true })
      .getByRole('button', { name: 'Xóa cuộc trò chuyện', exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as Window & { historyRefreshStarted?: boolean }).historyRefreshStarted)).toBe(true);
    await expect(page.getByRole('dialog', { name: 'Xóa cuộc trò chuyện', exact: true })).toHaveCount(0);
    await expect(page.locator('.chat-history-row')).toHaveCount(0);
    await expect(page.locator('.toast').filter({ hasText: 'Đã xóa cuộc trò chuyện.' })).toBeVisible();
    await expect(page).toHaveURL(/\/ai$/);
  } finally {
    await page.evaluate(() => (window as Window & { releaseHistoryRefresh?: () => void }).releaseHistoryRefresh?.());
  }
});
