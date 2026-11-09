import { test, expect, type Page } from '@playwright/test';

const customer = {
  id: 'chat-presentation-customer',
  fullName: 'Khách kiểm thử',
  email: 'chat@example.com',
  phone: '0900000000',
  address: '',
  role: 'CUSTOMER',
};
const answer =
  'Gemini tư vấn điện thoại dựa trên nhu cầu sử dụng, ngân sách và dữ liệu sản phẩm. '.repeat(6);
const conversationId = 'chat-presentation';
type Message = { id: string; role: 'user' | 'assistant'; content: string };

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

async function chatFixture(
  page: Page,
  options: {
    failFirst?: boolean;
    reducedMotion?: boolean;
    lostSwitch?: boolean;
    unknownFirstFailure?: boolean;
  } = {},
) {
  const responseGate = gate();
  let requests = 0;
  const messages: Message[] = [];
  let pendingSwitch: object | undefined;
  await page
    .context()
    .addCookies([
      { name: 'XSRF-TOKEN', value: 'presentation-token', url: 'http://127.0.0.1:15173' },
    ]);
  if (options.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  const conversation = () => ({
    id: conversationId,
    topic: 'PHONE_CONSULTATION',
    title: 'Tư vấn',
    messages,
    pendingSwitch,
  });
  await page.route(/^http:\/\/127\.0\.0\.1:15173\/api\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/users/me') return route.fulfill({ json: customer });
    if (path === '/api/maintenance') return route.fulfill({ json: { enabled: false } });
    if (path === '/api/auth/csrf') return route.fulfill({ json: { token: 'presentation-token' } });
    if (path === '/api/cart') return route.fulfill({ json: { items: [], total: 0 } });
    if (path === '/api/ai/conversations') return route.fulfill({ json: [conversation()] });
    if (path === `/api/ai/conversations/${conversationId}`)
      return route.fulfill({ json: conversation() });
    if (path === '/api/ai/topic-switches/recovered-switch/cancel') {
      pendingSwitch = undefined;
      return route.fulfill({ status: 204 });
    }
    if (path === `/api/ai/conversations/${conversationId}/messages`) {
      requests++;
      await responseGate.promise;
      const content = route.request().postDataJSON().content;
      if (options.lostSwitch && requests === 1) {
        messages.push({ id: 'saved-switch-user', role: 'user', content });
        pendingSwitch = {
          type: 'SWITCH_REQUIRED',
          switchRequestId: 'recovered-switch',
          currentTopic: 'PHONE_CONSULTATION',
          suggestedTopic: 'SHOP_SUPPORT',
          message: 'Chuyển sang hỗ trợ cửa hàng?',
        };
        return route.abort('connectionreset');
      }
      if (options.unknownFirstFailure && requests === 1)
        return route.fulfill({ status: 502, json: { message: 'Gateway chưa nhận được kết quả.' } });
      if (options.failFirst && requests === 1)
        return route.fulfill({
          status: 503,
          json: { code: 'AI_PROVIDER_BUSY', message: 'Gemini đang bận kiểm thử.' },
        });
      messages.push(
        { id: `saved-user-${requests}`, role: 'user', content },
        { id: `saved-assistant-${requests}`, role: 'assistant', content: answer },
      );
      return route.fulfill({
        json: {
          type: 'ANSWER',
          conversationId,
          answer,
          sources: [],
          recommendedProducts: [],
          comparedProducts: [],
        },
      });
    }
    return route.fulfill({ status: 404, json: { message: `Unexpected fixture route ${path}` } });
  });
  await page.goto(`/ai/conversations/${conversationId}`);
  await expect(page.getByLabel('Nhập câu hỏi cho trợ lý AI')).toBeEnabled();
  return { release: responseGate.release, requests: () => requests };
}

