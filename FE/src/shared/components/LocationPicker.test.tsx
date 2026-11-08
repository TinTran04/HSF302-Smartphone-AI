import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocationPicker } from './LocationPicker';

describe('optional address map', () => {
  it('starts collapsed and keeps text-only legacy addresses usable', () => {
    const html = renderToStaticMarkup(<LocationPicker value={null} onChange={() => {}} />);
    expect(html).toContain('Chưa chọn vị trí trên bản đồ.');
    expect(html).toContain('Chọn vị trí trên bản đồ');
    expect(html).not.toContain('location-map-canvas');
    expect(html).not.toContain('<iframe');
  });

  it('shows a persisted point, including zero coordinates, without loading map tiles', () => {
    const html = renderToStaticMarkup(<LocationPicker value={{ latitude: 0, longitude: 0 }} />);
    expect(html).toContain('0.000000, 0.000000');
    expect(html).toContain('Xem vị trí trên bản đồ');
    expect(html).not.toContain('Vị trí hiện tại');
    expect(html).not.toContain('Bỏ vị trí');
  });

  it('disables pin editing with a locked profile or pending checkout', () => {
    const html = renderToStaticMarkup(<LocationPicker value={null} onChange={() => {}} disabled />);
    expect(html).toMatch(/<button[^>]*disabled=""/);
    expect(html).not.toContain('location-map-canvas');
  });
});
