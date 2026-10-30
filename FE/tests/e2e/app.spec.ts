import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, admin = false) {
  await page.goto('/login');
  await page
    .getByRole('textbox', { name: 'Email', exact: true })
    .fill(admin ? 'admin@demo.vn' : 'customer@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(admin ? /\/admin$/ : /\/$/);
}
test('catalog filters, variant selection, guest cart persistence, login merge and COD', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/products?brandId=apple');
  await expect(page.getByRole('heading', { name: 'iPhone 16 Pro Max', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Galaxy S24 Ultra', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Xem iPhone 16 Pro Max', exact: true }).click();
  const add = page.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true });
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: '256GB', exact: true }).click();
  await page.getByRole('button', { name: 'Titan Tự Nhiên', exact: true }).click();
  await expect(add).toBeEnabled();
  await add.click();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'iPhone 16 Pro Max', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'iPhone 16 Pro Max', exact: true })).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('smartphone-ai-guest-cart') || '[]'),
  );
  expect(Object.keys(stored[0]).sort()).toEqual(['quantity', 'variantId']);
  await page.getByRole('link', { name: 'Tiến hành đặt hàng' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('customer@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page
    .getByRole('textbox', { name: 'Địa chỉ nhận hàng', exact: true })
    .fill('123 Nguyễn Huệ, TP. Hồ Chí Minh');
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click();
  await expect(
    page.getByText('Đã kiểm tra giá với máy chủ. Vui lòng xác nhận đặt hàng.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/SMAI-/);
  await expect(page.getByText(/Đặt hàng thành công!/)).toBeVisible();
  await page.getByRole('button', { name: 'Hủy đơn hàng', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Hủy đơn hàng', exact: true })).toHaveCount(0);
  await expect(page.getByText('Đã hủy', { exact: true }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
test('unified AI confirms topic switch without resending the question', async ({ page }) => {
  await page.goto('/ai');
  await page.getByRole('button', { name: /Tư vấn mua điện thoại/ }).click();
  await expect(page).toHaveURL(/\/ai\/conversations\//);
  const oldUrl = page.url();
  await page
    .getByLabel('Nhập câu hỏi cho trợ lý AI')
    .fill('Shop có cho đổi trả trong 7 ngày không?');
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.message.assistant')).toHaveCount(0);
  await expect(page.getByLabel('Nhập câu hỏi cho trợ lý AI')).toBeDisabled();
  await page.getByRole('button', { name: 'Chuyển sang Hỗ trợ cửa hàng', exact: true }).click();
  await expect(page).not.toHaveURL(oldUrl);
  await expect(page.locator('.message.user')).toHaveCount(1);
  await expect(page.locator('.message.assistant')).toHaveCount(1);
  await expect(
    page.getByText('Chinh-sach-minh-hoa.txt · Tài liệu mẫu', { exact: true }),
  ).toBeVisible();
  await page.goto(oldUrl);
  await expect(page.locator('.message.user')).toHaveCount(1);
  await expect(page.locator('.message.assistant')).toHaveCount(0);
});
test('customer cannot open admin routes', async ({ page }) => {
  await login(page);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Bạn không có quyền truy cập' })).toBeVisible();
});
test('admin product editing, provider form, document upload and status', async ({ page }) => {
  await login(page, true);
  await expect(
    page.getByRole('heading', { name: 'Tổng quan quản trị', exact: true }),
  ).toBeVisible();
  await page.goto('/admin/products/new');
  await page.getByLabel('Mã sản phẩm', { exact: true }).fill('test-phone');
  await page.getByLabel('Tên sản phẩm', { exact: true }).fill('Điện thoại kiểm thử');
  await page.getByRole('combobox', { name: 'Thương hiệu', exact: true }).selectOption('apple');
  await page.getByLabel('Màu sắc', { exact: true }).fill('Titan');
  await page.getByLabel('Giá (VNĐ)', { exact: true }).fill('10000000');
  await page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await page.getByRole('textbox', { name: 'Tìm sản phẩm quản trị' }).fill('Điện thoại kiểm thử');
  await page.getByRole('textbox', { name: 'Tìm sản phẩm quản trị' }).press('Enter');
  await expect(page.getByText('Điện thoại kiểm thử', { exact: true })).toBeVisible();
  await page.goto('/admin/ai-settings');
  await expect(page.getByLabel('API Key đã lưu')).toHaveValue('••••••••');
  await page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true }).click();
  await expect(
    page.getByText('Chế độ demo: chỉ kiểm tra giao diện, chưa gọi nhà cung cấp AI.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto('/admin/knowledge');
  await page.getByLabel('File tài liệu', { exact: true }).setInputFiles({
    name: 'tai-lieu-test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Tai lieu thu nghiem'),
  });
  await expect(page.getByRole('row', { name: /tai-lieu-test\.txt/ })).toBeVisible();
  await expect(page.getByText('Đang trích xuất và tạo Embedding', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Đăng xuất quản trị' })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất quản trị' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
test('14 converted design screens render and public routes fit desktop and tablet', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/design');
  const select = page.getByLabel('Chọn bản thiết kế');
  await expect(select.locator('option')).toHaveCount(14);
  const names = await select.locator('option').allTextContents();
  expect(names).toHaveLength(14);
  for (const name of names) {
    await select.selectOption(name);
    await expect(page.locator('[inert]')).toContainText('SmartPhone');
  }
  for (const width of [1440, 1280, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      '/',
      '/products',
      '/products/iphone-16-pro-max',
      '/cart',
      '/compare',
      '/login',
      '/ai',
    ]) {
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `${route} overflows at ${width}`).toBeFalsy();
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Công nghệ bạn yêu/ })).toBeVisible();
  await expect(page.locator('.home-products .product-card')).toHaveCount(4);
  await page.locator('main img').evaluateAll(async (nodes) => {
    await Promise.all(
      nodes.map(async (node) => {
        const img = node as HTMLImageElement;
        img.loading = 'eager';
        await img.decode();
      }),
    );
  });
  await page.screenshot({ path: 'test-results/home-1440.png', fullPage: true });
  expect(errors).toEqual([]);
});
