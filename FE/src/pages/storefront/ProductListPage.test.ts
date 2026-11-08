import { expect, it } from 'vitest';
import { sanitizeCatalogParams } from './ProductListPage';

it('keeps descending name sort in the catalog URL', () => {
  expect(sanitizeCatalogParams(new URLSearchParams('sort=name%2Cdesc')).get('sort')).toBe('name,desc');
});
