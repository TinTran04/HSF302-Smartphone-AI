import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChatMessage } from './ChatMessage';
import { PendingAssistant } from './PendingAssistant';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api', () => ({ isDemo: false }));

const message = {
  id: 'answer',
  role: 'assistant' as const,
  content: 'This answer is already saved.',
  sources: [{ documentId: 'policy', documentName: 'Shop policy' }],
};

describe('chat message rendering', () => {
  it('renders old history and its sources in full immediately', () => {
    const html = renderToStaticMarkup(<ChatMessage message={message} />);
    expect(html).toContain('This answer is already saved.');
    expect(html).toContain('Shop policy');
    expect(html).not.toContain('data-revealing');
    expect(html).not.toContain('Hiển thị toàn bộ câu trả lời');
  });
  it('starts a newly received answer empty and defers source cards until the reveal completes', () => {
    const html = renderToStaticMarkup(<ChatMessage message={message} animate />);
    expect(html).toContain('data-revealing="true"');
    expect(html).toContain('data-testid="chat-reveal"></div>');
    expect(html).not.toContain('This answer is already saved.');
    expect(html).not.toContain('Shop policy');
    expect(html).toContain('aria-label="Hiển thị toàn bộ câu trả lời"');
  });
  it('keeps user bubbles immediate even if accidentally marked for animation', () => {
    const html = renderToStaticMarkup(
      <ChatMessage message={{ id: 'user', role: 'user', content: 'Outgoing question' }} animate />,
    );
    expect(html).toContain('Outgoing question');
    expect(html).not.toContain('data-revealing');
  });
  it('exposes one waiting status and three decorative wave dots', () => {
    const html = renderToStaticMarkup(<PendingAssistant />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Trợ lý đang xử lý câu hỏi"');
    expect(html).toContain(
      'class="chat-wave" aria-hidden="true"><span></span><span></span><span></span>',
    );
  });
});

describe('compact answer presentation', () => {
  const phone = (id: string, name: string) => ({
    id,
    name,
    brandId: 'b',
    brandName: 'Brand',
    description: '',
    images: [],
    status: 'ACTIVE' as const,
    specifications: {
      'Chip xử lý': 'Chip X, 3nm',
      RAM: '8 GB',
      Pin: '5000 mAh',
      'URL nguồn': 'https://x',
    },
    variants: [
      {
        id: `${id}-v`,
        color: 'Đen',
        colorHex: '#000000',
        storage: '256GB',
        price: 10000000,
        status: 'ACTIVE' as const,
      },
    ],
  });
  const answer = {
    id: 'a',
    role: 'assistant' as const,
    content: '1. **Máy A**\n  * Pin trâu',
    recommendedProducts: [phone('a', 'Máy A')],
    comparedProducts: [phone('a', 'Máy A'), phone('b', 'Máy B')],
  };
  it('renders lists instead of raw markdown and compact phone rows', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ChatMessage message={answer} compact />
      </MemoryRouter>,
    );
    expect(html).toContain('<ol><li><strong>Máy A</strong><ul><li>Pin trâu</li></ul></li></ol>');
    expect(html).not.toContain('**');
    expect(html).toContain('Chip X · 8 GB · 5000 mAh');
    expect(html.match(/class="chat-product"/g)).toHaveLength(2);
    expect(html).toContain('<details class="chat-compare">');
    expect(html).not.toContain('URL nguồn');
  });
  it('opens the comparison on the full page without repeating its phones in the list', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ChatMessage message={answer} />
      </MemoryRouter>,
    );
    expect(html).toContain('<details class="chat-compare" open="">');
    expect(html).not.toContain('class="chat-product"');
  });
});
