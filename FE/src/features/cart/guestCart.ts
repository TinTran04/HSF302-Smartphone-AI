import type { CartEntry } from '../../shared/types/models';
const key = 'smartphone-ai-guest-cart';
export function readGuestCart(): CartEntry[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(data)) return [];
    const merged = new Map<string, number>();
    for (const row of data)
      if (
        row &&
        typeof row.variantId === 'string' &&
        Number.isSafeInteger(row.quantity) &&
        row.quantity > 0
      )
        merged.set(row.variantId, (merged.get(row.variantId) || 0) + row.quantity);
    return [...merged].map(([variantId, quantity]) => ({ variantId, quantity }));
  } catch {
    return [];
  }
}
export function saveGuestCart(entries: CartEntry[]) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(entries.map(({ variantId, quantity }) => ({ variantId, quantity }))),
    );
  } catch {
    /* The in-memory cart remains usable. */
  }
  window.dispatchEvent(new Event('guest-cart-change'));
}
export const clearGuestCart = () => saveGuestCart([]);
