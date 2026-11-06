import { createContext, useContext, useEffect, type PropsWithChildren } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import type { User } from '../../shared/types/models';
import { AUTH_CONTEXT_STORAGE_KEY } from '../../shared/api/httpClient';
interface AuthValue {
  user: User | null;
  loading: boolean;
  error: unknown;
  retry: () => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}
const Context = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['me'], queryFn: api.me, retry: false, staleTime: 60000 });
  useEffect(() => {
    const accountChanged = (event: StorageEvent) => {
      if (event.key !== AUTH_CONTEXT_STORAGE_KEY) return;
      void client.cancelQueries();
      client.removeQueries({ predicate: (item) => item.queryKey[0] !== 'me' });
      void client.invalidateQueries({ queryKey: ['me'] });
    };
    window.addEventListener('storage', accountChanged);
    return () => window.removeEventListener('storage', accountChanged);
  }, [client]);
  const value: AuthValue = {
    user: query.data ?? null,
    loading: query.isPending,
    error: query.error,
    retry: () => {
      void query.refetch();
    },
    setUser: (user) => {
      void client.cancelQueries({ queryKey: ['me'] });
      client.setQueryData(['me'], user);
      client.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
    },
    logout: async () => {
      await api.logout();
      await client.cancelQueries();
      client.setQueryData(['me'], null);
      client.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
      client.getMutationCache().clear();
    },
  };
  return <Context value={value}>{children}</Context>;
}
export function useAuth() {
  const auth = useContext(Context);
  if (!auth) throw new Error('AuthProvider missing');
  return auth;
}
