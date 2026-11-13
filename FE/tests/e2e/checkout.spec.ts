import { expect, test, type Page } from '@playwright/test';

async function openCheckout(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('customer@demo.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/products/iphone-16-pro-max');
  await page.getByRole('button', { name: '256GB', exact: true }).click();
  await page.getByRole('button', { name: 'Titan Tự Nhiên', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true }).click();
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Tiến hành đặt hàng' }).click();
  await page
    .getByRole('combobox', { name: 'Địa chỉ nhận hàng', exact: true })
    .fill('123 Nguyễn Huệ, TP. Hồ Chí Minh');
}

test('one Đặt mua click checks the server and places the order', async ({ page }) => {
  await openCheckout(page);
  await page.getByRole('button', { name: 'Đặt mua', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/SMAI-/);
  await expect(page.getByText(/Đặt hàng thành công!/)).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('smai-demo-orders') || '[]').length,
    ),
  ).toBe(1);
  expect(
    await page.evaluate(() => sessionStorage.getItem('smartphone-ai-pending-order')),
  ).toBeNull();
});

test('a price change updates the displayed total before another Đặt mua click places the order', async ({
  page,
}) => {
  await openCheckout(page);
  const previousTotal = await page.locator('.summary-total strong').textContent();
  // Change the real demo backend after checkout has rendered its cart snapshot.
  await page.evaluate(async () => {
    const modulePath = '/src/shared/api/index.ts';
    const { api } = await import(modulePath);
    const cart = await api.cart();
    const product = structuredClone(cart.items[0].product);
    product.variants.find(
      (variant: { id: string }) => variant.id === cart.items[0].variantId,
    ).price += 100000;
    await api.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    await api.saveProduct(product, false);
    await api.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
  });
  await page.getByRole('button', { name: 'Đặt mua', exact: true }).click();
  await expect(page.locator('.summary [role="alert"]')).toBeVisible();
  await expect(page.locator('.summary-total strong')).not.toHaveText(previousTotal!);
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('smai-demo-orders') || '[]').length,
    ),
  ).toBe(0);
  await page.getByRole('button', { name: 'Đặt mua', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/SMAI-/);
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('smai-demo-orders') || '[]').length,
    ),
  ).toBe(1);
});

test('a lost placement response retries the saved request and creates one order', async ({
  page,
}) => {
  await openCheckout(page);
  await page.evaluate(async () => {
    const modulePath = '/src/shared/api/index.ts';
    const errorPath = '/src/shared/api/httpClient.ts';
    const { api } = await import(modulePath);
    const { ApiError } = await import(errorPath);
    const placeOrder = api.placeOrder;
    let dropResponse = true;
    api.placeOrder = async (...args: Parameters<typeof placeOrder>) => {
      const order = await placeOrder(...args);
      if (dropResponse) {
        dropResponse = false;
        throw new ApiError(0, 'Mất kết nối sau khi gửi đơn hàng.');
      }
      return order;
    };
  });
  await page.getByRole('button', { name: 'Đặt mua', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Thử lại xác nhận', exact: true })).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Họ tên người nhận', exact: true }),
  ).toBeDisabled();
  const attempt = await page.evaluate(() => sessionStorage.getItem('smartphone-ai-pending-order'));
  expect(attempt).toBeTruthy();
  await page.getByRole('button', { name: 'Thử lại xác nhận', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/SMAI-/);
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('smai-demo-orders') || '[]').length,
    ),
  ).toBe(1);
  expect(
    await page.evaluate(() => sessionStorage.getItem('smartphone-ai-pending-order')),
  ).toBeNull();
});

test('a price change during placement refreshes the total before the next Đặt mua click', async ({
  page,
}) => {
  await openCheckout(page);
  const previousTotal = await page.locator('.summary-total strong').textContent();
  await page.evaluate(async () => {
    const modulePath = '/src/shared/api/index.ts';
    const { api } = await import(modulePath);
    const placeOrder = api.placeOrder;
    api.placeOrder = async (...args: Parameters<typeof placeOrder>) => {
      api.placeOrder = placeOrder;
      const cart = await api.cart();
      const product = structuredClone(cart.items[0].product);
      product.variants.find(
        (variant: { id: string }) => variant.id === cart.items[0].variantId,
      ).price += 100000;
      await api.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
      await api.saveProduct(product, false);
      await api.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
      return placeOrder(...args);
    };
  });
  await page.getByRole('button', { name: 'Đặt mua', exact: true }).click();
  await expect(page.locator('.summary-total strong')).not.toHaveText(previousTotal!);
  await expect(page.getByRole('button', { name: 'Đặt mua', exact: true })).toBeEnabled();
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('smai-demo-orders') || '[]').length,
    ),
  ).toBe(0);
  expect(
    await page.evaluate(() => sessionStorage.getItem('smartphone-ai-pending-order')),
  ).toBeNull();
  await page.getByRole('button', { name: 'Đặt mua', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/SMAI-/);
});

test('server stock validation prevents placing a product that became unavailable', async ({
  page,
}) => {
  await openCheckout(page);
  await page.evaluate(async () => {
    const modulePath = '/src/shared/api/index.ts';
    const { api } = await import(modulePath);
    const cart = await api.cart();
    await api.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    await api.productStatus(cart.items[0].product.id, 'INACTIVE');
    await api.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
  });
  await page.getByRole('button', { name: 'Đặt mua', exact: true }).click();
  await expect(page.locator('.summary [role="alert"]')).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('smai-demo-orders') || '[]').length,
    ),
  ).toBe(0);
  expect(
    await page.evaluate(() => sessionStorage.getItem('smartphone-ai-pending-order')),
  ).toBeNull();
});