test('chat sends immediately, waits with three wave dots and reveals only a newly received answer', async ({
  page,
}) => {
  const fixture = await chatFixture(page);
  const input = page.getByLabel('Nhập câu hỏi cho trợ lý AI');
  const question = 'Tư vấn máy pin tốt trong 10 triệu';
  await input.fill(question);
  await input.press('Enter');
  await expect(page.locator('.message.user')).toHaveCount(1);
  await expect(page.locator('.message.user')).toContainText(question);
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('chat-pending')).toBeVisible();
  await expect(page.getByTestId('chat-pending').locator('.chat-wave > span')).toHaveCount(3);
  await expect(page.getByTestId('chat-pending').locator('.chat-wave > span').first()).toHaveCSS(
    'animation-name',
    'chat-dot-wave',
  );
  await page.screenshot({ path: 'test-results/chat-gemini-waiting.png', fullPage: true });
  fixture.release();
  await expect(page.getByTestId('chat-reveal')).toBeVisible();
  await expect(page.getByTestId('chat-pending')).toHaveCount(0);
  await expect(page.locator('.message.assistant .message-bubble > p').last()).not.toHaveText(
    answer,
  );
  await page.getByRole('button', { name: 'Hiển thị toàn bộ câu trả lời', exact: true }).click();
  await expect(page.locator('.message.assistant')).toContainText(answer);
  await expect(page.locator('.message.user')).toHaveCount(1);
  await page.screenshot({ path: 'test-results/chat-gemini-answer.png', fullPage: true });
  await page.reload();
  await expect(page.locator('.message.assistant')).toContainText(answer);
  await expect(page.getByTestId('chat-reveal')).toHaveCount(0);
  expect(fixture.requests()).toBe(1);
});

test('chat failure keeps one outgoing bubble and retry resolves without duplicating the message', async ({
  page,
}) => {
  const fixture = await chatFixture(page, { failFirst: true, reducedMotion: true });
  const input = page.getByLabel('Nhập câu hỏi cho trợ lý AI');
  await input.fill('Tư vấn máy chụp ảnh');
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
  fixture.release();
  await expect(page.getByTestId('chat-send-retry')).toBeVisible();
  await expect(page.locator('.message.user')).toHaveCount(1);
  await expect(page.getByTestId('chat-pending')).toHaveCount(0);
  await page.getByTestId('chat-send-retry').click();
  await expect(page.locator('.message.assistant')).toContainText(answer);
  await expect(page.locator('.message.user')).toHaveCount(1);
  await expect(page.getByTestId('chat-send-retry')).toHaveCount(0);
  expect(fixture.requests()).toBe(2);
});

test('canceling a recovered topic switch unlocks chat after the original reply was lost', async ({
  page,
}) => {
  const fixture = await chatFixture(page, { lostSwitch: true, reducedMotion: true });
  const input = page.getByLabel('Nhập câu hỏi cho trợ lý AI');
  await input.fill('Shop bảo hành như thế nào?');
  await input.press('Enter');
  fixture.release();
  await expect(page.getByTestId('chat-send-retry')).toBeVisible();
  await page.getByTestId('chat-send-retry').click();
  const dialog = page.getByRole('dialog', { name: 'Bạn có muốn chuyển chủ đề trò chuyện?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Ở lại chủ đề hiện tại', exact: true }).click();
  await expect(input).toBeEnabled();
  await expect(page.locator('.message.user')).toHaveCount(1);
  await input.fill('Tư vấn máy pin tốt');
  await input.press('Enter');
  await expect(page.locator('.message.assistant')).toContainText(answer);
  await expect(page.locator('.message.user')).toHaveCount(2);
  expect(fixture.requests()).toBe(2);
});

test('unknown gateway failures check history without submitting a duplicate question', async ({
  page,
}) => {
  const fixture = await chatFixture(page, { unknownFirstFailure: true });
  await page.getByLabel('Nhập câu hỏi cho trợ lý AI').fill('Tư vấn máy nhỏ gọn');
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
  fixture.release();
  await page.getByTestId('chat-send-retry').click();
  await expect(page.getByTestId('chat-send-failure')).toContainText(
    'Chưa xác định được máy chủ đã xử lý câu hỏi hay chưa.',
  );
  expect(fixture.requests()).toBe(1);
  await expect(page.locator('.message.user')).toHaveCount(1);
});

