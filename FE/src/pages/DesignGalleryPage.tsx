import { lazy, Suspense, useMemo, type ComponentType } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Skeleton } from '../shared/components/Ui';
const screens = import.meta.glob<{ default: ComponentType }>('../design/stitch/*.tsx');
export default function DesignGalleryPage() {
  const [params, setParams] = useSearchParams();
  const names = Object.keys(screens)
    .map((p) => p.split('/').at(-1)!.replace('.tsx', ''))
    .sort();
  const selected = names.includes(params.get('screen') || '')
    ? params.get('screen')!
    : 'HomeDesign';
  const Screen = useMemo(() => lazy(screens[`../design/stitch/${selected}.tsx`]), [selected]);
  return (
    <div>
      <div className="sticky top-0 z-[100] bg-white border-b p-4 flex flex-wrap items-center gap-5">
        <Link to="/" className="text-link">
          ← Ứng dụng React
        </Link>
        <strong className="text-sm">14 bản JSX chuyển từ Stitch</strong>
        <select
          className="!w-auto"
          aria-label="Chọn bản thiết kế"
          value={selected}
          onChange={(e) => setParams({ screen: e.target.value })}
        >
          {names.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <p className="help-text">
          Bản đối chiếu tĩnh. Các tương tác dùng trong ứng dụng React chính.
        </p>
      </div>
      <div style={{ transform: 'translateZ(0)', minHeight: '100vh' }} inert>
        <Suspense fallback={<Skeleton count={1} />}>
          <Screen />
        </Suspense>
      </div>
    </div>
  );
}
