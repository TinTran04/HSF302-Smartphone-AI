import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./httpClient', () => ({
  ApiError: class ApiError extends Error { constructor(public status: number, message = '', public code?: string) { super(message); } },
  http: vi.fn(),
  jsonBody: JSON.stringify,
}));
import { ApiError, http } from './httpClient';
import { realApi } from './realApi';

describe('real backend contract', () => {
  beforeEach(() => vi.resetAllMocks());

  it('sends the backend identifier field for login', async () => {
    vi.mocked(http).mockResolvedValueOnce({ challengeId: 'challenge' });
    await realApi.login({ email: 'a@example.com', password: 'pw', guestCart: [] });
    expect(http).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
      body: JSON.stringify({ identifier: 'a@example.com', password: 'pw' }),
    }));
  });

  it('resolves a guest cart on the server and preserves unavailable IDs', async () => {
    vi.mocked(http).mockResolvedValueOnce({ items: [{ variantId: '7', quantity: 1, unavailable: true, product: null, variant: null }], total: 0 });
    const cart = await realApi.resolveCart([{ variantId: '7', quantity: 1 }]);
    expect(http).toHaveBeenCalledWith('/cart/resolve', expect.objectContaining({ method: 'POST' }));
    expect(cart.unavailableVariantIds).toEqual(['7']);
  });

  it('sends selected variant IDs when requesting an order preview', async () => {
    vi.mocked(http).mockResolvedValueOnce({ previewId: 'p', items: [], total: 0, priceChanged: false });
    const shipping = { fullName: 'An', phone: '0900000000', address: 'Address 123', note: '' };
    await realApi.previewOrder(shipping, ['42']);
    expect(http).toHaveBeenCalledWith('/orders/preview', expect.objectContaining({
      body: JSON.stringify({ variantIds: ['42'], shipping, paymentMethod: 'COD' }),
    }));
  });

  it('creates one guest session for concurrent chat requests', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) });
    let release!: (value: unknown) => void;
    vi.mocked(http).mockImplementation((path) => path === '/ai/guest-sessions'
      ? new Promise(resolve => { release = resolve; }) : Promise.resolve([]));
    const first = realApi.conversations();
    const second = realApi.conversations();
    expect(vi.mocked(http).mock.calls.filter(([path]) => path === '/ai/guest-sessions')).toHaveLength(1);
    release({ guestSessionToken: 'test-token' });
    await Promise.all([first, second]);
    vi.unstubAllGlobals();
  });
  it('retries authentication without a revoked guest token', async () => {
    const storage = new Map([['smartphone-ai-guest-session', 'revoked']]);
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) });
    vi.mocked(http).mockRejectedValueOnce(new ApiError(401, 'Invalid chat session', 'UNAUTHORIZED'))
      .mockResolvedValueOnce({ user: { id: 'admin', role: 'ADMIN' } });
    await realApi.login({ email: 'admin', password: 'pw', guestCart: [] });
    expect(vi.mocked(http)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(http).mock.calls[1][1]?.headers).toEqual({});
    expect(storage.has('smartphone-ai-guest-session')).toBe(false);
    vi.unstubAllGlobals();
  });
});