test('admin configures only Gemini for chat and embedding with the existing save-test-activate workflow', async ({
  page,
}) => {
  let settings = {
    provider: 'GEMINI',
    model: '',
    maskedKey: '',
    maskedBackupKey: '',
    tested: false,
    active: false,
  };
  const operations: string[] = [];
  await page
    .context()
    .addCookies([
      { name: 'XSRF-TOKEN', value: 'presentation-token', url: 'http://127.0.0.1:15173' },
    ]);
  await page.route(/^http:\/\/127\.0\.0\.1:15173\/api\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (path === '/api/users/me') return route.fulfill({ json: { ...customer, role: 'ADMIN' } });
    if (path === '/api/maintenance') return route.fulfill({ json: { enabled: false } });
    if (path === '/api/auth/csrf') return route.fulfill({ json: { token: 'presentation-token' } });
    if (path === '/api/admin/ai-settings' && method === 'GET')
      return route.fulfill({ json: settings.model ? [settings] : [] });
    if (path === '/api/admin/ai-settings' && method === 'PUT') {
      const data = route.request().postDataJSON();
      expect(data.provider).toBe('GEMINI');
      settings = { ...settings, model: data.model, maskedKey: '••••••••' };
      operations.push('save');
      return route.fulfill({ json: settings });
    }
    if (path === '/api/admin/ai-settings/test') {
      expect(route.request().postDataJSON().provider).toBe('GEMINI');
      settings.tested = true;
      operations.push('test');
      return route.fulfill({ json: { message: 'Kết nối thành công' } });
    }
    if (path === '/api/admin/ai-settings/activate') {
      expect(route.request().postDataJSON().provider).toBe('GEMINI');
      settings.active = true;
      operations.push('activate');
      return route.fulfill({ json: [settings] });
    }
    if (path === '/api/admin/embedding-settings') {
      if (method === 'PUT') {
        const data = route.request().postDataJSON();
        expect(data.provider).toBe('GEMINI');
        expect(data.dimensions).toBe(768);
        operations.push('embedding');
        return route.fulfill({
          json: {
            configured: true,
            provider: 'GEMINI',
            model: data.model,
            dimensions: 768,
            maskedKey: '••••••••',
            reindexRequired: false,
          },
        });
      }
      return route.fulfill({ json: { configured: false, reindexRequired: false } });
    }
    return route.fulfill({ status: 404, json: { message: 'Unexpected test API' } });
  });
  await page.goto('/admin/ai-settings');
  await expect(
    page.getByRole('heading', { name: 'Cấu hình Google Gemini', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('OpenAI', { exact: true })).toHaveCount(0);
  await page.getByLabel('Chat Model').fill('gemini-test-model');
  await page.getByPlaceholder('Nhập khóa mới khi cần thay đổi').fill('test-only-fake-key');
  await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
  await page.getByRole('button', { name: 'Kiểm tra kết nối', exact: true }).click();
  await page.getByRole('button', { name: 'Kích hoạt', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Kích hoạt Google Gemini?' })
    .getByRole('button', { name: 'Xác nhận', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Đang hoạt động', exact: true })).toBeVisible();
  await page.goto('/admin/embedding');
  await expect(page.getByText('OpenAI', { exact: true })).toHaveCount(0);
  await page.getByLabel('Model', { exact: true }).fill('gemini-embedding-001');
  await page.getByLabel(/^API key mới/).fill('test-only-embedding-key');
  await page.getByRole('button', { name: 'Kiểm tra và lưu', exact: true }).click();
  await expect.poll(() => operations).toEqual(['save', 'test', 'activate', 'embedding']);
});
