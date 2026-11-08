import { afterEach, describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './httpClient';
import { subscribeToMutationToasts } from './mutationToasts';

const clients: QueryClient[] = [];

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  const notifications: { message: string; tone?: 'success' | 'error' }[] = [];
  const unsubscribe = subscribeToMutationToasts(client.getMutationCache(), (message, tone) => {
    notifications.push({ message, tone });
  });
  return { client, notifications, unsubscribe };
}

afterEach(() => clients.splice(0).forEach((client) => client.clear()));

describe('business action notifications', () => {
  it('announces a successful mutation once after its callbacks finish', async () => {
    const { client, notifications } = setup();
    let saved = false;
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => 'saved',
      onSuccess: async () => {
        expect(notifications).toEqual([]);
        saved = true;
      },
    });

    await mutation.execute(undefined);

    expect(saved).toBe(true);
    expect(notifications).toEqual([{ message: 'Thao tác thành công.', tone: 'success' }]);
  });

  it('announces the server error once while preserving the failed result', async () => {
    const { client, notifications } = setup();
    const error = new ApiError(409, 'Sản phẩm đã ngừng bán.');
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => {
        throw error;
      },
    });

    await expect(mutation.execute(undefined)).rejects.toBe(error);

    expect(notifications).toEqual([{ message: 'Sản phẩm đã ngừng bán.', tone: 'error' }]);
  });

  it('uses the action-specific success message', async () => {
    const { client, notifications } = setup();
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => undefined,
      meta: { toast: { success: 'Đã cập nhật số lượng.' } },
    });

    await mutation.execute(undefined);

    expect(notifications).toEqual([{ message: 'Đã cập nhật số lượng.', tone: 'success' }]);
  });

  it('leaves actions with local notifications in control of both outcomes', async () => {
    const { client, notifications } = setup();
    const success = client.getMutationCache().build(client, {
      mutationFn: async () => undefined,
      meta: { toast: false },
    });
    const failure = client.getMutationCache().build(client, {
      mutationFn: async () => {
        throw new Error('Local failure');
      },
      meta: { toast: false },
    });

    await success.execute(undefined);
    await expect(failure.execute(undefined)).rejects.toThrow('Local failure');

    expect(notifications).toEqual([]);
  });

  it('keeps error feedback when an action already announces its own success', async () => {
    const { client, notifications } = setup();
    const success = client.getMutationCache().build(client, {
      mutationFn: async () => undefined,
      meta: { toast: { success: false } },
    });
    const failure = client.getMutationCache().build(client, {
      mutationFn: async () => {
        throw new Error('Mã OTP không hợp lệ.');
      },
      meta: { toast: { success: false } },
    });

    await success.execute(undefined);
    await expect(failure.execute(undefined)).rejects.toThrow('Mã OTP không hợp lệ.');

    expect(notifications).toEqual([{ message: 'Mã OTP không hợp lệ.', tone: 'error' }]);
  });

  it('does not announce background query outcomes', async () => {
    const { client, notifications } = setup();

    await client.fetchQuery({ queryKey: ['success'], queryFn: async () => 'data' });
    await expect(
      client.fetchQuery({
        queryKey: ['error'],
        queryFn: async () => {
          throw new Error('Background failure');
        },
      }),
    ).rejects.toThrow('Background failure');

    expect(notifications).toEqual([]);
  });

  it('stops receiving outcomes after unsubscribing', async () => {
    const { client, notifications, unsubscribe } = setup();
    unsubscribe();

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: async () => undefined,
      })
      .execute(undefined);

    expect(notifications).toEqual([]);
  });
});
