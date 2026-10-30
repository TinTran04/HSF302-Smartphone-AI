import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api';
export function useProducts(params = new URLSearchParams(), admin = false) {
  return useQuery({
    queryKey: ['products', admin, params.toString()],
    queryFn: () => api.products(params, admin),
  });
}
export function useProduct(id?: string, admin = false) {
  return useQuery({
    queryKey: ['product', admin, id],
    queryFn: () => api.product(id!, admin),
    enabled: !!id,
  });
}
export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: api.brands });
}
