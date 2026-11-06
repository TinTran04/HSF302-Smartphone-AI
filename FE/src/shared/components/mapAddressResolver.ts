import type { MapLocation } from '../types/models';

type ResolverOptions = {
  lookup: (point: MapLocation, signal: AbortSignal) => Promise<{ label: string } | null>;
  onPendingChange: (pending: boolean) => void;
  onResolved: (address: string, point: MapLocation) => void;
  onFailure: () => void;
};

export function createMapAddressResolver(options: ResolverOptions) {
  let active: AbortController | null = null;

  function cancel() {
    if (!active) return;
    const request = active;
    active = null;
    request.abort();
    options.onPendingChange(false);
  }

  function select(point: MapLocation, isCurrent: () => boolean) {
    cancel();
    const request = new AbortController();
    active = request;
    options.onPendingChange(true);
    const finish = (result: { label: string } | null) => {
      if (active !== request || request.signal.aborted) return;
      const current = isCurrent();
      active = null;
      // The address callback changes the lookup context. Finish pending first.
      options.onPendingChange(false);
      if (!current) return;
      const label = result?.label.trim() ?? '';
      options.onResolved(label, point);
      if (!label) options.onFailure();
    };
    void options.lookup(point, request.signal).then(finish, () => finish(null));
  }

  return { select, cancel };
}
