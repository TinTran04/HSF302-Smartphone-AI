import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { AuthProvider } from '../features/auth/AuthProvider';
import { CartProvider } from '../features/cart/CartProvider';
import { ComparisonProvider } from '../features/comparison/ComparisonProvider';
import { ToastProvider, useToast } from '../shared/components/Ui';
import { ApiError } from '../shared/api/httpClient';
import { subscribeToMutationToasts } from '../shared/api/mutationToasts';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, e) =>
        count < 1 && !(e instanceof ApiError && e.status >= 400 && e.status < 500),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
function MutationNotifications({ children }: PropsWithChildren) {
  const client = useQueryClient();
  const { notify } = useToast();
  useEffect(() => subscribeToMutationToasts(client.getMutationCache(), notify), [client, notify]);
  return children;
}
export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MutationNotifications>
          <AuthProvider>
            <CartProvider>
              <ComparisonProvider>{children}</ComparisonProvider>
            </CartProvider>
          </AuthProvider>
        </MutationNotifications>
      </ToastProvider>
    </QueryClientProvider>
  );
}
