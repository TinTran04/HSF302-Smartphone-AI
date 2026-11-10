import { Icon } from '../../../shared/components/Icon';
import './ChatPresentation.css';

export function PendingAssistant() {
  return (
    <div
      className="message assistant"
      data-testid="chat-pending"
      role="status"
      aria-label="Trợ lý đang xử lý câu hỏi"
    >
      <span className="icon-tile !w-9 !h-9" aria-hidden="true">
        <Icon name="auto_awesome" />
      </span>
      <div className="message-bubble chat-pending-bubble">
        <span className="chat-wave" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sr-only">Trợ lý đang xử lý câu hỏi…</span>
      </div>
    </div>
  );
}
