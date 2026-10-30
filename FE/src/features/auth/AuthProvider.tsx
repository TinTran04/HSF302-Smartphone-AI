import { createContext, useContext, type PropsWithChildren } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import type { User } from '../../shared/types/models';
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
