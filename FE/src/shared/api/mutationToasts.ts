import type { MutationCache } from '@tanstack/react-query';
import { errorMessage } from '../utils/format';

type MutationToastMeta = Record<string, unknown> & {
  toast?: false | { success?: string | false; error?: string | false };
};

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: MutationToastMeta;
  }
}

type Notify = (message: string, tone?: 'success' | 'error') => void;

export function subscribeToMutationToasts(cache: MutationCache, notify: Notify) {
  return cache.subscribe((event) => {
    if (event.type !== 'updated' || event.mutation.meta?.toast === false) return;
    const messages = event.mutation.meta?.toast;
    if (event.action.type === 'success' && messages?.success !== false) {
      notify(messages?.success ?? 'Thao tác thành công.', 'success');
    }
    if (event.action.type === 'error' && messages?.error !== false) {
      notify(messages?.error ?? errorMessage(event.action.error), 'error');
    }
  });
}
