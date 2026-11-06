import { describe, expect, it } from 'vitest';
import type { MapLocation } from '../types/models';
import { createMapAddressResolver } from './mapAddressResolver';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function setup() {
  const requests: {
    point: MapLocation;
    signal: AbortSignal;
    response: ReturnType<typeof deferred<{ label: string } | null>>;
  }[] = [];
  const events: unknown[] = [];
  const resolver = createMapAddressResolver({
    lookup: (point, signal) => {
      const response = deferred<{ label: string } | null>();
      requests.push({ point, signal, response });
      return response.promise;
    },
    onPendingChange: (pending) => events.push(pending),
    onResolved: (address, point) => events.push({ address, point }),
    onFailure: () => events.push('manual input'),
  });
  return { resolver, requests, events };
}

const first = { latitude: 10.123456, longitude: 106.654321 };
const second = { latitude: 11.012345, longitude: 107.54321 };
const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

describe('map address resolution', () => {
  it('unblocks submission before delivering an address with the exact selected point', async () => {
    const { resolver, requests, events } = setup();
    resolver.select(first, () => true);
    expect(events).toEqual([true]);
    requests[0].response.resolve({ label: 'Selected street' });
    await flush();
    expect(events).toEqual([true, false, { address: 'Selected street', point: first }]);
    expect((events[2] as { point: MapLocation }).point).toBe(first);
  });

  it('aborts the previous request and ignores its late result after a new point', async () => {
    const { resolver, requests, events } = setup();
    resolver.select(first, () => true);
    resolver.select(second, () => true);
    expect(requests[0].signal.aborted).toBe(true);
    requests[1].response.resolve({ label: 'New street' });
    requests[0].response.resolve({ label: 'Old street' });
    await flush();
    expect(events).toEqual([true, false, true, false, { address: 'New street', point: second }]);
  });

  it('cancels and unblocks immediately without delivering a late failure', async () => {
    const { resolver, requests, events } = setup();
    resolver.select(first, () => true);
    resolver.cancel();
    resolver.cancel();
    expect(requests[0].signal.aborted).toBe(true);
    requests[0].response.reject(new Error('aborted'));
    await flush();
    expect(events).toEqual([true, false]);
  });

  it('rejects a response when the current text or point has changed', async () => {
    const { resolver, requests, events } = setup();
    let unchanged = true;
    resolver.select(first, () => unchanged);
    unchanged = false;
    requests[0].response.resolve({ label: 'Outdated street' });
    await flush();
    expect(events).toEqual([true, false]);
  });

  it.each(['missing', 'empty', 'error'])('clears outdated text and requests manual input on %s', async (kind) => {
    const { resolver, requests, events } = setup();
    resolver.select(first, () => true);
    if (kind === 'error') requests[0].response.reject(new Error('offline'));
    else requests[0].response.resolve(kind === 'missing' ? null : { label: '  ' });
    await flush();
    expect(events).toEqual([true, false, { address: '', point: first }, 'manual input']);
  });
});
