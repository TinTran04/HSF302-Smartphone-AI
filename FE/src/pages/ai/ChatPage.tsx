import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useChat } from '../../features/ai-chat/hooks/useChat';
import { ChatMessage } from '../../features/ai-chat/components/ChatMessage';
import { TopicSwitchDialog } from '../../features/ai-chat/components/TopicSwitchDialog';
import { topicInfo } from '../../features/ai-chat/constants/chatTopics';
import { Button, EmptyState, ErrorState, Skeleton } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { isDemo } from '../../shared/api';
import { useAuth } from '../../features/auth/AuthProvider';
import { PendingAssistant } from '../../features/ai-chat/components/PendingAssistant';
export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  return <ChatWorkspace key={`${user?.id}:${id}`} id={id!} />;
}
function ChatWorkspace({ id }: { id: string }) {
  const chat = useChat(id);
  const [draft, setDraft] = useState('');
  const stream = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const data = chat.conversation.data;
  const followAnswer = useCallback(() => {
    if (following.current && stream.current) stream.current.scrollTop = stream.current.scrollHeight;
  }, []);
  useEffect(() => {
    followAnswer();
  }, [chat.messages.length, chat.waiting, followAnswer]);
  function send() {
    const text = draft.trim();
    if (!text || chat.busy || chat.pending || chat.failure) return;
    following.current = true;
    if (chat.sendMessage(text)) {
      setDraft('');
    }
  }
  if (chat.conversation.isPending)
    return (
      <div className="p-8">
        <Skeleton count={1} />
      </div>
    );
  if (chat.conversation.error && !data)
    return (
      <div className="p-8">
        <ErrorState
          error={chat.conversation.error}
          retry={() => {
            void chat.conversation.refetch();
          }}
        />
        <Link className="text-link" to="/ai">
          Tạo cuộc hội thoại mới
        </Link>
      </div>
    );
  if (!data) return null;
  return (
    <>
      <header className="chat-toolbar">
        <span className="badge badge-ai">
          <Icon name={topicInfo(data.topic).icon} className="!text-base" />
          {topicInfo(data.topic).title}
        </span>
        <Link className="button button-secondary !min-h-8 !py-2 !text-xs" to="/ai">
          Đổi chủ đề
          <Icon name="swap_horiz" className="!text-base" />
        </Link>
      </header>
      <div
        className="chat-stream"
        ref={stream}
        role="log"
        aria-label="Tin nhắn cuộc hội thoại"
        aria-live="polite"
        aria-relevant="additions"
        onScroll={() => {
          const element = stream.current;
          if (element)
            following.current =
              element.scrollHeight - element.scrollTop - element.clientHeight < 96;
        }}
      >
        {!chat.messages.length && (
          <EmptyState
            icon={topicInfo(data.topic).icon}
            title={topicInfo(data.topic).title}
            description="Bạn muốn tìm hiểu điều gì? Hãy bắt đầu bằng một câu hỏi bên dưới."
          />
        )}
        {chat.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            animate={message.id === chat.animatedMessageId}
            onProgress={followAnswer}
          />
        ))}
        {chat.waiting && <PendingAssistant />}
        {!!chat.failure && (
          <div className="chat-send-failure" data-testid="chat-send-failure">
            <ErrorState error={chat.failure} />
            <Button
              variant="secondary"
              data-testid="chat-send-retry"
              busy={chat.checking}
              onClick={() => {
                void chat.retrySend();
              }}
            >
              Kiểm tra và thử lại
            </Button>
            {chat.retryNotice && (
              <p className="text-sm text-secondary" role="status">
                {chat.retryNotice}
              </p>
            )}
            <Link className="text-link" to="/ai">
              Tạo cuộc hội thoại mới
            </Link>
          </div>
        )}
      </div>
      <div className="chat-composer">
        <div className="prompt-chips">
          <button
            disabled={chat.busy || !!chat.pending || !!chat.failure}
            onClick={() => setDraft(topicInfo(data.topic).prompt)}
          >
            {topicInfo(data.topic).prompt}
          </button>
          {isDemo && data.topic !== 'SHOP_SUPPORT' && (
            <button
              disabled={chat.busy || !!chat.pending || !!chat.failure}
              onClick={() => setDraft('Shop có cho đổi trả trong 7 ngày không?')}
            >
              Thử xác nhận chuyển chủ đề
            </button>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            Nhập câu hỏi cho trợ lý AI
          </label>
          <textarea
            id="chat-input"
            rows={2}
            value={draft}
            maxLength={5000}
            disabled={chat.busy || !!chat.pending || !!chat.failure}
            placeholder="Nhập câu hỏi của bạn…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.nativeEvent.keyCode !== 229
              ) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="submit"
            variant="ai"
            busy={chat.send.isPending}
            disabled={!draft.trim() || chat.busy || !!chat.pending || !!chat.failure}
            aria-label="Gửi tin nhắn"
          >
            <Icon name="send" />
          </Button>
        </form>
        <p className="help-text">Enter để gửi · Shift+Enter để xuống dòng. AI có thể mắc lỗi.</p>
      </div>
      {chat.pending && (
        <TopicSwitchDialog
          request={chat.pending}
          onConfirm={() => chat.confirm.mutate()}
          onCancel={() => chat.cancel.mutate()}
          busy={chat.confirm.isPending || chat.cancel.isPending}
          waiting={chat.confirm.isPending}
          error={chat.confirm.error || chat.cancel.error}
        />
      )}
    </>
  );
}
