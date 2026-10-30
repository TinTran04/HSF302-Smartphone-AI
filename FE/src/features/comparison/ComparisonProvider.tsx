import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import type { Product } from '../../shared/types/models';
import { useToast } from '../../shared/components/Ui';
interface ComparisonValue {
  products: Product[];
  toggle: (product: Product) => void;
  clear: () => void;
}
const Context = createContext<ComparisonValue | null>(null);
export function ComparisonProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>([]);
  const { notify } = useToast();
  function toggle(product: Product) {
    if (products.some((p) => p.id === product.id))
      setProducts((current) => current.filter((p) => p.id !== product.id));
    else if (products.length >= 3) notify('Bạn chỉ có thể so sánh tối đa 3 điện thoại.', 'error');
    else {
      setProducts((current) => [...current, product]);
      notify(`Đã thêm ${product.name} vào so sánh.`);
    }
  }
  return <Context value={{ products, toggle, clear: () => setProducts([]) }}>{children}</Context>;
}
export function useComparison() {
  const value = useContext(Context);
  if (!value) throw new Error('ComparisonProvider missing');
  return value;
}
