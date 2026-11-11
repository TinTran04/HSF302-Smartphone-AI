import { useEffect, useRef, useState } from 'react';
import type { MascotSkin } from '../skins';
import type { MascotController, MascotGesture, MascotMood } from './mascotScene';

export function supportsWebGl() {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

/** 2D stand-in used before three.js loads and on devices without WebGL. */
export function MascotFallback({ skin, mood }: { skin: MascotSkin; mood: MascotMood }) {
  const c = skin.colors;
  return (
    <span
      className={`mascot-fallback ${mood === 'thinking' ? 'is-thinking' : ''}`}
      aria-hidden="true"
    >
      <span className="mascot-fallback-head" style={{ background: c.skin, borderColor: c.hair }}>
        <span className="mascot-fallback-eye" style={{ background: c.iris }} />
        <span className="mascot-fallback-eye" style={{ background: c.iris }} />
      </span>
      <span
        className="mascot-fallback-body"
        style={{ background: c.outfit, borderColor: c.trim }}
      />
    </span>
  );
}

export function Mascot({
  skin,
  mood,
  gesture,
}: {
  skin: MascotSkin;
  mood: MascotMood;
  /** Changing `key` replays the gesture. */
  gesture?: { name: MascotGesture; key: number };
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<MascotController | null>(null);
  const latest = useRef({ skin, mood });
  latest.current = { skin, mood };
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    const element = canvas.current;
    if (!element || !supportsWebGl()) {
      setState('fallback');
      return;
    }
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onPointer = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      const x = (event.clientX - (box.left + box.width / 2)) / (window.innerWidth / 2);
      const y = (event.clientY - (box.top + box.height * 0.3)) / (window.innerHeight / 2);
      controller.current?.look(x, y);
    };
    // Load three.js after the page is idle so it never competes with the storefront.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const handle = idle(() => {
      void import('./mascotScene')
        .then(({ createMascot }) => {
          if (cancelled) return;
          const instance = createMascot(element, latest.current.skin, { reducedMotion });
          instance.setMood(latest.current.mood);
          instance.resize(element.clientWidth, element.clientHeight);
          controller.current = instance;
          observer = new ResizeObserver(() =>
            instance.resize(element.clientWidth, element.clientHeight),
          );
          observer.observe(element);
          window.addEventListener('pointermove', onPointer, { passive: true });
          setState('ready');
        })
        .catch(() => !cancelled && setState('fallback'));
    });
    return () => {
      cancelled = true;
      if (typeof handle === 'number' && !window.requestIdleCallback) window.clearTimeout(handle);
      else window.cancelIdleCallback?.(handle as number);
      observer?.disconnect();
      window.removeEventListener('pointermove', onPointer);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => controller.current?.setSkin(skin), [skin, state]);
  useEffect(() => controller.current?.setMood(mood), [mood, state]);
  useEffect(() => {
    if (gesture) controller.current?.play(gesture.name);
  }, [gesture, state]);

  return (
    <span className="mascot" data-state={state}>
      <canvas ref={canvas} className="mascot-canvas" aria-hidden="true" />
      {state !== 'ready' && <MascotFallback skin={skin} mood={mood} />}
    </span>
  );
}
