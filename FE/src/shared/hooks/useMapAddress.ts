import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { MapLocation } from '../types/models';
import { useToast } from '../components/Ui';

type Lookup = { id: number; point: MapLocation };

export function useMapAddress({
  address,
  location,
  enabled,
  onChange,
}: {
  address: string;
  location?: MapLocation | null;
  enabled: boolean;
  onChange: (address: string, location: MapLocation | null) => void;
}) {
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const current = useRef({ address, location, enabled, onChange });
  current.current = { address, location, enabled, onChange };
  const { notify } = useToast();

  function cancel() {
    generation.current++;
    controller.current?.abort();
    setLookup(null);
  }

  function select(point: MapLocation | null) {
    if (!current.current.enabled) return;
    cancel();
    if (!point) {
      current.current.onChange(current.current.address, null);
      return;
    }
    // Clear the old address immediately so a newly chosen pin cannot keep its label.
    current.current.onChange('', point);
    setLookup({ id: generation.current, point });
  }

  useEffect(() => {
    if (!lookup) return;
    const sameSelection = () => {
      const state = current.current;
      return (
        state.enabled &&
        state.address === '' &&
        state.location?.latitude === lookup.point.latitude &&
        state.location?.longitude === lookup.point.longitude
      );
    };
    if (!sameSelection()) {
      setLookup(null);
      return;
    }
    const request = new AbortController();
    controller.current = request;
    const isCurrent = () =>
      !request.signal.aborted && generation.current === lookup.id && sameSelection();
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(10000)]);
    void api.reverseLocation(lookup.point, signal).then(
      (result) => {
        if (!isCurrent()) return;
        const label = result?.label?.trim();
        if (label && label.length <= 255) {
          current.current.onChange(label, lookup.point);
          notify('Đã cập nhật địa chỉ theo vị trí trên bản đồ.');
        } else {
          notify('Chưa tìm được địa chỉ tại điểm này. Bạn hãy nhập địa chỉ nhận hàng.', 'error');
        }
        setLookup(null);
      },
      () => {
        if (!isCurrent()) return;
        notify(
          'Chưa lấy được địa chỉ từ bản đồ. Bạn hãy nhập địa chỉ hoặc chọn lại điểm.',
          'error',
        );
        setLookup(null);
      },
    );
    return () => request.abort();
  }, [lookup, address, location?.latitude, location?.longitude, enabled, notify]);

  return { select, cancel, resolving: lookup !== null };
}
