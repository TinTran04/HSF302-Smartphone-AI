import { afterEach, expect, it, vi } from 'vitest';
import { http } from './httpClient';

afterEach(() => vi.unstubAllGlobals());

it('reports a request timeout separately from a network failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError')));
  await expect(http('/admin/ai-settings')).rejects.toMatchObject({ code: 'REQUEST_TIMEOUT' });
});
