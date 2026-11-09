import { expect, test, type Page } from '@playwright/test';

async function recoveryFixture(page: Page) {
  const confirmations: Record<string, string>[] = [];
  await page.route(/^http:\/\/127\.0\.0\.1:15173\/api\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/csrf') return route.fulfill({ json: { token: 'reset-csrf' } });
    if (path === '/api/users/me')
      return route.fulfill({ status: 401, json: { message: 'Unauthenticated' } });
    if (path === '/api/maintenance') return route.fulfill({ json: { enabled: false } });
    if (path === '/api/auth/password-reset')
      return route.fulfill({ status: 202, json: { challengeId: 'reset-challenge' } });
    if (path === '/api/auth/otp/resend') return route.fulfill({ status: 202, json: {} });
    if (path === '/api/auth/password-reset/verify') {
      return route.request().postDataJSON().code === '123456'
        ? route.fulfill({
            json: {
              resetToken: 'verified-reset-token',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          })
        : route.fulfill({
            status: 409,
            json: { code: 'INVALID_OTP', message: 'Mã không hợp lệ hoặc đã hết hạn' },
          });
    }
    if (
      path === '/api/auth/password-reset/confirm' ||
      path === '/api/auth/account-invitations/accept'
    ) {
      confirmations.push(route.request().postDataJSON());
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/forgot-password');
  return confirmations;
}

test('password recovery requires successful OTP verification before displaying passwords', async ({
  page,
}) => {
  const confirmations = await recoveryFixture(page);
  await page.getByLabel('Email', { exact: true }).fill('customer@example.com');
  await page.getByRole('button', { name: 'Gửi mã xác minh', exact: true }).click();
  await expect(page.getByLabel('Mã OTP', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('verify-otp.png') });
  await page.getByLabel('Mã OTP', { exact: true }).fill('999999');
  await page.getByRole('button', { name: 'Xác thực OTP', exact: true }).click();
  await expect(page.getByLabel('Mã OTP', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Mã không hợp lệ hoặc đã hết hạn').first()).toBeVisible();
  expect(confirmations).toHaveLength(0);
  await page.getByRole('button', { name: 'Gửi lại mã', exact: true }).click();
  await expect(page.getByLabel('Mã OTP', { exact: true })).toHaveValue('');
  await page.getByLabel('Mã OTP', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Xác thực OTP', exact: true }).click();
  await expect(page.getByLabel('Mã OTP', { exact: true })).toHaveCount(0);
  const password = page.getByLabel('Mật khẩu mới', { exact: true });
  const confirmation = page.getByLabel('Xác nhận mật khẩu', { exact: true });
  await expect(password).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('new-password.png') });
  await expect(password).toHaveAttribute('minlength', '8');
  await password.fill('NewPassword123!');
  await confirmation.fill('DifferentPassword123!');
  await page.getByRole('button', { name: 'Hiện mật khẩu mới', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu mới', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Hiện xác nhận mật khẩu', exact: true }).click();
  await expect(confirmation).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(page.getByText('Xác nhận mật khẩu chưa khớp.').first()).toBeVisible();
  expect(confirmations).toHaveLength(0);
  await confirmation.fill('NewPassword123!');
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã cập nhật mật khẩu.' })).toBeVisible();
  expect(confirmations).toEqual([
    {
      challengeId: 'reset-challenge',
      resetToken: 'verified-reset-token',
      newPassword: 'NewPassword123!',
    },
  ]);
});

test('short passwords stay blocked and expired authorization can restart with a new email', async ({
  page,
}) => {
  const confirmations = await recoveryFixture(page);
  await page.getByLabel('Email', { exact: true }).fill('customer@example.com');
  await page.getByRole('button', { name: 'Gửi mã xác minh', exact: true }).click();
  await page.getByLabel('Mã OTP', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Xác thực OTP', exact: true }).click();
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('short');
  await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill('short');
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  expect(confirmations).toHaveLength(0);
  expect(
    await page
      .getByLabel('Mật khẩu mới', { exact: true })
      .evaluate((element) => (element as HTMLInputElement).validity.tooShort),
  ).toBe(true);
  await page.route('**/api/auth/password-reset/confirm', (route) =>
    route.fulfill({
      status: 409,
      json: { code: 'INVALID_PASSWORD_RESET', message: 'Quyền đặt lại mật khẩu đã hết hạn.' },
    }),
  );
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('ValidPassword123!');
  await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill('ValidPassword123!');
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(page.getByText('Quyền đặt lại mật khẩu đã hết hạn.').first()).toBeVisible();
  await page.getByRole('button', { name: 'Yêu cầu mã xác minh mới', exact: true }).click();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveCount(0);
  await page.getByLabel('Email', { exact: true }).fill('other@example.com');
  await page.getByRole('button', { name: 'Gửi mã xác minh', exact: true }).click();
  await expect(page.getByLabel('Mã OTP', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Đổi email', exact: true }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('other@example.com');
});

test('invited accounts retain activation with independent password visibility controls', async ({
  page,
}) => {
  const confirmations = await recoveryFixture(page);
  await page.goto('/account/invite?token=invitation-token');
  await expect(page.getByLabel('Mã OTP', { exact: true })).toHaveCount(0);
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('InvitedPassword123!');
  await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill('InvitedPassword123!');
  await page.getByRole('button', { name: 'Hiện mật khẩu mới', exact: true }).click();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveAttribute('type', 'text');
  await expect(page.getByLabel('Xác nhận mật khẩu', { exact: true })).toHaveAttribute(
    'type',
    'password',
  );
  await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã cập nhật mật khẩu.' })).toBeVisible();
  expect(confirmations).toEqual([{ token: 'invitation-token', password: 'InvitedPassword123!' }]);
});
