import { test, expect, type Page } from '@playwright/test';

test('login and registration both use email', async ({ page }) => {
  await page.goto('/login');
  const identifier = page.getByRole('textbox', { name: 'Email', exact: true });
  await expect(identifier).toBeVisible();
  await expect(identifier).toHaveAttribute('type', 'email');
  await expect(identifier).toHaveAttribute('autocomplete', 'email');
  await page.goto('/register');
  const email = page.getByRole('textbox', { name: 'Email', exact: true });
  await expect(email).toHaveAttribute('type', 'email');
  await expect(email).toHaveAttribute('autocomplete', 'email');
});

async function login(page: Page, admin = false) {
  await page.goto('/login');
  await page
    .getByRole('textbox', { name: 'Email', exact: true })
    .fill(admin ? 'admin@demo.vn' : 'customer@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(admin ? /\/admin$/ : /\/$/);
}

test('admin AI bell persists unread history and read state without notification toasts', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('smai-demo-ai-key-alert', JSON.stringify({
      id: 'alert-1', model: 'demo-gemini', status: 'USING_BACKUP', reason: 'AI_PROVIDER_AUTH_ERROR',
      backupFailureReason: null, detectedAt: '2026-11-09T12:00:00Z',
    }));
  });
  await login(page, true);
  const alert = page.getByRole('region', { name: 'Cảnh báo API key AI' });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('Đã dùng key dự phòng');
  await expect(alert).toContainText('hết hiệu lực hoặc không có quyền truy cập');
  await expect(page.locator('.toast').filter({ hasText: 'Đã dùng key dự phòng' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Cập nhật API key', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/ai-settings$/);
  await expect(alert).toBeVisible();
  await expect(page.locator('.toast').filter({ hasText: 'Đã dùng key dự phòng' })).toHaveCount(0);
  await page.reload();
  await expect(alert).toBeVisible();
  await expect(page.locator('.toast').filter({ hasText: 'Đã dùng key dự phòng' })).toHaveCount(0);
  const bell = page.getByRole('button', { name: 'Thông báo AI, 1 chưa đọc', exact: true });
  await bell.click();
  const dialog = page.getByRole('dialog', { name: 'Thông báo AI', exact: true });
  await expect(dialog.getByText('Chưa đọc', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/admin-ai-notifications-desktop.png', fullPage: true });
  await expect(dialog.getByText('Model demo-gemini', { exact: false })).toBeVisible();
  await dialog.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' }).click();
  await expect(dialog.getByText('Đã đọc', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Đóng hộp thoại' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Thông báo AI, 0 chưa đọc', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Đã đọc', { exact: true })).toBeVisible();
});

test('admin key alert updates on polling and clears after primary recovery on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  await page.addInitScript(() => {
    sessionStorage.setItem('smai-demo-ai-key-alert', JSON.stringify({
      id: 'alert-2', model: 'demo-gemini', status: 'BACKUP_FAILED', reason: 'AI_PROVIDER_AUTH_ERROR',
      backupFailureReason: 'AI_PROVIDER_RATE_LIMIT', detectedAt: '2026-11-09T12:00:00Z',
    }));
  });
  await login(page, true);
  const alert = page.getByRole('region', { name: 'Cảnh báo API key AI' });
  await expect(alert).toContainText('Key dự phòng cũng gặp lỗi');
  await expect(alert).toContainText('Đã chạm quota hoặc giới hạn sử dụng');
  await page.screenshot({ path: 'test-results/admin-ai-key-alert-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.clock.fastForward(16_000);
  await page.clock.runFor(500);
  await expect(page.locator('.toast').filter({ hasText: 'Key AI chính gặp lỗi' })).toHaveCount(0);
  await expect(alert).toBeVisible();
  await page.evaluate(() => sessionStorage.setItem('smai-demo-ai-key-alert', 'null'));
  await page.clock.fastForward(16_000);
  await page.clock.runFor(500);
  await expect(alert).toHaveCount(0);
  await page.getByRole('button', { name: 'Thông báo AI, 1 chưa đọc', exact: true }).click();
  const history = page.getByRole('dialog', { name: 'Thông báo AI', exact: true });
  await expect(history.getByText('Đã xử lý', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/admin-ai-notifications-mobile.png', fullPage: true });
});

async function mockMapTiles(page: Page) {
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#eff2e8"/><path d="M0 64H256M0 160H256M64 0V256M160 0V256" stroke="#fff" stroke-width="12"/><path d="M0 64H256M0 160H256M64 0V256M160 0V256" stroke="#cfd5cd" stroke-width="1"/></svg>',
    }),
  );
}

test('selecting a map point fills profile and shipping addresses and requires checkout recheck', async ({
  page,
}) => {
  await mockMapTiles(page);
  await login(page);
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin' }).click();
  const picker = page.locator('.location-picker');
  await picker.getByRole('button', { name: 'Chọn vị trí trên bản đồ', exact: true }).click();
  const map = page.getByRole('region', { name: 'Bản đồ địa chỉ' });
  await expect(map.locator('.leaflet-control-attribution')).toBeVisible();
  await map.click({ position: { x: 200, y: 125 } });
  const address = page.getByRole('combobox', { name: 'Địa chỉ mặc định', exact: true });
  await expect(address).toHaveValue(/^Địa chỉ minh họa tại /, { timeout: 4000 });
  const label = await address.inputValue();
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(address).toBeDisabled();
  await page.reload();
  await expect(address).toHaveValue(label);
  await page.goto('/products/iphone-16-pro-max');
  await page.getByRole('button', { name: '256GB', exact: true }).click();
  await page.getByRole('button', { name: 'Titan Tự Nhiên', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true }).click();
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Tiến hành đặt hàng' }).click();
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true })).toBeVisible();
  await picker.getByRole('button', { name: 'Xem vị trí trên bản đồ', exact: true }).click();
  await expect(map.locator('.leaflet-control-attribution')).toBeVisible();
  await map.click({ position: { x: 310, y: 190 } });
  const shipping = page.getByRole('combobox', { name: 'Địa chỉ nhận hàng', exact: true });
  await expect(shipping).toHaveValue(/^Địa chỉ minh họa tại /);
  await expect(shipping).not.toHaveValue(label);
  await expect(page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true })).toHaveCount(0);
});

