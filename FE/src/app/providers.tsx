import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { AuthProvider } from '../features/auth/AuthProvider';
import { CartProvider } from '../features/cart/CartProvider';
import { ComparisonProvider } from '../features/comparison/ComparisonProvider';
import { ToastProvider } from '../shared/components/Ui';
import { ApiError } from '../shared/api/httpClient';
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
export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ComparisonProvider>{children}</ComparisonProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
