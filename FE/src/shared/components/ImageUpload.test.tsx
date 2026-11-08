import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImageUpload, validateProductImage } from './ImageUpload';

vi.mock('../api', () => ({ api: { uploadProductImage: vi.fn() } }));

describe('product image files', () => {
  it.each(['image/png', 'image/jpeg', 'image/webp'])(
    'accepts %s images up to exactly 5 MiB',
    (type) => {
      expect(validateProductImage({ type, size: 5 * 1024 * 1024 })).toBeUndefined();
    },
  );

  it.each(['image/svg+xml', 'image/gif', 'application/pdf', ''])(
    'rejects unsupported MIME type %s before upload',
    (type) => {
      expect(validateProductImage({ type, size: 1024 })).toMatch(/PNG.*JPEG.*WebP/);
    },
  );

  it('rejects empty images and files one byte over the limit', () => {
    expect(validateProductImage({ type: 'image/png', size: 0 })).toMatch(/trống/);
    expect(validateProductImage({ type: 'image/png', size: 5 * 1024 * 1024 + 1 })).toMatch(/5 MB/);
  });

  it('offers a multiple file chooser and removable previews for existing gallery images', () => {
    const html = renderToStaticMarkup(
      <ImageUpload
        label="Hình ảnh sản phẩm"
        value={['/images/existing.jpg', '/api/product-images/uploaded.png']}
        onChange={() => {}}
        multiple
      />,
    );
    expect(html).toMatch(
      /<input[^>]*type="file"[^>]*accept="image\/png,image\/jpeg,image\/webp"[^>]*multiple=""/,
    );
    expect(html).toContain('src="/images/existing.jpg"');
    expect(html).toContain('src="/api/product-images/uploaded.png"');
    expect(html).toContain('aria-label="Bỏ ảnh Hình ảnh sản phẩm 1"');
    expect(html).not.toContain('<textarea');
    expect(html).not.toContain('type="url"');
  });

  it('keeps the variant chooser single and disables image changes with the form', () => {
    const html = renderToStaticMarkup(
      <ImageUpload
        label="Ảnh phiên bản 1"
        value={['/variant.webp']}
        onChange={() => {}}
        disabled
      />,
    );
    expect(html).toMatch(/<input[^>]*type="file"[^>]*disabled=""/);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Bỏ ảnh Ảnh phiên bản 1 1"/);
    expect(html).not.toContain('multiple=""');
  });
});
