import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let storage: Map<string, string>;
beforeEach(() => {
  storage = new Map();
  vi.resetModules();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

describe('guest cart merge attempt', () => {
  it('coordinates ID creation across two tabs sharing browser storage', async () => {
    let queue = Promise.resolve<unknown>(undefined);
    const request = vi.fn((_name: string, operation: () => unknown) => {
      const result = queue.then(operation);
      queue = result.catch(() => undefined);
      return result;
    });
    vi.stubGlobal('navigator', { locks: { request } });
    const first = await import('./guestCartMerge');
    vi.resetModules();
    const second = await import('./guestCartMerge');
    const items = [{ variantId: '7', quantity: 2 }];
    let secondAttempt: string | undefined | Promise<string | undefined>;
    let interleaved = false;
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => {
        const previous = storage.get(key) ?? null;
        if (key === 'smartphone-ai-guest-cart-merge' && !interleaved) {
          interleaved = true;
          secondAttempt = second.guestCartMergeId(items);
        }
        return previous;
      },
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const firstId = await first.guestCartMergeId(items);
    expect(await secondAttempt).toBe(firstId);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('keeps the same ID across retries and module reloads', async () => {
    const first = await import('./guestCartMerge');
    const items = [{ variantId: '7', quantity: 2 }, { variantId: '4', quantity: 1 }];
    const id = await first.guestCartMergeId(items);
    expect(await first.guestCartMergeId([...items].reverse())).toBe(id);
    vi.resetModules();
    const reloaded = await import('./guestCartMerge');
    expect(await reloaded.guestCartMergeId(items)).toBe(id);
  });

  it('starts a new attempt when the cart changes or is cleared', async () => {
    const { guestCartMergeId } = await import('./guestCartMerge');
    const { saveGuestCart, clearGuestCart } = await import('../../features/cart/guestCart');
    saveGuestCart([{ variantId: '7', quantity: 1 }]);
    const first = await guestCartMergeId([{ variantId: '7', quantity: 1 }]);
    saveGuestCart([{ variantId: '7', quantity: 2 }]);
    const second = await guestCartMergeId([{ variantId: '7', quantity: 2 }]);
    expect(second).not.toBe(first);
    clearGuestCart();
    saveGuestCart([{ variantId: '7', quantity: 2 }]);
    expect(await guestCartMergeId([{ variantId: '7', quantity: 2 }])).not.toBe(second);
  });

  it('does not create an attempt for an empty cart', async () => {
    const { guestCartMergeId } = await import('./guestCartMerge');
    expect(await guestCartMergeId([])).toBeUndefined();
    expect(storage.size).toBe(0);
  });
});
