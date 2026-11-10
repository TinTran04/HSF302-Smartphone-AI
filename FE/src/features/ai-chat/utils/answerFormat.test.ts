import { describe, expect, it } from 'vitest';
import { compactSpec, parseAnswer, parseInline } from './answerFormat';

describe('AI answer formatting', () => {
  it('turns model markdown into paragraphs, numbered items and nested bullets', () => {
    const blocks = parseAnswer(
      'Có 2 lựa chọn:\n\n1. **iPhone 17 Pro Max**\n  * **Giá bán:** 41.000.000 VNĐ\n  * Pin trâu\n2. **Poco F7 Ultra**\n\nBạn ưu tiên camera hay pin?',
    );
    expect(blocks.map((block) => block.type)).toEqual(['paragraph', 'list', 'paragraph']);
    const list = blocks[1];
    expect(list.type === 'list' && list.ordered).toBe(true);
    expect(list.type === 'list' && list.items.map((item) => item.depth)).toEqual([0, 1, 1, 0]);
    expect(list.type === 'list' && list.items[1].parts).toEqual([
      { text: 'Giá bán:', strong: true },
      { text: ' 41.000.000 VNĐ' },
    ]);
  });
  it('keeps model markup as text and drops stray emphasis markers', () => {
    expect(parseInline('<b>x</b> **đậm')).toEqual([{ text: '<b>x</b> đậm' }]);
    expect(parseAnswer('## Kết luận')).toEqual([
      { type: 'paragraph', parts: [{ text: 'Kết luận', strong: true }] },
    ]);
  });
  it('shortens long dataset specs', () => {
    expect(
      compactSpec(
        '6.9 inches, 116.9 cm2 (~91.2% screen-to-body ratio) · LTPO Super Retina XDR OLED, 120Hz, HDR10',
      ),
    ).toBe('6.9 inches · LTPO Super Retina XDR OLED, 120Hz');
    expect(compactSpec('50 MP, f/1.8, 26mm (wide)', 1)).toBe('50 MP');
    expect(compactSpec(null)).toBe('');
  });
});
