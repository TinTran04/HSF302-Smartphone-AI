import { useEffect } from 'react';
import type { ChatMessage as Message } from '../../../shared/types/models';
import { ChatComparison, ChatProductList } from './ChatProducts';
import { FormattedAnswer } from './FormattedAnswer';
import { Icon } from '../../../shared/components/Icon';
import { useAnswerReveal } from '../hooks/useAnswerReveal';
import './ChatPresentation.css';
export function ChatMessage({
  message,
  animate = false,
  compact = false,
  onProgress,
}: {
  message: Message;
  animate?: boolean;
  /** Narrow layout used by the floating assistant. */
  compact?: boolean;
  onProgress?: () => void;
}) {
  const { text, revealing, skip } = useAnswerReveal(
    message.content,
    animate && message.role === 'assistant',
  );
  const compared = message.comparedProducts ?? [];
  const tableOpen = !compact && compared.length >= 2;
  // One list of phones without duplicates. When the comparison table is already open,
  // the phones it shows are not repeated in the list.
  const listed = [...(message.recommendedProducts ?? []), ...(tableOpen ? [] : compared)].filter(
    (product, index, all) =>
      all.findIndex((p) => p.id === product.id) === index &&
      !(tableOpen && compared.some((p) => p.id === product.id)),
  );
  useEffect(() => {
    onProgress?.();
  }, [text, revealing, onProgress]);
  return (
    <article
      className={`message ${message.role}${compact ? ' compact' : ''}`}
      data-message-id={message.id}
      data-revealing={revealing || undefined}
      aria-label={
        message.role === 'user' ? 'Bạn' : message.role === 'assistant' ? 'Trợ lý AI' : 'Thông báo'
      }
    >
      {message.role === 'assistant' && !compact && (
        <span className="icon-tile !w-9 !h-9">
          <Icon name="auto_awesome" />
        </span>
      )}
      <div className="message-bubble">
        {message.role === 'assistant' && !compact && (
          <p className="text-xs font-semibold text-secondary mb-2">Trợ lý SmartPhone AI</p>
        )}
        {/* React escapes plain text, including model-supplied markup and URLs. */}
        {message.role === 'assistant' ? (
          <div
            className="answer-text"
            aria-live="off"
            data-testid={animate ? 'chat-reveal' : undefined}
          >
            <FormattedAnswer content={text} />
          </div>
        ) : (
          <p aria-live="off" data-testid={animate ? 'chat-reveal' : undefined}>
            {text}
          </p>
        )}
        {revealing && (
          <button
            type="button"
            className="text-link chat-reveal-control"
            onClick={skip}
            aria-label="Hiển thị toàn bộ câu trả lời"
          >
            Hiển thị ngay
          </button>
        )}
        {!revealing && !!listed.length && <ChatProductList products={listed} />}
        {!revealing && compared.length >= 2 && (
          <ChatComparison products={compared} open={tableOpen} />
        )}
      </div>
    </article>
  );
}
