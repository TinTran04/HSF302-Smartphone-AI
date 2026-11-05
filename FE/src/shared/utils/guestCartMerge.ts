import type { CartEntry } from '../types/models';

const storageKey = 'smartphone-ai-guest-cart-merge';
type MergeAttempt = { payload: string; id: string };
let currentAttempt: MergeAttempt | null = null;

export async function guestCartMergeId(entries: CartEntry[]): Promise<string | undefined> {
  if (!entries.length) return undefined;
  const payload = JSON.stringify([...entries].sort((first, second) => first.variantId.localeCompare(second.variantId)));
  const resolveAttempt = () => {
    let storedCart: unknown;
    try {
      storedCart = JSON.parse(localStorage.getItem('smartphone-ai-guest-cart') || 'null');
    } catch {
      // Storage can be unavailable in a restricted browser context.
    }
    if (Array.isArray(storedCart) && storedCart.length === 0)
      throw new Error('Giỏ Guest đã thay đổi hoặc được hợp nhất ở tab khác. Vui lòng đăng nhập lại.');
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved?.payload === payload && typeof saved.id === 'string'
          && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(saved.id)) {
        currentAttempt = saved;
        return saved.id as string;
      }
    } catch {
      // Keep the same in-memory attempt when browser storage is unavailable.
    }
    if (currentAttempt?.payload !== payload) currentAttempt = { payload, id: crypto.randomUUID() };
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentAttempt));
    } catch {
      // In-page retries still reuse the attempt ID.
    }
    return currentAttempt.id;
  };
  if (typeof navigator !== 'undefined' && navigator.locks)
    return navigator.locks.request(storageKey, resolveAttempt);
  return resolveAttempt();
}

export function resetGuestCartMerge() {
  currentAttempt = null;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // The in-memory attempt has already been cleared.
  }
}