test('admin selects product and variant images, keeps them after invalid input, and permanently deletes with confirmation', async ({
  page,
}) => {
  const name = `Máy thử ảnh ${Date.now()}`;
  await login(page, true);
  await page.goto('/admin/products/new');
  await page.getByLabel('Mã sản phẩm', { exact: true }).fill(`upload-${Date.now()}`);
  await page.getByLabel('Tên sản phẩm', { exact: true }).fill(name);
  await page.getByRole('combobox', { name: 'Thương hiệu', exact: true }).selectOption({ index: 1 });
  const gallery = page.getByLabel('Hình ảnh sản phẩm', { exact: true });
  await gallery.setInputFiles('public/images/7dc0d3296fa2eaa7.webp');
  const preview = page.getByRole('img', { name: 'Hình ảnh sản phẩm 1', exact: true });
  await expect(preview).toHaveAttribute('src', /^data:image\/webp;base64,/);
  await expect
    .poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await gallery.setInputFiles({
    name: 'wrong.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });
  await expect(
    page.locator('.toast-error').filter({ hasText: 'Vui lòng chọn ảnh PNG, JPEG hoặc WebP.' }),
  ).toHaveCount(1);
  await expect(preview).toBeVisible();
  await page
    .getByLabel('Ảnh phiên bản 1', { exact: true })
    .setInputFiles('public/images/7dc0d3296fa2eaa7.webp');
  await expect(page.getByRole('img', { name: 'Ảnh phiên bản 1 1', exact: true })).toHaveAttribute(
    'src',
    /^data:image\/webp;base64,/,
  );
  await page.getByLabel('Màu sắc', { exact: true }).fill('Đen');
  await page.getByLabel('Giá (VNĐ)', { exact: true }).fill('9000000');
  await page.screenshot({ path: 'test-results/product-upload-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/product-upload-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`/admin/products?keyword=${encodeURIComponent(name)}`);
  await page.reload();
  await page.getByRole('link', { name: `Sửa ${name}`, exact: true }).click();
  await expect(preview).toHaveAttribute('src', /^data:image\/webp;base64,/);
  await page.goto(`/admin/products?keyword=${encodeURIComponent(name)}`);
  const row = page.getByRole('row').filter({ hasText: name });
  await row.getByRole('button', { name: `Xóa vĩnh viễn ${name}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Xóa vĩnh viễn sản phẩm?' });
  await dialog.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: `Xóa vĩnh viễn ${name}`, exact: true }).click();
  await dialog.getByRole('button', { name: 'Xóa vĩnh viễn', exact: true }).click();
  await expect(row).toHaveCount(0);
  await expect(
    page.locator('.toast').filter({ hasText: 'Đã xóa vĩnh viễn sản phẩm.' }),
  ).toHaveCount(1);
  await page.reload();
  await expect(row).toHaveCount(0);
});

test('address suggestions select a saved profile point and update checkout map without submitting', async ({
  page,
}) => {
  await mockMapTiles(page);
  await login(page);
  await page.goto('/profile');
  const address = page.getByRole('combobox', { name: 'Địa chỉ mặc định', exact: true });
  await expect(address).toBeDisabled();
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin' }).click();
  await address.fill('Nguyễn Huệ');
  const option = page.getByRole('option', {
    name: 'Phố đi bộ Nguyễn Huệ, TP. Hồ Chí Minh, Việt Nam',
    exact: true,
  });
  await expect(option).toBeVisible();
  await expect(page.getByRole('link', { name: 'Powered by Geoapify', exact: true })).toHaveCount(0);
  await address.press('ArrowDown');
  await address.press('Enter');
  await expect(address).toHaveValue('Phố đi bộ Nguyễn Huệ, TP. Hồ Chí Minh, Việt Nam');
  const map = page.getByRole('region', { name: 'Bản đồ địa chỉ' });
  await expect(
    map
      .locator('.leaflet-control-attribution')
      .getByRole('link', { name: 'Geoapify', exact: true }),
  ).toBeVisible();
  await expect(map.locator('path.leaflet-interactive')).toBeVisible();
  await expect(page.locator('.location-picker')).toContainText('10.773900, 106.703100');
  await expect(page.getByRole('button', { name: 'Lưu thay đổi' })).toBeVisible();
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(address).toBeDisabled();
  await page.reload();
  await expect(address).toHaveValue('Phố đi bộ Nguyễn Huệ, TP. Hồ Chí Minh, Việt Nam');
  await expect(page.locator('.location-picker')).toContainText('10.773900, 106.703100');
  await page.goto('/products/iphone-16-pro-max');
  await page.getByRole('button', { name: '256GB', exact: true }).click();
  await page.getByRole('button', { name: 'Titan Tự Nhiên', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true }).click();
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Tiến hành đặt hàng' }).click();
  const shipping = page.getByRole('combobox', { name: 'Địa chỉ nhận hàng', exact: true });
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true })).toBeVisible();
  await shipping.fill('Bến Thành');
  await page
    .getByRole('option', { name: 'Chợ Bến Thành, TP. Hồ Chí Minh, Việt Nam', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true })).toBeVisible();
  await expect(map.locator('path.leaflet-interactive')).toBeVisible();
  await expect(page.locator('.location-picker')).toContainText('10.772500, 106.698000');
  await page.screenshot({ path: 'test-results/address-autocomplete-checkout.png', fullPage: true });
});

for (const interaction of ['manual selection', 'address edit']) {
  test(`late GPS cannot overwrite a newer ${interaction}`, async ({ page }) => {
    await mockMapTiles(page);
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = (success) => {
        (window as unknown as { finishGps: () => void }).finishGps = () =>
          success({
            coords: { latitude: 21.0285, longitude: 105.8542 },
          } as GeolocationPosition);
      };
    });
    await login(page);
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Chỉnh sửa thông tin' }).click();
    const picker = page.locator('.location-picker');
    await picker.getByRole('button', { name: 'Chọn vị trí trên bản đồ', exact: true }).click();
    const map = page.getByRole('region', { name: 'Bản đồ địa chỉ' });
    await expect(map.locator('.leaflet-control-attribution')).toBeVisible();
    await picker.getByRole('button', { name: 'Vị trí hiện tại', exact: true }).click();
    if (interaction === 'manual selection') await map.click({ position: { x: 220, y: 120 } });
    else
      await page
        .getByLabel('Địa chỉ mặc định', { exact: true })
        .fill('Địa chỉ mới khi đang định vị');
    const latest = await picker.getByRole('status').textContent();
    await page.evaluate(() => (window as unknown as { finishGps: () => void }).finishGps());
    await expect(picker.getByRole('status')).toHaveText(latest!);
    await expect(picker).not.toContainText('21.028500, 105.854200');
  });
}

test('admin marks a phone sold out while its card and detail stay public, then reopens sales', async ({
  page,
}) => {
  await login(page, true);
  await page.goto('/admin/products?keyword=iPhone+16+Pro+Max');
  const row = page.getByRole('row').filter({ hasText: 'iPhone 16 Pro Max' });
  await row
    .getByRole('button', { name: 'Đánh dấu hết hàng iPhone 16 Pro Max', exact: true })
    .click();
  let dialog = page.getByRole('dialog', { name: 'Đánh dấu sản phẩm hết hàng?' });
  await dialog.getByRole('button', { name: 'Quay lại' }).click();
  await expect(row.getByText('Đang mở bán', { exact: true })).toBeVisible();
  await row
    .getByRole('button', { name: 'Đánh dấu hết hàng iPhone 16 Pro Max', exact: true })
    .click();
  await dialog.getByRole('button', { name: 'Đánh dấu hết hàng', exact: true }).click();
  await expect(row.getByText('Hết hàng', { exact: true })).toBeVisible();
  await expect(
    page.locator('.toast').filter({ hasText: 'Đã đánh dấu sản phẩm hết hàng.' }),
  ).toHaveCount(1);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await page.goto('/products?keyword=iPhone+16+Pro+Max');
  const card = page.locator('.product-card').filter({ hasText: 'iPhone 16 Pro Max' });
  await expect(card.getByText('Hết hàng', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/sold-out-catalog.png', fullPage: true });
  await card.getByRole('link', { name: 'Xem iPhone 16 Pro Max', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'iPhone 16 Pro Max', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hết hàng', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Thêm so sánh', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bỏ so sánh', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/sold-out-detail.png', fullPage: true });
  await login(page, true);
  await page.goto('/admin/products?keyword=iPhone+16+Pro+Max');
  await row.getByRole('button', { name: 'Mở bán iPhone 16 Pro Max', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Mở bán sản phẩm?' });
  await dialog.getByRole('button', { name: 'Mở bán', exact: true }).click();
  await expect(row.getByText('Đang mở bán', { exact: true })).toBeVisible();
});

test('customer saves a map pin, clears stale pins on address edits and uses shipping coordinates', async ({
  page,
  context,
}) => {
  await mockMapTiles(page);
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 10.7769, longitude: 106.7009 });
  await login(page);
  await page.goto('/profile');
  const picker = page.locator('.location-picker');
  await expect(
    picker.getByRole('button', { name: 'Chọn vị trí trên bản đồ', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin' }).click();
  await page
    .getByLabel('Địa chỉ mặc định', { exact: true })
    .fill('123 Nguyễn Huệ, TP. Hồ Chí Minh');
  await picker.getByRole('button', { name: 'Vị trí hiện tại', exact: true }).click();
  await expect(picker).toContainText('10.776900, 106.700900');
  await picker.getByRole('button', { name: 'Xem vị trí trên bản đồ' }).click();
  const map = page.getByRole('region', { name: 'Bản đồ địa chỉ' });
  await expect(map.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
  await expect(map.locator('path.leaflet-interactive')).toHaveCount(1);
  await map.click({ position: { x: 220, y: 120 } });
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(page.getByLabel('Địa chỉ mặc định', { exact: true })).toBeDisabled();
  const saved = await picker.getByRole('status').textContent();
  await page.reload();
  await expect(picker.getByRole('status')).toHaveText(saved!);
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin' }).click();
  await page.getByLabel('Địa chỉ mặc định', { exact: true }).fill('Địa chỉ khác chưa lưu');
  await expect(picker).toContainText('Chưa chọn vị trí trên bản đồ.');
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(picker.getByRole('status')).toHaveText(saved!);
  await page.goto('/products/iphone-16-pro-max');
  await page.getByRole('button', { name: '256GB', exact: true }).click();
  await page.getByRole('button', { name: 'Titan Tự Nhiên', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true }).click();
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Tiến hành đặt hàng' }).click();
  await expect(picker.getByRole('status')).toHaveText(saved!);
  await page
    .getByRole('combobox', { name: 'Địa chỉ nhận hàng', exact: true })
    .fill('456 Lê Lợi, TP. Hồ Chí Minh');
  await expect(picker).toContainText('Chưa chọn vị trí trên bản đồ.');
  await picker.getByRole('button', { name: 'Vị trí hiện tại', exact: true }).click();
  await expect(picker).toContainText('10.776900, 106.700900');
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true })).toBeVisible();
  await picker.getByRole('button', { name: 'Xem vị trí trên bản đồ' }).click();
  await expect(map.locator('.leaflet-control-attribution')).toBeVisible();
  await map.click({ position: { x: 240, y: 110 } });
  await expect(page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('path.leaflet-interactive')).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/checkout-map-mobile.png', fullPage: true });
  const shippingPoint = await picker.getByRole('status').textContent();
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click();
  await page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\//);
  await expect(picker.getByRole('status')).toHaveText(shippingPoint!);
  await expect(picker.getByRole('button', { name: 'Vị trí hiện tại', exact: true })).toHaveCount(0);
});
test('Guest signs in before AI and keeps the requested topic and product context', async ({
  page,
}) => {
  const destination = '/ai?topic=PHONE_CONSULTATION&productIds=iphone-16-pro-max';
  await page.goto(destination);
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email', { exact: true }).fill('customer@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(
    new RegExp('/ai\\?topic=PHONE_CONSULTATION&productIds=iphone-16-pro-max$'),
  );
  await expect(page.locator('.topic-grid .topic-card')).toHaveCount(2);
});
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
    .getByRole('combobox', { name: 'Địa chỉ nhận hàng', exact: true })
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
test('phone consultation shows a scope reminder for unrelated questions and continues the same chat', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await login(page);
  await page.goto('/ai');
  await page.getByRole('button', { name: /Tư vấn mua điện thoại/ }).click();
  await expect(page).toHaveURL(/\/ai\/conversations\//);
  const url = page.url();
  const input = page.getByLabel('Nhập câu hỏi cho trợ lý AI');
  await input.fill('Thời tiết hôm nay thế nào?');
  await input.press('Enter');
  await expect(page.locator('.message.assistant')).toHaveCount(1);
  await expect(page.locator('.message.assistant')).toContainText(
    'Mình chỉ hỗ trợ tư vấn về điện thoại',
  );
  await expect(page.locator('.message.assistant .product-card')).toHaveCount(0);
  await expect(page.locator('.message.assistant .source-card')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(input).toBeEnabled();
  await input.fill('Tư vấn điện thoại pin tốt');
  await input.press('Enter');
  await expect(page.locator('.message.user')).toHaveCount(2);
  await expect(page.locator('.message.assistant')).toHaveCount(2);
  await expect(
    page.locator('.message.assistant').last().locator('.chat-product').first(),
  ).toBeVisible();
  await expect(page).toHaveURL(url);
  await page.reload();
  await expect(page.locator('.message.assistant').first()).toContainText(
    'Mình chỉ hỗ trợ tư vấn về điện thoại',
  );
  await expect(page.locator('.message.user')).toHaveCount(2);
});

test('unified AI confirms topic switch without resending the question', async ({ page }) => {
  await login(page);
  await page.goto('/ai');
  await expect(page.locator('.topic-grid .topic-card')).toHaveCount(2);
  await expect(page.locator('footer')).toHaveCount(0);
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

test('customer edits profile explicitly and email stays locked', async ({ page }) => {
  await login(page);
  await page.goto('/profile');
  const name = page.getByLabel('Họ và tên', { exact: true });
  const phone = page.getByLabel('Số điện thoại', { exact: true });
  const email = page.getByLabel('Email', { exact: true });
  const original = await name.inputValue();
  await expect(name).toBeDisabled();
  await expect(phone).toBeDisabled();
  await expect(email).toBeDisabled();
  await page.screenshot({ path: 'test-results/profile-view.png', fullPage: true });
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin' }).click();
  await expect(name).toBeEnabled();
  await expect(phone).toBeEnabled();
  await expect(email).toBeDisabled();
  await name.fill('Tên chưa lưu');
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(name).toHaveValue(original);
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin' }).click();
  await name.fill('Khách cập nhật');
  await phone.fill('0912345678');
  await page.screenshot({ path: 'test-results/profile-edit.png', fullPage: true });
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(
    page.locator('.toast').filter({ hasText: 'Đã cập nhật thông tin tài khoản.' }),
  ).toHaveCount(1);
  await expect(name).toBeDisabled();
  await page.reload();
  await expect(name).toHaveValue('Khách cập nhật');
  await expect(phone).toHaveValue('0912345678');
  await expect(email).toHaveValue('customer@demo.vn');
});

test('customer cancels deletion, deletes another chat then deletes the active chat', async ({
  page,
}) => {
  await login(page);
  await page.goto('/ai');
  await page.getByRole('button', { name: /Tư vấn mua điện thoại/ }).click();
  await expect(page).toHaveURL(/\/ai\/conversations\//);
  const firstUrl = page.url();
  await page.getByRole('link', { name: 'Cuộc trò chuyện mới', exact: true }).click();
  await expect(page).toHaveURL(/\/ai$/);
  await page.getByRole('button', { name: /Hỗ trợ cửa hàng/ }).click();
  await expect(page).toHaveURL(/\/ai\/conversations\//);
  const currentUrl = page.url();
  const rows = page.locator('.chat-history-row');
  await expect(rows).toHaveCount(2);
  const other = rows.filter({ has: page.locator(`a[href="${new URL(firstUrl).pathname}"]`) });
  await other.getByRole('button', { name: /Xóa cuộc trò chuyện/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Xóa cuộc trò chuyện' });
  await page.screenshot({ path: 'test-results/chat-delete-confirm.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Quay lại' }).click();
  await expect(rows).toHaveCount(2);
  await other.getByRole('button', { name: /Xóa cuộc trò chuyện/ }).click();
  await dialog.getByRole('button', { name: 'Xóa cuộc trò chuyện', exact: true }).click();
  await expect(rows).toHaveCount(1);
  await expect(page).toHaveURL(currentUrl);
  await expect(page.locator('.toast').filter({ hasText: 'Đã xóa cuộc trò chuyện.' })).toHaveCount(
    1,
  );
  await rows.getByRole('button', { name: /Xóa cuộc trò chuyện/ }).click();
  await dialog.getByRole('button', { name: 'Xóa cuộc trò chuyện', exact: true }).click();
  await expect(page).toHaveURL(/\/ai$/);
  await expect(rows).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Chưa có cuộc trò chuyện nào.')).toBeVisible();
});

test('admin stays in the portal and has personal settings there', async ({ page }) => {
  await login(page, true);
  for (const path of ['/products', '/cart', '/ai', '/profile', '/login']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin$/);
  }
  await page.goto('/admin/profile');
  await expect(page.getByRole('heading', { name: 'Thông tin tài khoản' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cửa hàng', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Địa chỉ mặc định', { exact: true })).toHaveCount(0);
  await expect(page.locator('.location-picker')).toHaveCount(0);
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin', exact: true }).click();
  await expect(page.getByLabel('Địa chỉ mặc định', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Vị trí hiện tại', exact: true })).toHaveCount(0);
  await page.getByLabel('Họ và tên', { exact: true }).fill('Quản trị viên kiểm thử');
  await expect(page.getByLabel('Số điện thoại', { exact: true })).not.toHaveAttribute('required');
  await page.getByLabel('Số điện thoại', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(page.getByText('Đã cập nhật thông tin tài khoản.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Quản trị viên kiểm thử');
  await expect(page.getByLabel('Số điện thoại', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Email', { exact: true })).toBeDisabled();
  await expect(page.locator('.location-picker')).toHaveCount(0);
});

test('comparison opens unified phone advice with selected products', async ({ page }) => {
  await login(page);
  await page.goto('/products');
  await page
    .getByRole('button', { name: /Thêm .* vào so sánh/ })
    .first()
    .click();
  await page
    .getByRole('button', { name: /Thêm .* vào so sánh/ })
    .first()
    .click();
  await page.getByRole('link', { name: 'So sánh', exact: true }).click();
  await page.getByRole('link', { name: 'So sánh cùng AI' }).click();
  await expect(page).toHaveURL(/topic=PHONE_CONSULTATION/);
  await expect(page.locator('.topic-grid .topic-card')).toHaveCount(2);
  await page.getByRole('button', { name: /Tư vấn mua điện thoại/ }).click();
  await page.getByLabel('Nhập câu hỏi cho trợ lý AI').fill('So sánh hai máy đã chọn.');
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
  await expect(page.locator('.message.assistant table')).toBeVisible();
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
    page.getByText(/Chế độ demo: đã mô phỏng kiểm tra kết nối/),
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
  await expect(page.getByRole('heading', { name: /Điện thoại phù hợp/ })).toBeVisible();
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

test('comparison picker pages through products and resets paging on search', async ({ page }) => {
  await page.goto('/compare');
  await page.getByRole('button', { name: 'Chọn điện thoại', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Trang 1 / 2')).toBeVisible();
  await dialog.getByRole('button', { name: 'Sau', exact: true }).click();
  await expect(dialog.getByText('Trang 2 / 2')).toBeVisible();
  await expect(dialog.getByText('vivo X100 Pro')).toBeVisible();
  await dialog.getByLabel('Tìm máy so sánh').fill('iPhone');
  await expect(dialog.getByText('iPhone 16 Pro Max')).toBeVisible();
});

test('admin manages multiple backup keys with priority, single delete and individual testing on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, true);
  await page.goto('/admin/ai-settings');
  async function addKey(name: string, secret: string) {
    await page.getByRole('button', { name: 'Thêm key dự phòng', exact: true }).click();
    const modal = page.getByRole('dialog');
    await modal.getByLabel('Tên key', { exact: true }).fill(name);
    const input = modal.getByLabel('API key mới', { exact: true });
    await expect(input).toHaveAttribute('type', 'password');
    await input.fill(secret);
    await modal.getByRole('button', { name: 'Áp dụng vào bản nháp' }).click();
  }
  await addKey('Project A', 'backup-test-secret-a');
  await addKey('Project B', 'backup-test-secret-b');
  const list = page.getByRole('region', { name: 'Danh sách key dự phòng' });
  await expect(list).toContainText('Key dự phòng (2/10)');
  await expect(page.getByRole('button', { name: 'Kiểm tra Project A', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Tăng ưu tiên Project B', exact: true }).click();
  await expect(list.locator('li').first()).toContainText('Project B');
  await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Kiểm tra Project B', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Kiểm tra Project B', exact: true }).click();
  await expect(list.locator('li').first()).toContainText('Hoạt động');
  await page.reload();
  await expect(list.locator('li').first()).toContainText('Project B');
  const stored = await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }));
  expect(stored).not.toContain('backup-test-secret');
  await page.getByRole('button', { name: 'Thay Project B', exact: true }).click();
  await page.getByRole('dialog').getByLabel('API key mới', { exact: true }).fill('replacement-secret');
  await page.getByRole('dialog').getByRole('button', { name: 'Áp dụng vào bản nháp' }).click();
  await page.getByRole('button', { name: 'Xóa Project A', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa key', exact: true }).click();
  await expect(list.locator('li')).toHaveCount(1);
  await expect(list).toContainText('Project B');
  await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Kích hoạt', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }))).not.toContain('replacement-secret');
  await page.getByRole('button', { name: 'Kích hoạt', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đang hoạt động', exact: true })).toBeVisible();
  await expect(page.locator('.toast')).toHaveCount(0);
  await page.getByRole('heading', { name: 'Cấu hình nền tảng Chat AI', exact: true }).click();
  await page.screenshot({ path: 'test-results/admin-ai-keys-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/admin-ai-keys-desktop.png', fullPage: true });
});

test('admin switches the chat platform from Gemini to Groq and back', async ({ page }) => {
  await login(page, true);
  await page.goto('/admin/ai-settings');
  const platforms = page.getByRole('group', { name: 'Chọn nền tảng Chat AI' });
  await expect(platforms.getByRole('button')).toHaveCount(3);
  await platforms.getByRole('button', { name: /Groq/ }).click();
  await expect(page.getByRole('heading', { name: 'Cấu hình chi tiết — Groq' })).toBeVisible();
  await expect(page.getByLabel('Chat Model')).toHaveValue('llama-3.3-70b-versatile');
  await expect(page.getByRole('region', { name: 'Quota Gemini theo project' })).toHaveCount(0);
  await page.getByPlaceholder('Nhập khóa mới khi cần thay đổi').fill('gsk-demo-secret');
  await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
  await page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true }).click();
  await page.getByRole('button', { name: 'Kích hoạt', exact: true }).click();
  await page.getByRole('dialog', { name: 'Kích hoạt Groq?' }).getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đang hoạt động', exact: true })).toBeVisible();
  await expect(platforms.getByRole('button', { name: /Groq/ })).toContainText('Đang hoạt động: llama-3.3-70b-versatile');
  await expect(platforms.getByRole('button', { name: /Google Gemini/ })).not.toContainText('Đang hoạt động');
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }))).not.toContain('gsk-demo-secret');
  await platforms.getByRole('button', { name: /Google Gemini/ }).click();
  await expect(page.getByRole('heading', { name: 'Cấu hình chi tiết — Google Gemini' })).toBeVisible();
  await page.getByRole('button', { name: 'Kích hoạt', exact: true }).click();
  await page.getByRole('dialog', { name: 'Kích hoạt Google Gemini?' }).getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(platforms.getByRole('button', { name: /Google Gemini/ })).toContainText('Đang hoạt động');
  await expect(platforms.getByRole('button', { name: /Groq/ })).not.toContainText('Đang hoạt động');
});

test('AI settings polling preserves unsaved model and backup drafts', async ({ page }) => {
  await page.clock.install();
  await login(page, true);
  await page.goto('/admin/ai-settings');
  await page.getByLabel('Chat Model').fill('gemini-draft-model');
  await page.getByRole('button', { name: 'Thêm key dự phòng', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Tên key', { exact: true }).fill('Draft project');
  await page.getByRole('dialog').getByLabel('API key mới', { exact: true }).fill('unsaved-secret');
  await page.getByRole('dialog').getByRole('button', { name: 'Áp dụng vào bản nháp' }).click();
  await page.clock.fastForward(16_000);
  await page.clock.runFor(500);
  await expect(page.getByLabel('Chat Model')).toHaveValue('gemini-draft-model');
  await expect(page.getByRole('region', { name: 'Danh sách key dự phòng' })).toContainText('Draft project');
  await expect(page.getByRole('button', { name: 'Kiểm tra Draft project', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }))).not.toContain('unsaved-secret');
});

test('activation confirmation rejects a configuration changed by another admin', async ({ page }) => {
  await login(page, true);
  await page.goto('/admin/ai-settings');
  await page.getByLabel('Chat Model').fill('gemini-reviewed');
  await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true }).click();
  await page.getByRole('button', { name: 'Kích hoạt', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Kích hoạt Google Gemini?' });
  await expect(dialog).toContainText('gemini-reviewed');
  await page.evaluate(async modulePath => {
    const { api } = await import(modulePath);
    const current = (await api.aiSettings())[0];
    const saved = await api.saveAiSettings({ provider: 'GEMINI', configId: current.id, model: 'gemini-concurrent', backupKeys: [] });
    await api.testAiConnection({ provider: 'GEMINI', configId: saved.id, model: saved.model });
  }, '/src/shared/api/index.ts');
  await dialog.getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(dialog).toContainText('Cấu hình đã thay đổi');
  const saved = await page.evaluate(() => JSON.parse(sessionStorage.getItem('smai-demo-settings')!));
  expect(saved[0]).toMatchObject({ model: 'gemini-concurrent', active: false });
});

test('AI notifications stay outside customer pages', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('button', { name: /Thông báo AI/ })).toHaveCount(0);
});

test('registration shows password strength and enforces eight characters', async ({ page }) => {
  await page.goto('/register');
  const password = page.getByLabel('Mật khẩu (tối thiểu 8 ký tự)', { exact: true });
  const meter = page.getByRole('meter', { name: 'Độ mạnh mật khẩu' });
  await password.fill('Ab1!xyz');
  await expect(meter).toHaveAttribute('aria-valuetext', 'Yếu');
  expect(
    await password.evaluate((input: HTMLInputElement) => input.validity.tooShort),
  ).toBeTruthy();
  await password.fill('Abcd1234');
  await expect(meter).toHaveAttribute('aria-valuetext', 'Trung bình');
  expect(await password.evaluate((input: HTMLInputElement) => input.validity.tooShort)).toBeFalsy();
  await password.fill('LongTest123!');
  await expect(meter).toHaveAttribute('aria-valuetext', 'Mạnh');
  await password.fill('');
  await expect(meter).toHaveCount(0);
  await page.goto('/login');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('LongTest123!');
  await expect(page.getByRole('meter')).toHaveCount(0);
});
test('floating assistant chats from any page and remembers the chosen outfit', async ({ page }) => {
  await login(page);
  await page.goto('/products');
  await page.getByRole('button', { name: 'Mở trợ lý AI' }).click();
  const panel = page.getByRole('dialog', { name: 'Trợ lý SmartPhone AI' });
  await panel.getByLabel('Nhập câu hỏi cho trợ lý AI').fill('Tư vấn điện thoại pin tốt');
  await panel.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
  await expect(panel.locator('.message.assistant .chat-product').first()).toBeVisible();
  await panel.getByRole('button', { name: 'Đổi trang phục trợ lý' }).click();
  await panel.getByRole('radio', { name: /FPT University/ }).click();
  await expect(panel.getByRole('radio', { name: /FPT University/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.reload();
  await page.getByRole('button', { name: 'Mở trợ lý AI' }).click();
  await expect(page.locator('.ai-widget .message.user')).toHaveText('Tư vấn điện thoại pin tốt');
  await page.getByRole('button', { name: 'Đổi trang phục trợ lý' }).click();
  await expect(page.getByRole('radio', { name: /FPT University/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.goto('/ai');
  await expect(page.locator('.ai-widget')).toHaveCount(0);
});
