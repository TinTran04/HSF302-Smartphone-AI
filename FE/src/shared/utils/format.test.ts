import { describe, expect, it } from 'vitest';
import { formatVnd, productPrice, safeReturnPath } from './format';
describe('Display and return navigation', () => {
  it('formats Vietnamese currency', () => expect(formatVnd(34990000)).toContain('34.990.000'));
  it('uses only active variants for starting prices', () =>
    expect(
      productPrice({
        variants: [
          { price: 500, status: 'INACTIVE' },
          { price: 2000, status: 'ACTIVE' },
        ],
      }),
    ).toBe(2000));
  it('handles a product with no active variant', () =>
    expect(productPrice({ variants: [] })).toBeNull());
  it.each([
    '//evil.example',
    '/\\evil.example',
    'https://evil.example',
    '/login',
    '/register?redirect=/admin',
  ])('rejects unsafe or recursive return path %s', (path) =>
    expect(safeReturnPath(path)).toBe('/'),
  );
  it('preserves a valid checkout return path', () =>
    expect(safeReturnPath('/checkout')).toBe('/checkout'));
});
