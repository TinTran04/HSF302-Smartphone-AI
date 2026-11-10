import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Api } from '../shared/api/contracts';
import type { Order } from '../shared/types/models';
import { mockProducts } from './products';
let backend: Api;
beforeEach(async () => {
  const values = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.resetModules();
  backend = (await import('./mockApi')).mockApi;
});
describe('Fake backend business contracts', () => {
  it('rejects ambiguous legacy removal or replacement of a multi-key pool', async () => {
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    const saved = await backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-model', apiKey: 'primary-private',
      backupKeys: [{ name: 'Project A', apiKey: 'private-backup-A' }, { name: 'Project B', apiKey: 'private-backup-B' }] });
    await expect(async () => backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-model', removeBackupKey: true }))
      .rejects.toMatchObject({ status: 409 });
    await expect(async () => backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-model', backupApiKey: 'legacy-replacement' }))
      .rejects.toMatchObject({ status: 409 });
    expect((await backend.aiSettings())[0]).toMatchObject({ id: saved.id, backupKeys: [
      expect.objectContaining({ name: 'Project A' }), expect.objectContaining({ name: 'Project B' }),
    ] });
  });
  it.each(['ADMIN', 'CUSTOMER'] as const)('validates optional admin phone numbers for %s profiles', async (role) => {
    await backend.login({ email: role === 'ADMIN' ? 'admin@demo.vn' : 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const profile = { fullName: 'Updated name', phone: '', address: '' };
    if (role === 'ADMIN') {
      expect(await backend.updateProfile(profile)).toMatchObject({ phone: '' });
    } else {
      await expect(async () => backend.updateProfile(profile)).rejects.toMatchObject({ status: 400 });
    }
    await expect(async () => backend.updateProfile({ ...profile, phone: 'invalid' })).rejects.toMatchObject({ status: 400 });
    expect(await backend.updateProfile({ ...profile, phone: '0901234567' })).toMatchObject({ phone: '0901234567' });
  });
  it('keeps unrelated demo questions inside the phone scope and then accepts another phone question', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const conversation = await backend.createConversation('PHONE_CONSULTATION');
    const result = await backend.sendMessage(conversation.id, 'Thời tiết hôm nay thế nào?');
    expect(result).toMatchObject({ type: 'ANSWER', answer: expect.stringContaining('Mình chỉ hỗ trợ tư vấn về điện thoại') });
    if (result.type !== 'ANSWER') throw new Error('Expected scope reminder');
    expect(result.sources ?? []).toEqual([]);
    expect(result.recommendedProducts ?? []).toEqual([]);
    expect(result.comparedProducts ?? []).toEqual([]);
    const stored = await backend.conversation(conversation.id);
    expect(stored.messages.map(message => message.role)).toEqual(['user', 'assistant']);
    expect(stored.messages[1].content).toBe(result.answer);
    expect(stored.pendingSwitch).toBeUndefined();
    const next = await backend.sendMessage(conversation.id, 'Tư vấn điện thoại pin tốt');
    expect(next.type).toBe('ANSWER');
    if (next.type === 'ANSWER') expect(next.recommendedProducts?.length).toBeGreaterThan(0);
  });
  it('starts demo mode with a single Gemini provider and preserves backup key workflow', async () => {
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    expect(await backend.aiSettings()).toEqual([
      expect.objectContaining({ provider: 'GEMINI', active: true }),
    ]);
    const saved = await backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-gemini', apiKey: 'demo-primary', backupApiKey: 'demo-backup' });
    expect(saved).toMatchObject({ active: false, tested: false, maskedKey: '••••••••', maskedBackupKey: '••••••••' });
    await expect(async () => backend.activateProvider('GEMINI')).rejects.toMatchObject({ status: 409 });
    await backend.testAiConnection({ provider: 'GEMINI', model: 'demo-gemini' });
    expect(await backend.activateProvider('GEMINI')).toEqual([
      expect.objectContaining({ provider: 'GEMINI', active: true, model: 'demo-gemini' }),
    ]);
    expect(sessionStorage.getItem('smai-demo-settings')).not.toContain('demo-primary');
    expect(sessionStorage.getItem('smai-demo-settings')).not.toContain('demo-backup');
    expect(await backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-gemini', removeBackupKey: true }))
      .toMatchObject({ maskedBackupKey: '', tested: false, active: false });
  });

  it('keeps named backup ordering, removes one row and never stores secrets', async () => {
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    const first = await backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-gemini', backupKeys: [
      { name: 'Project A', apiKey: 'secret-project-a' }, { name: 'Project B', apiKey: 'secret-project-b' },
    ] });
    expect(first.backupKeys).toEqual([
      expect.objectContaining({ name: 'Project A', priority: 1, lastStatus: 'UNKNOWN' }),
      expect.objectContaining({ name: 'Project B', priority: 2, lastStatus: 'UNKNOWN' }),
    ]);
    await backend.testBackupKey(first.id, first.backupKeys[1].id);
    expect((await backend.aiSettings())[0].backupKeys[1].lastStatus).toBe('WORKING');
    const reordered = await backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-gemini', configId: first.id,
      backupKeys: [{ id: first.backupKeys[1].id, name: 'Project B' }, { id: first.backupKeys[0].id, name: 'Project A' }] });
    expect(reordered.id).not.toBe(first.id);
    expect(reordered.backupKeys.map(key => key.name)).toEqual(['Project B', 'Project A']);
    const removed = await backend.saveAiSettings({ provider: 'GEMINI', model: 'demo-gemini', configId: reordered.id,
      backupKeys: [{ id: reordered.backupKeys[0].id, name: 'Project B' }] });
    expect(removed.backupKeys.map(key => key.name)).toEqual(['Project B']);
    expect(sessionStorage.getItem('smai-demo-settings')).not.toContain('secret-project');
    expect(sessionStorage.getItem('smai-demo-settings')).not.toContain('apiKey');
  });

  it('rejects activation from a stale configuration while preserving the active version', async () => {
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    const original = (await backend.aiSettings())[0];
    const newer = await backend.saveAiSettings({ provider: 'GEMINI', configId: original.id, model: 'newer-model', backupKeys: [] });
    await backend.testAiConnection({ provider: 'GEMINI', configId: newer.id, model: newer.model });
    await expect(async () => backend.activateProvider('GEMINI', original.id)).rejects.toMatchObject({ status: 409 });
    expect((await backend.aiSettings())[0].active).toBe(false);
    expect((await backend.activateProvider('GEMINI', newer.id))[0]).toMatchObject({ id: newer.id, active: true });
  });

  it('persists notification read state and resolved history while restricting customers', async () => {
    sessionStorage.setItem('smai-demo-ai-key-alert', JSON.stringify({ id: 'alert-1', model: 'demo-gemini',
      status: 'USING_BACKUP', reason: 'AI_PROVIDER_AUTH_ERROR', backupFailureReason: null, detectedAt: '2026-11-09T12:00:00Z' }));
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    expect(await backend.aiNotifications()).toMatchObject({ unreadCount: 1, latestId: 'alert-1', items: [{ read: false, resolved: false }] });
    await backend.markAiNotificationsRead('alert-1');
    sessionStorage.setItem('smai-demo-ai-key-alert', 'null');
    vi.resetModules();
    backend = (await import('./mockApi')).mockApi;
    expect(await backend.aiNotifications()).toMatchObject({ unreadCount: 0, items: [{ read: true, resolved: true }] });
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    await expect(async () => backend.aiNotifications()).rejects.toMatchObject({ status: 403 });
  });

  it('retains primary recovery in notification history while clearing the active warning', async () => {
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    sessionStorage.setItem('smai-demo-ai-key-alert', JSON.stringify({ id: 'recovery-1', model: 'demo-gemini',
      status: 'PRIMARY', reason: null, backupFailureReason: null, detectedAt: '2026-11-09T12:00:00Z' }));
    expect(await backend.aiKeyAlert()).toBeNull();
    expect(await backend.aiNotifications()).toMatchObject({ unreadCount: 1, items: [{ status: 'PRIMARY', resolved: true, read: false }] });
  });

  it('discards persisted OpenAI configuration without reusing its model or keys', async () => {
    sessionStorage.setItem('smai-demo-settings', JSON.stringify([
      { provider: 'OPENAI', model: 'legacy-model', maskedKey: 'legacy-key', maskedBackupKey: 'legacy-backup', tested: true, active: true, activeModel: 'legacy-model' },
    ]));
    vi.resetModules();
    backend = (await import('./mockApi')).mockApi;
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    await expect(backend.aiSettings()).resolves.toEqual([
      { id: 'demo-config', backupKeys: [], provider: 'GEMINI', model: '', maskedKey: '', maskedBackupKey: '', tested: false, active: false },
    ]);
    expect(sessionStorage.getItem('smai-demo-settings')).not.toContain('legacy');
    await expect(async () => backend.activateProvider('GEMINI')).rejects.toMatchObject({ status: 400 });
  });

  it('preserves existing Gemini settings when removing a legacy provider', async () => {
    const gemini = { provider: 'GEMINI', model: 'saved-gemini', maskedKey: 'masked-primary', maskedBackupKey: 'masked-backup', tested: true, active: true };
    sessionStorage.setItem('smai-demo-settings', JSON.stringify([
      { provider: 'OPENAI', model: 'legacy', maskedKey: 'legacy', active: false }, gemini,
    ]));
    vi.resetModules();
    backend = (await import('./mockApi')).mockApi;
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    await expect(backend.aiSettings()).resolves.toEqual([expect.objectContaining({ ...gemini, backupKeys: [expect.objectContaining({ name: 'Key dự phòng 1', maskedKey: 'masked-backup' })] })]);
  });

  it('reverse lookup requires login, supports cancellation and returns a clearly marked demo address', async () => {
    await expect(backend.reverseLocation({ latitude: 10.8, longitude: 106.6 })).rejects.toMatchObject({ status: 401 });
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const controller = new AbortController();
    const request = backend.reverseLocation({ latitude: 10.8, longitude: 106.6 }, controller.signal);
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    await expect(backend.reverseLocation({ latitude: 10.8, longitude: 106.6 })).resolves.toMatchObject({ label: expect.stringContaining('minh họa') });
  });
  it.each(['create', 'edit'] as const)('rejects %s under demo storage quota and preserves products before and after reload', async (action) => {
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    const original = await backend.product(mockProducts[0].id, true);
    const previousJson = sessionStorage.getItem('smai-demo-products');
    const image = new File([new Uint8Array(5 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const uploaded = await backend.uploadProductImage(image);
    const previousStorage = sessionStorage;
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => previousStorage.getItem(key),
      setItem: (key: string, value: string) => {
        if (key === 'smai-demo-products' && value.length > 5 * 1024 * 1024)
          throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
        previousStorage.setItem(key, value);
      },
    });
    const next = { ...original, id: action === 'create' ? 'new-product' : original.id, name: 'Unsaved product', images: [uploaded.url] };
    let failure: unknown;
    try { await backend.saveProduct(next, action === 'create'); } catch (error) { failure = error; }
    expect(failure).toMatchObject({ status: 507, code: 'DEMO_STORAGE_UNAVAILABLE' });
    expect(sessionStorage.getItem('smai-demo-products')).toBe(previousJson);
    expect(await backend.product(original.id, true)).toEqual(original);
    if (action === 'create') await expect(async () => backend.product(next.id, true)).rejects.toMatchObject({ status: 404 });
    expect((await backend.products(new URLSearchParams({ keyword: 'Unsaved product' }), true)).items).toEqual([]);
    vi.resetModules();
    backend = (await import('./mockApi')).mockApi;
    expect(await backend.product(original.id, true)).toEqual(original);
    if (action === 'create') await expect(async () => backend.product(next.id, true)).rejects.toMatchObject({ status: 404 });
  });

  it('uploads administrator image files with data URLs that remain usable after saving a product', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'phone.png', { type: 'image/png' });
    await expect(async () => backend.uploadProductImage(file)).rejects.toMatchObject({ status: 401 });
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    await expect(async () => backend.uploadProductImage(file)).rejects.toMatchObject({ status: 403 });
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    const uploaded = await backend.uploadProductImage(file);
    expect(uploaded.url).toBe('data:image/png;base64,iVBORw0KGgo=');
    const product = { ...structuredClone(mockProducts[0]), images: [uploaded.url] };
    await backend.saveProduct(product, false);
    vi.resetModules();
    backend = (await import('./mockApi')).mockApi;
    expect((await backend.product(product.id, true)).images).toEqual([uploaded.url]);
    await expect(async () => backend.uploadProductImage(new File(['svg'], 'phone.svg', { type: 'image/svg+xml' })))
      .rejects.toMatchObject({ status: 400 });
    await expect(async () => backend.uploadProductImage(new File([], 'phone.png', { type: 'image/png' })))
      .rejects.toMatchObject({ status: 400 });
    await expect(async () => backend.uploadProductImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'phone.png', { type: 'image/png' })))
      .rejects.toMatchObject({ status: 400 });
  });

  it('permanently deletes a product and its cart entries while preserving placed-order snapshots', async () => {
    const product = mockProducts.find((item) => item.status === 'ACTIVE')!;
    const variant = product.variants.find((item) => item.status === 'ACTIVE')!;
    const entry = { variantId: variant.id, quantity: 1 };
    const shipping = { fullName: 'Customer', phone: '0912345678', address: '123 Nguyễn Huệ', note: '' };
    await expect(async () => backend.deleteProduct(product.id)).rejects.toMatchObject({ status: 401 });
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [entry] });
    await expect(async () => backend.deleteProduct(product.id)).rejects.toMatchObject({ status: 403 });
    const placedPreview = await backend.previewOrder(shipping);
    const placed = await backend.placeOrder({ previewId: placedPreview.previewId, shipping, paymentMethod: 'COD' }, 'before-product-delete');
    await backend.addCart(entry);
    const pendingPreview = await backend.previewOrder(shipping);
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [entry] });
    const before = await backend.dashboard();
    await backend.deleteProduct(product.id);
    await expect(async () => backend.product(product.id, true)).rejects.toMatchObject({ status: 404 });
    expect((await backend.products(undefined, true)).items.some((item) => item.id === product.id)).toBe(false);
    expect((await backend.dashboard()).products).toBe(before.products - 1);
    expect((await backend.cart()).items).toEqual([]);
    await expect(async () => backend.deleteProduct(product.id)).rejects.toMatchObject({ status: 404 });
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    expect(await backend.cart()).toMatchObject({ items: [], unavailableVariantIds: [] });
    expect((await backend.order(placed.id)).items).toEqual(placed.items);
    expect((await backend.order(placed.id)).items[0].product.name).toBe(product.name);
    await expect(async () => backend.placeOrder({ previewId: pendingPreview.previewId, shipping, paymentMethod: 'COD' }, 'after-product-delete'))
      .rejects.toMatchObject({ status: 409 });
  });

  it('persists and clears a profile map point while preserving the account email', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const location = { latitude: 10.7769, longitude: 106.7009 };
    const profile = { fullName: 'Customer', phone: '0912345678', address: '123 Nguyễn Huệ' };
    expect(await backend.updateProfile({ ...profile, location })).toMatchObject({ location });
    expect(await backend.me()).toMatchObject({ location, email: 'customer@demo.vn' });
    expect(await backend.updateProfile({ ...profile, location: null })).toMatchObject({ location: null });
  });

  it('snapshots the checkout point and rejects changed shipping in previews and retries', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const product = mockProducts.find((item) => item.status === 'ACTIVE')!;
    const variant = product.variants.find((item) => item.status === 'ACTIVE')!;
    await backend.addCart({ variantId: variant.id, quantity: 1 });
    const shipping = {
      fullName: 'Customer', phone: '0912345678', address: '123 Nguyễn Huệ', note: '',
      location: { latitude: 10.7769, longitude: 106.7009 },
    };
    const preview = await backend.previewOrder(shipping, [variant.id]);
    const changed = { ...shipping, location: { latitude: 21.0285, longitude: 105.8542 } };
    const data = { previewId: preview.previewId, shipping, paymentMethod: 'COD' as const };
    await expect(async () => backend.placeOrder({ ...data, shipping: changed }, 'changed-pin')).rejects.toMatchObject({ status: 409 });
    const placed = await backend.placeOrder(data, 'saved-pin');
    expect(placed.shipping.location).toEqual(shipping.location);
    await backend.updateProfile({ fullName: 'New name', phone: shipping.phone, address: 'Địa chỉ mới', location: null });
    expect((await backend.order(placed.id)).shipping.location).toEqual(shipping.location);
    expect((await backend.placeOrder(data, 'saved-pin')).id).toBe(placed.id);
    await expect(async () => backend.placeOrder({ ...data, shipping: changed }, 'saved-pin')).rejects.toMatchObject({ status: 409 });
  });
  it.each(['product', 'variants'] as const)(
    'keeps a sold-out %s searchable and viewable while rejecting cart additions',
    async (unavailable) => {
      const product = structuredClone(mockProducts[0]);
      if (unavailable === 'product') product.status = 'INACTIVE';
      else product.variants.forEach((variant) => { variant.status = 'INACTIVE'; });
      sessionStorage.setItem('smai-demo-products', JSON.stringify([product]));
      vi.resetModules();
      backend = (await import('./mockApi')).mockApi;

      const catalog = await backend.products(new URLSearchParams({ keyword: product.name }));
      expect(catalog.items.map((item) => item.id)).toEqual([product.id]);
      expect((await backend.product(product.id)).status).toBe(product.status);
      const entry = { variantId: product.variants[0].id, quantity: 1 };
      expect(await backend.resolveCart([entry])).toMatchObject({
        items: [],
        unavailableVariantIds: [entry.variantId],
      });
      await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
      await expect(async () => backend.addCart(entry)).rejects.toMatchObject({ status: 409 });
    },
  );

  it('sorts persisted customer and admin orders by newest date before their identifiers', async () => {
    const order = (id: string, createdAt: string, userId = 'demo-customer'): Order => ({
      id, createdAt, userId, customerName: 'Customer', status: 'PENDING', items: [],
      shipping: { fullName: 'Customer', phone: '0912345678', address: 'TP. Hồ Chí Minh', note: '' },
      total: 0, paymentMethod: 'COD', history: [{ status: 'PENDING', at: createdAt }],
    });
    sessionStorage.setItem('smai-demo-orders', JSON.stringify([
      order('Z-old', '2026-10-01T08:00:00+07:00'),
      order('B-new', '2026-11-05T08:00:00+07:00'),
      order('A-new', '2026-11-05T01:00:00Z'),
      order('Other-newest', '2026-11-06T08:00:00+07:00', 'other-customer'),
    ]));
    vi.resetModules();
    backend = (await import('./mockApi')).mockApi;
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    expect((await backend.orders()).map((item) => item.id)).toEqual(['B-new', 'A-new', 'Z-old']);
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    expect((await backend.orders(true)).map((item) => item.id)).toEqual([
      'Other-newest', 'B-new', 'A-new', 'Z-old',
    ]);
  });

  it('splits topic context only after confirmation and keeps original history', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const old = await backend.createConversation('PHONE_CONSULTATION');
    const response = await backend.sendMessage(old.id, 'Shop có cho đổi trả trong 7 ngày không?');
    expect(response.type).toBe('SWITCH_REQUIRED');
    expect((await backend.conversation(old.id)).messages).toHaveLength(1);
    expect(await backend.conversations()).toHaveLength(1);
    if (response.type !== 'SWITCH_REQUIRED') throw new Error('Expected switch');
    const switched = await backend.confirmSwitch(response.switchRequestId);
    if (switched.type !== 'ANSWER') throw new Error('Expected answer');
    expect(switched.newConversationId).not.toBe(old.id);
    const next = await backend.conversation(switched.newConversationId!);
    expect(next.topic).toBe('SHOP_SUPPORT');
    expect(next.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect((await backend.conversation(old.id)).messages).toHaveLength(1);
    const retry = await backend.confirmSwitch(response.switchRequestId);
    expect(retry).toEqual(switched);
    expect(await backend.conversations()).toHaveLength(2);
  });
  it('cancels a pending switch without answering outside the topic', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const chat = await backend.createConversation('GENERAL_CHAT');
    const response = await backend.sendMessage(chat.id, 'Shop có cho đổi trả trong 7 ngày không?');
    if (response.type !== 'SWITCH_REQUIRED') throw new Error('Expected switch');
    await backend.cancelSwitch(response.switchRequestId);
    const current = await backend.conversation(chat.id);
    expect(current.topic).toBe('PHONE_CONSULTATION');
    expect(current.pendingSwitch).toBeUndefined();
    expect(current.messages).toHaveLength(1);
    expect(await backend.conversations()).toHaveLength(1);
  });
  it('creates only one COD order for the same idempotency key', async () => {
    await backend.login({
      email: 'customer@demo.vn',
      password: 'Demo123!',
      guestCart: [{ variantId: 'iphone-16-pro-max-256gb-natural', quantity: 1 }],
    });
    const shipping = {
      fullName: 'Khách thử nghiệm',
      phone: '0912345678',
      address: 'TP. Hồ Chí Minh',
      note: '',
    };
    const preview = await backend.previewOrder(shipping);
    const body = { previewId: preview.previewId, shipping, paymentMethod: 'COD' as const };
    const first = await backend.placeOrder(body, 'same-request');
    const repeated = await backend.placeOrder(body, 'same-request');
    expect(first.id).toBe(repeated.id);
    expect(await backend.orders()).toHaveLength(1);
    expect((await backend.cart()).items).toHaveLength(0);
    expect(first.status).toBe('PENDING');
    expect((await backend.cancelOrder(first.id)).status).toBe('CANCELLED');
    await expect(async () => backend.cancelOrder(first.id)).rejects.toThrow('Chỉ đơn chờ xác nhận');
  });
  it('enforces ownership and admin role in the fake backend', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const chat = await backend.createConversation('GENERAL_CHAT');
    await expect(async () => backend.dashboard()).rejects.toThrow('Chỉ quản trị viên');
    await backend.logout();
    await backend.register({ email: 'other@example.com', fullName: 'Other', phone: '0900000000', password: 'Password123!', guestCart: [] });
    await expect(async () => backend.conversation(chat.id)).rejects.toThrow(
      'Cuộc hội thoại không tồn tại',
    );
    await expect(async () => backend.deleteConversation(chat.id)).rejects.toMatchObject({ status: 404 });
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    expect((await backend.conversation(chat.id)).id).toBe(chat.id);
  });
  it('requires a customer account for every chat operation', async () => {
    await expect(async () => backend.createConversation('PHONE_CONSULTATION')).rejects.toMatchObject({ status: 401 });
    await expect(async () => backend.conversations()).rejects.toMatchObject({ status: 401 });
    await expect(async () => backend.sendMessage('unknown', 'Hello')).rejects.toMatchObject({ status: 401 });
    await backend.login({ email: 'admin@demo.vn', password: 'Demo123!', guestCart: [] });
    await expect(async () => backend.createConversation('PHONE_CONSULTATION')).rejects.toMatchObject({ status: 403 });
  });
  it('deletes the requested chat and rejects switch replay into a deleted target', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const old = await backend.createConversation('PHONE_CONSULTATION');
    const response = await backend.sendMessage(old.id, 'Shop có cho đổi trả trong 7 ngày không?');
    if (response.type !== 'SWITCH_REQUIRED') throw new Error('Expected switch');
    const switched = await backend.confirmSwitch(response.switchRequestId);
    if (switched.type !== 'ANSWER') throw new Error('Expected answer');
    await backend.deleteConversation(switched.newConversationId!);
    expect((await backend.conversations()).map(chat => chat.id)).toEqual([old.id]);
    await expect(async () => backend.conversation(switched.newConversationId!)).rejects.toMatchObject({ status: 404 });
    await expect(async () => backend.confirmSwitch(response.switchRequestId)).rejects.toMatchObject({ status: 404 });
  });
  it('keeps email and role immutable while updating profile fields', async () => {
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    const changes = { fullName: 'Tên mới', phone: '0900000000', address: 'Địa chỉ mới', email: 'changed@example.com', role: 'ADMIN' };
    const updated = await backend.updateProfile(changes);
    expect(updated).toMatchObject({ fullName: 'Tên mới', phone: '0900000000', address: 'Địa chỉ mới', email: 'customer@demo.vn', role: 'CUSTOMER' });
  });
});
