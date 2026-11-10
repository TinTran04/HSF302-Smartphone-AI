/**
 * Turns the light markdown that AI models tend to emit into a small, safe block model.
 * Only lists, paragraphs and **bold** are recognised; everything stays plain text for React to escape.
 */
export type InlinePart = { text: string; strong?: boolean };
export type AnswerBlock =
  | { type: 'paragraph'; parts: InlinePart[] }
  | { type: 'list'; ordered: boolean; items: { parts: InlinePart[]; depth: number }[] };

const BULLET = /^(\s*)(?:[-*•+])\s+(.*)$/;
const NUMBERED = /^(\s*)\d{1,2}[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /\*\*(.+?)\*\*|__(.+?)__/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ text: match[1] ?? match[2], strong: true });
    last = match.index! + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  // Drop stray emphasis markers left by unfinished formatting (e.g. while the answer is revealing).
  return parts
    .map((part) => ({
      ...part,
      text: part.text.replace(/\*\*/g, '').replace(/(^|\s)\*(?=\S)|(?<=\S)\*(?=\s|$)/g, '$1'),
    }))
    .filter((part) => part.text.length > 0);
}

export function parseAnswer(content: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length)
      blocks.push({ type: 'paragraph', parts: parseInline(paragraph.join('\n')) });
    paragraph = [];
  };
  for (const raw of content.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      flush();
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      blocks.push({
        type: 'paragraph',
        parts: [{ text: heading[1].replace(/\*\*/g, ''), strong: true }],
      });
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      flush();
      const ordered = !!numbered;
      const depth = Math.min(2, Math.floor(item[1].replace(/\t/g, '  ').length / 2));
      const previous = blocks[blocks.length - 1];
      const entry = { parts: parseInline(item[2]), depth };
      if (previous?.type === 'list' && (previous.ordered === ordered || depth > 0))
        previous.items.push(entry);
      else blocks.push({ type: 'list', ordered, items: [entry] });
      continue;
    }
    paragraph.push(line.trim());
  }
  flush();
  return blocks;
}

const NOISE = /cm2|%|µm|ppi|\(peak\)|"|″/i;

/** Keeps the first meaningful pieces of a long dataset spec, e.g. "6.9 inches · OLED, 120Hz". */
export function compactSpec(value: string | number | null | undefined, pieces = 2) {
  if (value === null || value === undefined) return '';
  return String(value)
    .split(' · ')
    .map((group) =>
      group
        .split(',')
        .map((piece) => piece.trim())
        .filter((piece) => piece && !NOISE.test(piece))
        .slice(0, pieces)
        .join(', '),
    )
    .filter(Boolean)
    .slice(0, 2)
    .join(' · ');
}

/** Specs that matter when choosing a phone, in display order. */
export const keySpecs = [
  'Chip xử lý',
  'RAM',
  'Bộ nhớ',
  'Màn hình',
  'Camera',
  'Pin',
  'Sạc',
  'Hệ điều hành',
];
