import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, admin = false) {
  await page.goto('/login');
  await page
    .getByLabel('Email', { exact: true })
    .fill(admin ? 'admin@demo.vn' : 'customer@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(admin ? /\/admin$/ : /\/$/);
}

test('admin product search text stays clear of the icon', async ({ page }) => {
  await login(page, true);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/admin/products');
    const input = page.getByLabel('Tìm sản phẩm quản trị');
    const icon = page.locator('.admin-filter-search .search-field > .material-symbols-outlined');
    await input.fill('test');
    const padding = await input.evaluate((element) => parseFloat(getComputedStyle(element).paddingLeft));
    const inputBounds = await input.boundingBox();
    const iconBounds = await icon.boundingBox();
    expect(inputBounds!.x + padding - (iconBounds!.x + iconBounds!.width)).toBeGreaterThanOrEqual(8);
  }
});

test('primary mobile controls provide comfortable pointer targets', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/products');
  const search = page.getByRole('link', { name: 'Tìm kiếm điện thoại', exact: true });
  await expect(search).toBeVisible();
  const bounds = await search.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('catalog search text clears the icon before and after focus on desktop and mobile', async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/products');
    const input = page.locator('.storefront-search-input input');
    const icon = page.locator('.storefront-search-input > .material-symbols-outlined');
    await expect(input).toBeVisible();
    async function expectTextClearance() {
      const padding = await input.evaluate((element) =>
        parseFloat(getComputedStyle(element).paddingLeft),
      );
      const inputBounds = await input.boundingBox();
      const iconBounds = await icon.boundingBox();
      expect(inputBounds!.x + padding - (iconBounds!.x + iconBounds!.width)).toBeGreaterThanOrEqual(
        8,
      );
    }
    await expectTextClearance();
    await input.focus();
    await input.fill('iPhone');
    await expectTextClearance();
    await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
    await expect(page).toHaveURL(/keyword=iPhone/);
    await expect(input).toHaveValue('iPhone');
    await page.screenshot({ path: test.info().outputPath(`search-${width}.png`) });
  }
});

test('mobile customers can open chat history, navigate it and return focus after closing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto('/ai');
  const support = page.getByRole('button', { name: /Hỗ trợ cửa hàng/ });
  await expect(support).toBeInViewport();
  const opener = page.getByRole('button', { name: 'Mở lịch sử hội thoại', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Lịch sử hội thoại', exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('link', { name: 'Cuộc trò chuyện mới', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Xin chào! Mình có thể giúp gì cho bạn hôm nay?' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(844);
});

test('mobile admin opens navigation on demand and returns focus after dismissal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, true);
  const opener = page.getByRole('button', { name: 'Mở menu quản trị', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Menu quản trị', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('navigation', { name: 'Quản trị', exact: true })).toHaveCSS(
    'flex-direction',
    'column',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('link', { name: 'Quản lý tài khoản', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\/accounts$/);
  await expect(page.getByRole('heading', { name: 'Quản lý tài khoản', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('tablet administration uses the full available content width', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1000 });
  await login(page, true);
  const content = await page.locator('.admin-main').boundingBox();
  expect(content!.width).toBeGreaterThanOrEqual(880);
  await expect(page.getByRole('button', { name: 'Mở menu quản trị' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(900);
});

test('mobile filters retain values when collapsed and storefront reflows with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/products');
  const price = page.getByLabel('Giá tối thiểu', { exact: true });
  await expect(price).toBeHidden();
  await page.getByRole('button', { name: 'Hiện bộ lọc tìm kiếm', exact: true }).click();
  await expect(price).toBeVisible();
  await price.fill('10000000');
  await expect(page).toHaveURL(/minPrice=10000000/);
  await page.getByRole('button', { name: 'Ẩn bộ lọc tìm kiếm', exact: true }).click();
  await expect(price).toBeHidden();
  await page.getByRole('button', { name: 'Hiện bộ lọc tìm kiếm', exact: true }).click();
  await expect(price).toHaveValue('10000000');
  await page.getByRole('button', { name: 'Đặt lại', exact: true }).click();
  await expect(price).toHaveValue('');
  for (const width of [375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('representative store, account, AI and admin screens fit desktop and mobile', async ({
  page,
}) => {
  test.setTimeout(180000);
  const screenshots = [
    { path: '/', name: 'home' },
    { path: '/products', name: 'catalog' },
    { path: '/products/iphone-16-pro-max', name: 'product' },
    { path: '/login', name: 'login' },
    { path: '/register', name: 'register' },
  ];
  async function inspect(path: string, name: string, width: number) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('.skeleton')).toHaveCount(0);
    await page.locator('img').evaluateAll((elements) =>
      Promise.all(
        elements.map((element) => {
          const image = element as HTMLImageElement;
          image.loading = 'eager';
          return image.decode().catch(() => undefined);
        }),
      ),
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.screenshot({ path: test.info().outputPath(`${name}-${width}.png`), fullPage: true });
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const screen of screenshots) await inspect(screen.path, screen.name, width);
  }
  await login(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await inspect('/profile', 'profile', width);
    await inspect('/ai', 'ai', width);
    await inspect('/orders', 'orders', width);
  }
  await page.getByLabel('Menu tài khoản').click();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await login(page, true);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await inspect('/admin', 'dashboard', width);
    await inspect('/admin/accounts', 'accounts', width);
    await inspect('/admin/ai-settings', 'settings', width);
    await inspect('/admin/products', 'admin-products', width);
  }
});
