import type { Product } from '../../shared/types/models';

export function catalogVariants(product: Product) {
  const active = product.variants.filter((variant) => variant.status === 'ACTIVE');
  return active.length ? active : product.variants;
}

export function isProductAvailable(product: Product) {
  return (
    product.status === 'ACTIVE' && product.variants.some((variant) => variant.status === 'ACTIVE')
  );
}
