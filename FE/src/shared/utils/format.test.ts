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
  it('shows the last listed price for a sold-out product with no active variants', () => {
    expect(productPrice({ variants: [
      { price: 3000, status: 'INACTIVE' },
      { price: 2000, status: 'INACTIVE' },
    ] })).toBe(2000);
  });
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
  it('returns customers to the store after their Admin role is removed', () => {
    expect(safeReturnPath('/admin/accounts?tab=all', 'CUSTOMER')).toBe('/');
    expect(safeReturnPath('/admin', 'CUSTOMER')).toBe('/');
    expect(safeReturnPath('/ADMIN/accounts', 'CUSTOMER')).toBe('/');
    expect(safeReturnPath('/checkout', 'CUSTOMER')).toBe('/checkout');
    expect(safeReturnPath('/admin/accounts', 'ADMIN')).toBe('/admin/accounts');
  });
  it('keeps Admin return navigation inside the portal', () => {
    expect(safeReturnPath('/admin/products/1/edit', 'ADMIN')).toBe('/admin/products/1/edit');
    expect(safeReturnPath('/checkout', 'ADMIN')).toBe('/admin');
    expect(safeReturnPath('/administrator', 'ADMIN')).toBe('/admin');
    expect(safeReturnPath('//evil.example', 'ADMIN')).toBe('/admin');
    expect(safeReturnPath(undefined, 'ADMIN')).toBe('/admin');
  });
});
