import { useEffect, useRef, useState } from 'react';
import type { CircleMarker, Map as LeafletMap } from 'leaflet';
import type { MapLocation } from '../types/models';
import { Button, useToast } from './Ui';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

export function LocationPicker({
  value,
  onChange,
  disabled = false,
  address,
  revealKey = 0,
}: {
  value?: MapLocation | null;
  onChange?: (value: MapLocation | null) => void;
  disabled?: boolean;
  address?: string;
  revealKey?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<CircleMarker | null>(null);
  const requestId = useRef(0);
  const mounted = useRef(false);
  const { notify } = useToast();
  const point =
    value &&
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    Math.abs(value.latitude) <= 90 &&
    Math.abs(value.longitude) <= 180
      ? value
      : null;
  const current = useRef({ point, onChange, disabled, notify, address });
  current.current = { point, onChange, disabled, notify, address };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current++;
    };
  }, []);
  useEffect(() => {
    requestId.current++;
    setLocating(false);
  }, [disabled, address]);
  useEffect(() => {
    if (revealKey > 0) {
      requestId.current++;
      setLocating(false);
      setExpanded(true);
    }
  }, [revealKey]);

  useEffect(() => {
    if (!expanded) return;
    let disposed = false;
    setError('');
    void import('leaflet')
      .then((leaflet) => {
        if (disposed || !container.current) return;
        const selected = current.current.point;
        const initial: [number, number] = selected
          ? [selected.latitude, selected.longitude]
          : [10.7769, 106.7009];
        const instance = leaflet.map(container.current).setView(initial, selected ? 16 : 12);
        map.current = instance;
        leaflet
          .tileLayer(
            import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              maxZoom: 19,
              attribution:
                (import.meta.env.VITE_MAP_ATTRIBUTION ||
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors') +
                ' | <a href="https://www.geoapify.com/">Geoapify</a>',
            },
          )
          .on('tileerror', () => {
            if (!disposed)
              setError(
                'Chưa tải được bản đồ. Bạn vẫn có thể nhập địa chỉ hoặc dùng vị trí hiện tại.',
              );
          })
          .addTo(instance);
        const pin = leaflet.circleMarker(initial, {
          radius: 10,
          color: '#ffffff',
          weight: 3,
          fillColor: '#7151df',
          fillOpacity: 1,
        });
        marker.current = pin;
        if (selected) pin.addTo(instance);
        const select = (latitude: number, longitude: number) => {
          const state = current.current;
          if (state.disabled || !state.onChange) return;
          requestId.current++;
          setLocating(false);
          state.onChange({
            latitude: Number(latitude.toFixed(6)),
            longitude: Number((((((longitude + 180) % 360) + 360) % 360) - 180).toFixed(6)),
          });
          state.notify('Đã chọn vị trí trên bản đồ.');
        };
        instance.on('click', (event) => select(event.latlng.lat, event.latlng.lng));
        instance.on('keypress', (event) => {
          if (event.originalEvent.key === 'Enter') {
            event.originalEvent.preventDefault();
            const center = instance.getCenter();
            select(center.lat, center.lng);
          }
        });
        setReady(true);
      })
      .catch(() => {
        if (!disposed)
          setError('Chưa mở được bản đồ. Vui lòng thử lại hoặc nhập địa chỉ trực tiếp.');
      });
    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, [expanded]);

  useEffect(() => {
    const instance = map.current;
    const pin = marker.current;
    if (!instance || !pin) return;
    if (point) {
      pin.setLatLng([point.latitude, point.longitude]).addTo(instance);
      instance.setView([point.latitude, point.longitude], Math.max(instance.getZoom(), 15));
    } else pin.remove();
  }, [point?.latitude, point?.longitude, ready]);

  function locate() {
    if (!onChange || disabled || locating) return;
    if (!navigator.geolocation) {
      notify('Trình duyệt chưa hỗ trợ lấy vị trí. Bạn có thể chọn điểm trên bản đồ.', 'error');
      return;
    }
    const id = ++requestId.current;
    const requestedAddress = address;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const state = current.current;
        if (
          !mounted.current ||
          id !== requestId.current ||
          state.disabled ||
          !state.onChange ||
          state.address !== requestedAddress
        )
          return;
        setLocating(false);
        state.onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        state.notify('Đã chọn vị trí hiện tại.');
      },
      () => {
        if (
          !mounted.current ||
          id !== requestId.current ||
          current.current.address !== requestedAddress
        )
          return;
        setLocating(false);
        current.current.notify(
          'Chưa lấy được vị trí. Hãy kiểm tra quyền định vị hoặc chọn điểm trên bản đồ.',
          'error',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="location-picker">
      <p className="help-text" role="status">
        {point
          ? `Vị trí đã chọn · ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
          : 'Chưa chọn vị trí trên bản đồ.'}
      </p>
      <div className="location-actions">
        <Button
          variant="secondary"
          disabled={disabled && !point}
          aria-expanded={expanded}
          onClick={() => {
            requestId.current++;
            setLocating(false);
            setReady(false);
            setExpanded((open) => !open);
          }}
        >
          {expanded ? 'Đóng bản đồ' : point ? 'Xem vị trí trên bản đồ' : 'Chọn vị trí trên bản đồ'}
        </Button>
        {onChange && (
          <Button variant="ghost" disabled={disabled} busy={locating} onClick={locate}>
            Vị trí hiện tại
          </Button>
        )}
        {onChange && point && (
          <Button
            variant="ghost"
            disabled={disabled}
            onClick={() => {
              requestId.current++;
              setLocating(false);
              onChange(null);
              notify('Đã bỏ vị trí trên bản đồ.');
            }}
          >
            Bỏ vị trí
          </Button>
        )}
      </div>
      {expanded && (
        <>
          <p className="help-text">
            {onChange && !disabled
              ? 'Bấm trên bản đồ để chọn điểm. Dùng phím mũi tên để di chuyển, Enter để chọn tâm bản đồ.'
              : 'Vị trí được lưu cùng địa chỉ.'}
          </p>
          <div
            ref={container}
            className="location-map-canvas"
            role="region"
            aria-label="Bản đồ địa chỉ"
          />
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
