import { test, expect, type Page } from '@playwright/test';

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

async function setup(page: Page) {
  let user = {
    id: 'map-customer',
    fullName: 'Khách bản đồ',
    email: 'map@example.com',
    phone: '0900000000',
    address: 'Địa chỉ đã lưu',
    role: 'CUSTOMER',
    location: { latitude: 10.7769, longitude: 106.7009 },
  };
  const requests: {
    point: { latitude: number; longitude: number };
    response: ReturnType<typeof gate>;
    served: ReturnType<typeof gate>;
    status: number;
    body: unknown;
  }[] = [];
  const saves: (typeof user)[] = [];
  await page
    .context()
    .addCookies([{ name: 'XSRF-TOKEN', value: 'map-test', url: 'http://127.0.0.1:15173' }]);
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#eef2e8"/></svg>',
    }),
  );
  await page.route(/^http:\/\/127\.0\.0\.1:15173\/api\//, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/users/me') {
      if (route.request().method() === 'PUT') {
        user = { ...user, ...route.request().postDataJSON() };
        saves.push(user);
      }
      return route.fulfill({ json: user });
    }
    if (url.pathname === '/api/cart') return route.fulfill({ json: { items: [], total: 0 } });
    if (url.pathname === '/api/maintenance') return route.fulfill({ json: { enabled: false } });
    if (url.pathname === '/api/locations/autocomplete') return route.fulfill({ json: [] });
    if (url.pathname === '/api/locations/reverse') {
      const request = {
        point: {
          latitude: Number(url.searchParams.get('latitude')),
          longitude: Number(url.searchParams.get('longitude')),
        },
        response: gate(),
        served: gate(),
        status: 200,
        body: {
          label: `Địa chỉ điểm ${requests.length + 1}`,
          location: { latitude: 0, longitude: 0 },
        } as unknown,
      };
      requests.push(request);
      try {
        await request.response.promise;
        await route.fulfill({ status: request.status, json: request.body });
      } finally {
        request.served.release();
      }
      return;
    }
    return route.fulfill({ status: 404, json: { message: 'Unexpected map fixture API' } });
  });
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Chỉnh sửa thông tin', exact: true }).click();
  await page.getByRole('button', { name: 'Xem vị trí trên bản đồ', exact: true }).click();
  const map = page.getByRole('region', { name: 'Bản đồ địa chỉ' });
  await expect(map.locator('.leaflet-control-attribution')).toBeVisible();
  return {
    requests,
    saves,
    map,
    address: page.getByRole('combobox', { name: 'Địa chỉ mặc định', exact: true }),
  };
}

test('real adapter resolves the selected map point and prevents saving an outdated address while waiting', async ({
  page,
}) => {
  const { map, requests, saves, address } = await setup(page);
  await map.click({ position: { x: 205, y: 120 } });
  await expect.poll(() => requests.length).toBe(1);
  const selected = requests[0].point;
  await expect(address).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toBeDisabled();
  await expect(
    page.getByText('Đang lấy địa chỉ theo vị trí đã chọn…', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Họ và tên', { exact: true }).press('Enter');
  expect(saves).toHaveLength(0);
  requests[0].response.release();
  await expect(address).toHaveValue('Địa chỉ điểm 1');
  await expect(page.locator('.location-picker')).toContainText(
    `${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}`,
  );
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(address).toBeDisabled();
  expect(saves[0].location).toEqual(selected);
  expect(saves[0].address).toBe('Địa chỉ điểm 1');
  await page.reload();
  await expect(address).toHaveValue('Địa chỉ điểm 1');
});

test('new map points, manual address edits and profile cancellation reject delayed address responses', async ({
  page,
}) => {
  const { map, requests, address } = await setup(page);
  await map.click({ position: { x: 205, y: 120 } });
  await expect.poll(() => requests.length).toBe(1);
  await map.click({ position: { x: 320, y: 180 } });
  await expect.poll(() => requests.length).toBe(2);
  requests[1].response.release();
  await expect(address).toHaveValue('Địa chỉ điểm 2');
  requests[0].response.release();
  await requests[0].served.promise;
  await expect(address).toHaveValue('Địa chỉ điểm 2');
  await map.click({ position: { x: 210, y: 125 } });
  await expect.poll(() => requests.length).toBe(3);
  await address.fill('Địa chỉ tự nhập sau khi chọn điểm');
  requests[2].response.release();
  await requests[2].served.promise;
  await expect(address).toHaveValue('Địa chỉ tự nhập sau khi chọn điểm');
  await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toBeEnabled();
  await map.click({ position: { x: 285, y: 155 } });
  await expect.poll(() => requests.length).toBe(4);
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  requests[3].response.release();
  await requests[3].served.promise;
  await expect(address).toBeDisabled();
  await expect(address).toHaveValue('Địa chỉ đã lưu');
  await expect(page.locator('.location-picker')).toContainText('10.776900, 106.700900');
});

test('a stalled reverse lookup times out and releases the save button', async ({ page }) => {
  const { map, requests, address } = await setup(page);
  await map.click({ position: { x: 205, y: 120 } });
  await expect.poll(() => requests.length).toBe(1);
  await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toBeDisabled();
  await expect(page.locator('.toast-error')).toContainText('Chưa lấy được địa chỉ', {
    timeout: 15000,
  });
  await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toBeEnabled();
  requests[0].response.release();
  await requests[0].served.promise;
  await expect(address).toHaveValue('');
});

for (const outcome of ['unavailable', 'empty', 'long label']) {
  test(`reverse lookup ${outcome} lets the customer enter an address manually`, async ({
    page,
  }) => {
    const { map, requests, address } = await setup(page);
    await map.click({ position: { x: 205, y: 120 } });
    await expect.poll(() => requests.length).toBe(1);
    const request = requests[0];
    request.status = outcome === 'unavailable' ? 503 : 200;
    request.body =
      outcome === 'unavailable'
        ? { code: 'LOCATION_SEARCH_UNAVAILABLE', message: 'Unavailable' }
        : outcome === 'empty'
          ? null
          : { label: 'x'.repeat(256) };
    request.response.release();
    await expect(page.locator('.toast-error')).toContainText(
      outcome === 'unavailable' ? 'Chưa lấy được địa chỉ' : 'Chưa tìm được địa chỉ',
    );
    await expect(address).toHaveValue('');
    await expect(address).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toBeEnabled();
    await address.fill('123 Địa chỉ nhập thủ công');
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await expect(address).toBeDisabled();
    await page.reload();
    await expect(address).toHaveValue('123 Địa chỉ nhập thủ công');
  });
}
