import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./httpClient', () => ({
  ApiError: class ApiError extends Error { constructor(public status: number, message = '', public code?: string) { super(message); } },
  http: vi.fn(),
  jsonBody: JSON.stringify,
  setAuthAccount: vi.fn(),
}));
import { ApiError, http, setAuthAccount } from './httpClient';
import { realApi, realAuth } from './realApi';

describe('real backend contract', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('reverse geocodes exact selected coordinates through the backend with cancellation', async () => {
    const signal = new AbortController().signal;
    vi.mocked(http).mockResolvedValue({ label: 'Địa chỉ từ điểm đã chọn' });
    await expect(realApi.reverseLocation({ latitude: 10.8272304, longitude: 106.641018 }, signal))
      .resolves.toEqual({ label: 'Địa chỉ từ điểm đã chọn' });
    expect(http).toHaveBeenCalledWith('/locations/reverse?latitude=10.8272304&longitude=106.641018', { signal });
    vi.mocked(http).mockResolvedValue(null);
    await expect(realApi.reverseLocation({ latitude: 0, longitude: 0 })).resolves.toBeNull();
  });

  it('uploads a product image as multipart and deletes a product with an encoded ID', async () => {
    const file = new File(['image'], 'phone.png', { type: 'image/png' });
    vi.mocked(http).mockResolvedValueOnce({ url: '/api/product-images/image.png' });
    await realApi.uploadProductImage(file);
    const [path, options] = vi.mocked(http).mock.calls[0];
    expect(path).toBe('/admin/products/images');
    expect(options?.method).toBe('POST');
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get('file')).toBe(file);
    vi.mocked(http).mockResolvedValueOnce(undefined);
    await realApi.deleteProduct('phone/id');
    expect(http).toHaveBeenLastCalledWith('/admin/products/phone%2Fid', { method: 'DELETE' });
  });

  it('proxies address suggestions through BE and forwards cancellation without a provider key', async () => {
    const signal = new AbortController().signal;
    const suggestions = [{ id: 'public-place', label: 'Nguyễn Huệ, Hồ Chí Minh', location: { latitude: 10.77, longitude: 106.7 } }];
    vi.mocked(http).mockResolvedValueOnce(suggestions);
    await expect(realApi.addressSuggestions('  Nguyễn Huệ, Hồ Chí Minh  ', signal)).resolves.toEqual(suggestions);
    expect(http).toHaveBeenCalledWith('/locations/autocomplete?text=Nguy%E1%BB%85n+Hu%E1%BB%87%2C+H%E1%BB%93+Ch%C3%AD+Minh', { signal });
  });

  it('sends the backend identifier field for login', async () => {
    vi.mocked(http).mockResolvedValueOnce({ challengeId: 'challenge' });
    await realApi.login({ email: 'a@example.com', password: 'pw', guestCart: [] });
    expect(http).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
      body: JSON.stringify({ identifier: 'a@example.com', password: 'pw', guestCart: [] }),
    }));
  });

  it('keeps the account identity attached to normal authentication entry points', async () => {
    const user = { id: 'customer-id', role: 'CUSTOMER' };
    vi.mocked(http).mockResolvedValueOnce(user);
    await realApi.me();
    expect(setAuthAccount).toHaveBeenLastCalledWith(user.id);
    vi.mocked(http).mockResolvedValueOnce({ user });
    await realApi.login({ email: 'customer@example.com', password: 'Password123!', guestCart: [] });
    expect(setAuthAccount).toHaveBeenLastCalledWith(user.id);
    vi.mocked(http).mockResolvedValueOnce({ user });
    await realAuth.verify('challenge', '123456', []);
    expect(setAuthAccount).toHaveBeenLastCalledWith(user.id);
    vi.mocked(http).mockResolvedValueOnce(undefined);
    await realApi.logout();
    expect(setAuthAccount).toHaveBeenLastCalledWith(null);
  });

  it('clears an expired identity and preserves a newer identity when an old request is cancelled', async () => {
    vi.mocked(http).mockRejectedValueOnce(new ApiError(401, ''));
    await expect(realApi.me()).resolves.toBe(null);
    expect(setAuthAccount).toHaveBeenLastCalledWith(null);
    vi.mocked(setAuthAccount).mockClear();
    vi.mocked(http).mockRejectedValueOnce(new ApiError(401, 'Account changed', 'AUTH_CONTEXT_CHANGED'));
    await expect(realApi.me()).rejects.toMatchObject({ code: 'AUTH_CONTEXT_CHANGED' });
    expect(setAuthAccount).not.toHaveBeenCalled();
  });

  it('forwards guest cart with a stable merge ID on password-login retry', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
    vi.mocked(http).mockResolvedValue({ user: { id: 'customer', role: 'CUSTOMER' } });
    const guestCart = [{ variantId: '7', quantity: 2 }];
    const login = { email: 'a@example.com', password: 'Password123!', guestCart };
    await realApi.login(login);
    await realApi.login(login);
    const requests = vi.mocked(http).mock.calls.map(([, init]) => JSON.parse(String(init?.body)));
    expect(requests[0].guestCart).toEqual(guestCart);
    expect(requests[0].guestCartMergeId).toMatch(/^[a-f0-9-]{36}$/i);
    expect(requests[1].guestCartMergeId).toBe(requests[0].guestCartMergeId);
  });

  it('uses the Admin catalog endpoint for product-form brands', async () => {
    vi.mocked(http).mockResolvedValueOnce([{ id: '1', name: 'Brand' }]);
    await realApi.brands(true);
    expect(http).toHaveBeenCalledWith('/admin/brands');
  });

  it('resolves a guest cart on the server and preserves unavailable IDs', async () => {
    vi.mocked(http).mockResolvedValueOnce({ items: [{ variantId: '7', quantity: 1, unavailable: true, product: null, variant: null }], total: 0 });
    const cart = await realApi.resolveCart([{ variantId: '7', quantity: 1 }]);
    expect(http).toHaveBeenCalledWith('/cart/resolve', expect.objectContaining({ method: 'POST' }));
    expect(cart.unavailableVariantIds).toEqual(['7']);
  });

  it('preserves product details for unavailable cart items', async () => {
    const product = { id: '1', name: 'Điện thoại A', images: [], variants: [], status: 'INACTIVE' };
    const variant = { id: '7', color: 'Đen', storage: '128GB', price: 100, status: 'INACTIVE' };
    vi.mocked(http).mockResolvedValueOnce({ items: [{ variantId: '7', quantity: 2, unavailable: true, product, variant }], total: 0 });
    const cart = await realApi.resolveCart([{ variantId: '7', quantity: 2 }]);
    expect(cart.unavailableItems).toEqual([{ variantId: '7', quantity: 2, product, variant }]);
    expect(cart.items).toEqual([]);
  });

  it('retains the active model while exposing a newer draft configuration', async () => {
    vi.mocked(http).mockResolvedValueOnce([
      { provider: 'GEMINI', model: 'draft', maskedKey: '***', active: false },
      { provider: 'GEMINI', model: 'active', maskedKey: '***', active: true },
    ]);
    const settings = await realApi.aiSettings();
    expect(settings.map((setting) => setting.provider)).toEqual(['GEMINI', 'GROQ', 'DEEPSEEK']);
    expect(settings[0]).toMatchObject({ model: 'draft', active: false, activeModel: 'active' });
    expect(settings[1]).not.toHaveProperty('activeModel');
  });

  it.each([{ configs: [] }, { configs: [{ provider: 'OPENAI', model: 'legacy-model', maskedKey: 'legacy-key', active: true }] }])(
    'offers empty configurations for every supported chat platform when none is saved',
    async ({ configs }) => {
      vi.mocked(http).mockResolvedValueOnce(configs);
      const blank = (provider: string) =>
        ({ id: '', backupKeys: [], provider, model: '', maskedKey: '', maskedBackupKey: '', tested: false, active: false });
      await expect(realApi.aiSettings()).resolves.toEqual([blank('GEMINI'), blank('GROQ'), blank('DEEPSEEK')]);
    },
  );

  it('exposes the active Groq platform while keeping other platforms selectable', async () => {
    vi.mocked(http).mockResolvedValueOnce([
      { id: '9', provider: 'GROQ', model: 'llama-3.3-70b-versatile', maskedKey: '***', active: true, tested: true, backupKeys: [] },
      { id: '3', provider: 'GEMINI', model: 'gemini-model', maskedKey: '***', active: false, tested: true, backupKeys: [] },
    ]);
    const settings = await realApi.aiSettings();
    expect(settings.map((setting) => [setting.provider, setting.activeModel])).toEqual([
      ['GEMINI', undefined],
      ['GROQ', 'llama-3.3-70b-versatile'],
      ['DEEPSEEK', undefined],
    ]);
  });

  it('resolves an oversized guest cart in batches so users can remove items', async () => {
    vi.mocked(http).mockResolvedValue({ items: [], total: 0 });
    await realApi.resolveCart(Array.from({length: 101}, (_, i) => ({ variantId: String(i + 1), quantity: 1 })));
    expect(vi.mocked(http)).toHaveBeenCalledTimes(2);
  });

  it('sends selected variant IDs when requesting an order preview', async () => {
    vi.mocked(http).mockResolvedValueOnce({ previewId: 'p', items: [], total: 0, priceChanged: false });
    const shipping = { fullName: 'An', phone: '0900000000', address: 'Address 123', note: '' };
    await realApi.previewOrder(shipping, ['42']);
    expect(http).toHaveBeenCalledWith('/orders/preview', expect.objectContaining({
      body: JSON.stringify({ variantIds: ['42'], shipping, paymentMethod: 'COD' }),
    }));
  });

  it('uses authenticated chat requests without creating guest sessions', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) });
    vi.mocked(http).mockResolvedValue([]);
    await Promise.all([realApi.conversations(), realApi.conversations()]);
    expect(vi.mocked(http).mock.calls.map(([path]) => path)).toEqual(['/ai/conversations', '/ai/conversations']);
    expect(vi.mocked(http).mock.calls.every(([, init]) => !init?.headers)).toBe(true);
  });
  it('ignores legacy guest chat credentials while logging in', async () => {
    const storage = new Map([['smartphone-ai-guest-session', 'revoked']]);
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) });
    vi.mocked(http).mockResolvedValueOnce({ user: { id: 'admin', role: 'ADMIN' } });
    await realApi.login({ email: 'admin', password: 'pw', guestCart: [] });
    expect(vi.mocked(http)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(http).mock.calls[0][1]?.headers).toBeUndefined();
    expect(storage.has('smartphone-ai-guest-session')).toBe(false);
  });
  it('deletes a conversation through the owned resource endpoint', async () => {
    vi.mocked(http).mockResolvedValueOnce(undefined);
    await realApi.deleteConversation('chat/id');
    expect(http).toHaveBeenCalledWith('/ai/conversations/chat%2Fid', { method: 'DELETE' });
  });
  it('keeps chat authentication failures instead of falling back to Guest', async () => {
    vi.mocked(http).mockRejectedValueOnce(new ApiError(401, 'Đăng nhập để sử dụng AI', 'AUTHENTICATION_REQUIRED'));
    await expect(realApi.conversations()).rejects.toMatchObject({ code: 'AUTHENTICATION_REQUIRED' });
    expect(http).toHaveBeenCalledTimes(1);
  });
});
