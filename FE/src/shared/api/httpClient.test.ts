import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function response(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=csrf-value' });
  vi.stubGlobal('navigator', {});
});

afterEach(() => vi.unstubAllGlobals());

describe('JWT cookie renewal', () => {
  it('reports a request timeout separately from a network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError')),
    );
    const { http } = await import('./httpClient');
    await expect(http('/admin/ai-settings')).rejects.toMatchObject({ code: 'REQUEST_TIMEOUT' });
  });

  it('renews an expired access cookie before retrying the protected request', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(204))
      .mockResolvedValueOnce(response(200, { id: 'user' }));
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    await expect(http('/users/me')).resolves.toEqual({ id: 'user' });

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      '/api/users/me',
      '/api/auth/refresh',
      '/api/users/me',
    ]);
    expect(fetch.mock.calls[1][1]).toMatchObject({ method: 'POST', credentials: 'include' });
    expect(new Headers(fetch.mock.calls[1][1].headers).get('X-XSRF-TOKEN')).toBe('csrf-value');
  });

  it('shares one renewal across concurrent protected requests', async () => {
    let release!: (value: Response) => void;
    const renewal = new Promise<Response>((resolve) => {
      release = resolve;
    });
    let refreshed = false;
    const fetch = vi.fn(async (url: string) => {
      if (url === '/api/auth/refresh') {
        const result = await renewal;
        refreshed = true;
        return result;
      }
      return refreshed ? response(200, []) : response(401);
    });
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    const first = http('/cart');
    const second = http('/orders');
    void first.catch(() => {});
    void second.catch(() => {});
    await vi.waitFor(() =>
      expect(fetch.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(1),
    );
    release(response(204));

    await expect(Promise.all([first, second])).resolves.toEqual([[], []]);
    expect(fetch.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(1);
  });

  it('uses the completed renewal for a late unauthorized response from the same generation', async () => {
    let release!: (value: Response) => void;
    const delayed = new Promise<Response>((resolve) => {
      release = resolve;
    });
    let orderCalls = 0;
    let userCalls = 0;
    const fetch = vi.fn(async (url: string) => {
      if (url === '/api/auth/refresh') return response(204);
      if (url === '/api/orders' && ++orderCalls === 1) return delayed;
      if (url === '/api/users/me' && ++userCalls === 1) return response(401);
      return response(200, []);
    });
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    const orders = http('/orders');
    await http('/users/me');
    release(response(401));
    await orders;

    expect(fetch.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(1);
  });

  it('preserves a POST body, CSRF token and idempotency key on the single retry', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(204))
      .mockResolvedValueOnce(response(200, { id: 'order' }));
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');
    const body = JSON.stringify({ previewId: 'preview', paymentMethod: 'COD' });

    await http('/orders', { method: 'POST', body, headers: { 'Idempotency-Key': 'stable-key' } });

    for (const call of [fetch.mock.calls[0], fetch.mock.calls[2]]) {
      expect(call[1]).toMatchObject({ method: 'POST', body, credentials: 'include' });
      const headers = new Headers(call[1].headers);
      expect(headers.get('Idempotency-Key')).toBe('stable-key');
      expect(headers.get('X-XSRF-TOKEN')).toBe('csrf-value');
    }
  });

  it('returns unauthorized without replaying the business request if refresh is revoked', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(401));
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    await expect(http('/orders', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 401,
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('never refreshes a login failure or a forbidden request', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(401, { message: 'Sai mật khẩu.' }))
      .mockResolvedValueOnce(response(403));
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    await expect(http('/auth/login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      message: 'Sai mật khẩu.',
    });
    await expect(http('/admin/accounts')).rejects.toMatchObject({ status: 403 });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('stops after one retry when the renewed access token is also rejected', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(204))
      .mockResolvedValueOnce(response(401));
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    await expect(http('/users/me')).rejects.toMatchObject({ status: 401 });

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('serializes renewal across browser tabs through a Web Lock', async () => {
    const request = vi.fn(async (_name: string, operation: () => Promise<void>) => operation());
    vi.stubGlobal('navigator', { locks: { request } });
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(204))
      .mockResolvedValueOnce(response(200, {}));
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    await http('/users/me');

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('rejects an old mutation after logout and login as a different account', async () => {
    let release!: (value: Response) => void;
    const delayed = new Promise<Response>((resolve) => {
      release = resolve;
    });
    let orderCalls = 0;
    const fetch = vi.fn(async (url: string) => {
      if (url === '/api/orders' && ++orderCalls === 1) return delayed;
      if (url === '/api/auth/logout') return response(204);
      return response(200, { user: { id: 'other-account' } });
    });
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');
    const oldOrder = http('/orders', { method: 'POST', body: '{"previewId":"first-account"}' });
    const rejected = expect(oldOrder).rejects.toMatchObject({ code: 'AUTH_CONTEXT_CHANGED' });
    await vi.waitFor(() => expect(orderCalls).toBe(1));
    await http('/auth/logout', { method: 'POST' });
    await http('/auth/login', { method: 'POST', body: '{}' });
    release(response(401));

    await rejected;

    expect(orderCalls).toBe(1);
    expect(fetch.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(0);
  });

  it('rejects an old mutation if another tab changes the shared account marker', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    let release!: (value: Response) => void;
    const delayed = new Promise<Response>((resolve) => {
      release = resolve;
    });
    let orderCalls = 0;
    const fetch = vi.fn(async (url: string) => {
      if (url === '/api/orders' && ++orderCalls === 1) return delayed;
      return response(200, {});
    });
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');
    await http('/auth/login', { method: 'POST', body: '{}' });
    const oldOrder = http('/orders', { method: 'POST', body: '{}' });
    const rejected = expect(oldOrder).rejects.toMatchObject({ code: 'AUTH_CONTEXT_CHANGED' });
    await vi.waitFor(() => expect(orderCalls).toBe(1));
    expect(storage.size).toBe(1);
    for (const key of storage.keys()) storage.set(key, 'another-tab-login');
    release(response(401));

    await rejected;

    expect(orderCalls).toBe(1);
  });

  it('rejects a late login body after another login has completed', async () => {
    let release!: (value: unknown) => void;
    const delayed = new Promise((resolve) => {
      release = resolve;
    });
    const firstResponse = response(200);
    firstResponse.json = vi.fn(() => delayed);
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(response(200, { user: { id: 'second-account' } }));
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');
    const first = http('/auth/login', { method: 'POST', body: '{}' });
    const rejected = expect(first).rejects.toMatchObject({ code: 'AUTH_CONTEXT_CHANGED' });
    await vi.waitFor(() => expect(firstResponse.json).toHaveBeenCalled());
    await expect(http('/auth/login', { method: 'POST', body: '{}' })).resolves.toMatchObject({
      user: { id: 'second-account' },
    });
    release({ user: { id: 'first-account' } });

    await rejected;
  });

  it('requires the current account for AI calls but leaves identity lookup available', async () => {
    const fetch = vi.fn().mockResolvedValue(response(200, {}));
    vi.stubGlobal('fetch', fetch);
    const { http, setAuthAccount } = await import('./httpClient');
    setAuthAccount('account-id');

    await http('/ai/conversations');
    await http('/users/me');
    await http('/maintenance');

    expect(new Headers(fetch.mock.calls[0][1].headers).get('X-Account-Id')).toBe('account-id');
    expect(new Headers(fetch.mock.calls[1][1].headers).has('X-Account-Id')).toBe(false);
    expect(new Headers(fetch.mock.calls[2][1].headers).has('X-Account-Id')).toBe(false);
  });

  it('reacquires CSRF after renewal before replaying a mutation', async () => {
    let orderCalls = 0;
    const csrfHeaders: (string | null)[] = [];
    const fetch = vi.fn(async (url: string, init: RequestInit) => {
      if (url === '/api/auth/refresh') {
        document.cookie = '';
        return response(204);
      }
      if (url === '/api/auth/csrf') {
        document.cookie = 'XSRF-TOKEN=renewed-csrf';
        return response(200, { token: 'renewed-csrf' });
      }
      csrfHeaders.push(new Headers(init.headers).get('X-XSRF-TOKEN'));
      return ++orderCalls === 1 ? response(401) : response(200, {});
    });
    vi.stubGlobal('fetch', fetch);
    const { http } = await import('./httpClient');

    await http('/orders', { method: 'POST', body: '{}' });

    expect(csrfHeaders).toEqual(['csrf-value', 'renewed-csrf']);
  });
});
