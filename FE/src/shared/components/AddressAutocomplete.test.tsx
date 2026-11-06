import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AddressAutocomplete } from './AddressAutocomplete';

vi.mock('../api', () => ({ api: { addressSuggestions: vi.fn() } }));

describe('address autocomplete field', () => {
  it('keeps the exact field label separate from the suggestions and help text', () => {
    const html = renderToStaticMarkup(
      <AddressAutocomplete
        label="Địa chỉ"
        value="12 Nguyễn Huệ, TP. Hồ Chí Minh"
        onChange={() => {}}
        onSelect={() => {}}
        required
      />,
    );
    const label = html.match(/<label for="([^"]+)">([^<]+)<\/label>/);
    expect(label?.[2]).toBe('Địa chỉ');
    expect(html).toContain(`id="${label?.[1]}"`);
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('autoComplete="off"');
    expect(html).toContain('required=""');
    expect(html).toContain('value="12 Nguyễn Huệ, TP. Hồ Chí Minh"');
    expect(html).not.toContain('role="option"');
    expect(html).not.toContain('Đang tìm');
    expect(html).not.toContain('<button');
  });

  it('preserves the checkout textarea and its native address length validation', () => {
    const html = renderToStaticMarkup(
      <AddressAutocomplete
        label="Địa chỉ nhận hàng"
        value="Địa chỉ nhập thủ công"
        onChange={() => {}}
        onSelect={() => {}}
        multiline
        required
        minLength={8}
        maxLength={255}
        className="checkout-address"
      />,
    );
    expect(html).toMatch(/<textarea[^>]*minLength="8"[^>]*maxLength="255"/);
    expect(html).toContain('>Địa chỉ nhập thủ công</textarea>');
    expect(html).toContain('checkout-address');
    expect(html).not.toContain('pattern=');
    expect(html).not.toContain('aria-invalid="true"');
  });

  it('keeps optional text usable and disables editing with the parent form', () => {
    const html = renderToStaticMarkup(
      <AddressAutocomplete
        label="Địa chỉ"
        value=""
        onChange={() => {}}
        onSelect={() => {}}
        disabled
      />,
    );
    expect(html).toMatch(/<input[^>]*disabled=""/);
    expect(html).not.toContain('required=""');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Chọn gợi ý để ghim vị trí trên bản đồ, hoặc nhập địa chỉ thủ công.');
    expect(html).not.toContain('Powered by Geoapify');
    expect(html).not.toContain('href="https://www.geoapify.com/"');
  });
});
