import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { useAuth } from '../auth/AuthProvider';
import { readGuestCart, saveGuestCart } from './guestCart';
import type { Cart, CartEntry } from '../../shared/types/models';
interface CartValue {
  cart?: Cart;
  count: number;
  loading: boolean;
  error: unknown;
  pending: boolean;
  retry: () => void;
  add: (entry: CartEntry) => Promise<void>;
  update: (variantId: string, quantity: number) => Promise<void>;
  remove: (variantId: string) => Promise<void>;
}
const Context = createContext<CartValue | null>(null);
export function CartProvider({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();
  const customer = user?.role === 'CUSTOMER';
  const client = useQueryClient();
  const [entries, setEntries] = useState(readGuestCart);
  useEffect(() => {
    const sync = () => setEntries(readGuestCart());
    window.addEventListener('guest-cart-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('guest-cart-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const key = ['cart', customer ? user?.id : 'guest', customer ? [] : entries];
  const query = useQuery({
    queryKey: key,
    queryFn: () => (customer ? api.cart() : api.resolveCart(entries)),
    enabled: !loading,
  });
  const mutation = useMutation({
    mutationFn: async (action: {
      kind: 'add' | 'update' | 'remove';
      variantId: string;
      quantity?: number;
    }) => {
      if (customer) {
        const cart =
          action.kind === 'add'
            ? await api.addCart({ variantId: action.variantId, quantity: action.quantity! })
            : action.kind === 'update'
              ? await api.updateCart(action.variantId, action.quantity!)
              : await api.removeCart(action.variantId);
        client.setQueryData(key, cart);
      } else {
        const current = readGuestCart();
        let next: CartEntry[];
        if (action.kind === 'remove')
          next = current.filter((i) => i.variantId !== action.variantId);
        else {
          const existing = current.find((i) => i.variantId === action.variantId);
          const quantity =
            action.kind === 'add' ? (existing?.quantity || 0) + action.quantity! : action.quantity!;
          if (!Number.isSafeInteger(quantity) || quantity < 1)
            throw new Error('Số lượng phải là số nguyên dương.');
          next = existing
            ? current.map((i) => (i.variantId === action.variantId ? { ...i, quantity } : i))
            : [...current, { variantId: action.variantId, quantity }];
        }
        saveGuestCart(next);
        setEntries(next);
      }
    },
  });
  const value: CartValue = {
    cart: query.data,
    count: (query.data?.items || []).reduce((sum, i) => sum + i.quantity, 0),
    loading: query.isPending,
    pending: mutation.isPending,
    error: query.error,
    retry: () => {
      void query.refetch();
    },
    add: (entry) => mutation.mutateAsync({ kind: 'add', ...entry }),
    update: (variantId, quantity) => mutation.mutateAsync({ kind: 'update', variantId, quantity }),
    remove: (variantId) => mutation.mutateAsync({ kind: 'remove', variantId }),
  };
  return <Context value={value}>{children}</Context>;
}
export function useCart() {
  const cart = useContext(Context);
  if (!cart) throw new Error('CartProvider missing');
  return cart;
}
