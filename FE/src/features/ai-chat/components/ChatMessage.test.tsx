import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChatMessage } from './ChatMessage';
import { PendingAssistant } from './PendingAssistant';

vi.mock('../../../shared/api', () => ({ isDemo: false }));

const message = {
  id: 'answer',
  role: 'assistant' as const,
  content: 'This answer is already saved.',
  sources: [{ documentId: 'policy-private-id', documentName: 'Shop policy', excerpt: 'Private excerpt', pageNumber: 7 }],
};

describe('chat message rendering', () => {
  it('renders saved history without exposing document sources', () => {
    const html = renderToStaticMarkup(<ChatMessage message={message} />);
    expect(html).toContain('This answer is already saved.');
    expect(html).not.toContain('Shop policy');
    expect(html).not.toContain('Private excerpt');
    expect(html).not.toContain('policy-private-id');
    expect(html).not.toContain('source-card');
    expect(html).not.toContain('data-revealing');
    expect(html).not.toContain('Hiển thị toàn bộ câu trả lời');
  });
  it('starts a newly received answer empty without document sources', () => {
    const html = renderToStaticMarkup(<ChatMessage message={message} animate />);
    expect(html).toContain('data-revealing="true"');
    expect(html).toContain('data-testid="chat-reveal"></p>');
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
