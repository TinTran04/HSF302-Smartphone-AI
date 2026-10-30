import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useChat } from '../../features/ai-chat/hooks/useChat';
import { ChatMessage } from '../../features/ai-chat/components/ChatMessage';
import { TopicSwitchDialog } from '../../features/ai-chat/components/TopicSwitchDialog';
import { topicInfo } from '../../features/ai-chat/constants/chatTopics';
import { Button, EmptyState, ErrorState, Skeleton, useToast } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { isDemo } from '../../shared/api';
export default function ChatPage() {
  const { id } = useParams();
  return <ChatWorkspace key={id} id={id!} />;
}
function ChatWorkspace({ id }: { id: string }) {
  const chat = useChat(id);
  const [draft, setDraft] = useState('');
  const stream = useRef<HTMLDivElement>(null);
  const { notify } = useToast();
  const data = chat.conversation.data;
  useEffect(() => {
    stream.current?.scrollTo({ top: stream.current.scrollHeight, behavior: 'smooth' });
  }, [data?.messages.length, chat.busy]);
  async function send() {
    const text = draft.trim();
    if (!text || chat.busy || chat.pending) return;
    try {
      await chat.send.mutateAsync(text);
      setDraft('');
    } catch {
      /* Keep the original draft visible for a controlled retry. */
    }
  }
  if (chat.conversation.isPending)
    return (
      <div className="p-8">
        <Skeleton count={1} />
      </div>
    );
  if (chat.conversation.error)
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
      <div className="chat-stream" ref={stream} aria-live="polite" aria-relevant="additions text">
        {!data.messages.length && (
          <EmptyState
            icon={topicInfo(data.topic).icon}
            title={topicInfo(data.topic).title}
            description="Bạn muốn tìm hiểu điều gì? Hãy bắt đầu bằng một câu hỏi bên dưới."
          />
        )}
        {data.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {chat.send.isPending && (
          <p className="text-sm text-secondary flex items-center gap-3" role="status">
            <Icon name="progress_activity" className="spin" />
            Trợ lý đang xử lý câu hỏi…
          </p>
        )}
        {chat.send.error && <ErrorState error={chat.send.error} />}
      </div>
      <div className="chat-composer">
        <div className="prompt-chips">
          <button
            disabled={chat.busy || !!chat.pending}
            onClick={() => setDraft(topicInfo(data.topic).prompt)}
          >
            {topicInfo(data.topic).prompt}
          </button>
          {isDemo && data.topic !== 'SHOP_SUPPORT' && (
            <button
              disabled={chat.busy || !!chat.pending}
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
            disabled={chat.busy || !!chat.pending}
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
            disabled={!draft.trim() || chat.busy || !!chat.pending}
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
          onCancel={() =>
            chat.cancel.mutate(undefined, { onSuccess: () => notify('Đã giữ chủ đề hiện tại.') })
          }
          busy={chat.confirm.isPending || chat.cancel.isPending}
          error={chat.confirm.error || chat.cancel.error}
        />
      )}
    </>
  );
}
