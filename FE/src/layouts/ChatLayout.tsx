import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom';
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../shared/api';
import { useAuth } from '../features/auth/AuthProvider';
import { Icon } from '../shared/components/Icon';
import { chatTopics, topicInfo } from '../features/ai-chat/constants/chatTopics';
import { ConfirmDialog, ErrorState, Modal } from '../shared/components/Ui';
import type { Conversation } from '../shared/types/models';
import './ChatLayout.css';
export function ChatLayout() {
  const { user } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();
  const currentConversation = useMatch('/ai/conversations/:id');
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 801px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setHistoryOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  const chatIsBusy = useIsMutating({ mutationKey: ['chat', user?.id] }) > 0;
  const historyKey = ['conversations', user?.id ?? 'guest'];
  const chats = useQuery({
    queryKey: historyKey,
    queryFn: api.conversations,
    enabled: user?.role === 'CUSTOMER',
  });
  const remove = useMutation({
    meta: { toast: { success: 'Đã xóa cuộc trò chuyện.' } },
    mutationFn: (id: string) => api.deleteConversation(id),
    onSuccess: async (_, id) => {
      const conversationKey = ['conversation', user?.id ?? 'guest', id];
      await client.cancelQueries({ queryKey: conversationKey, exact: true });
      if (currentConversation?.params.id === id) navigate('/ai', { replace: true });
      client.removeQueries({ queryKey: conversationKey, exact: true });
      client.setQueryData<Conversation[]>(historyKey, (history) =>
        history?.filter((conversation) => conversation.id !== id),
      );
      setPendingDelete(null);
      void client.invalidateQueries({ queryKey: historyKey, exact: true });
    },
  });
  const deleteIsDisabled = chatIsBusy || remove.isPending;
  const history = (
    <>
      <Link to="/ai" className="button button-secondary" onClick={() => setHistoryOpen(false)}>
        <Icon name="add_circle" />
        Cuộc trò chuyện mới
      </Link>
      <div className="chat-topic-nav" aria-label="Chủ đề trợ lý">
        <p className="eyebrow !mt-7 !mb-0">Chủ đề trợ lý</p>
        <nav aria-label="Chọn chủ đề chat">
          {chatTopics.map((topic) => (
            <Link
              key={topic.id}
              to={`/ai?topic=${topic.id}`}
              className="chat-topic-link"
              onClick={() => setHistoryOpen(false)}
            >
              <span className="icon-tile">
                <Icon name={topic.icon} />
              </span>
              <span>
                <strong>{topic.title}</strong>
                <small>{topic.description}</small>
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <p className="eyebrow !mt-7 !mb-0">Hội thoại gần đây</p>
      <div className="chat-history">
        {chats.data?.map((c) => (
          <div key={c.id} className="chat-history-row">
            <NavLink to={`/ai/conversations/${c.id}`} onClick={() => setHistoryOpen(false)}>
              <span className="badge badge-ai">{topicInfo(c.topic).title}</span>
              <p>{c.title}</p>
            </NavLink>
            <button
              type="button"
              className="icon-button chat-history-delete"
              aria-label={`Xóa cuộc trò chuyện ${c.title}`}
              title="Xóa cuộc trò chuyện"
              disabled={deleteIsDisabled || user?.role !== 'CUSTOMER'}
              onClick={() => {
                setHistoryOpen(false);
                remove.reset();
                setPendingDelete(c);
              }}
            >
              <Icon name="delete" />
            </button>
          </div>
        ))}
        {!chats.isPending && !chats.data?.length && (
          <p className="help-text px-3">Chưa có cuộc trò chuyện nào.</p>
        )}
        {chats.error && (
          <ErrorState
            error={chats.error}
            retry={() => {
              void chats.refetch();
            }}
          />
        )}
      </div>
      <div className="mt-auto pt-8">
        <p className="help-text px-3">Lịch sử gắn với tài khoản của bạn.</p>
        <Link to="/products" className="text-link text-xs mt-4 flex items-center gap-2 px-3">
          <Icon name="arrow_back" />
          Quay lại cửa hàng
        </Link>
      </div>
    </>
  );
  return (
    <div className="container chat-page">
      <div className="chat-shell">
        <aside className="chat-sidebar" aria-label="Lịch sử hội thoại">
          {history}
        </aside>
        <section className="chat-content">
          <div className="chat-mobile-bar">
            <button
              type="button"
              className="button button-secondary"
              aria-label="Mở lịch sử hội thoại"
              aria-haspopup="dialog"
              aria-expanded={historyOpen}
              onClick={() => setHistoryOpen(true)}
            >
              <Icon name="history" />
              Hội thoại
            </button>
            <Link className="text-link" to="/ai">
              <Icon name="add" />
              Trò chuyện mới
            </Link>
          </div>
          <Outlet />
        </section>
      </div>
      {historyOpen && (
        <Modal title="Lịch sử hội thoại" onClose={() => setHistoryOpen(false)}>
          <div className="chat-mobile-history">{history}</div>
        </Modal>
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="Xóa cuộc trò chuyện"
          message={`Bạn muốn xóa cuộc trò chuyện “${pendingDelete.title}”? Lịch sử tin nhắn sẽ bị xóa.`}
          label="Xóa cuộc trò chuyện"
          busy={remove.isPending}
          error={remove.error}
          onClose={() => {
            if (remove.isPending) return;
            setPendingDelete(null);
            remove.reset();
          }}
          onConfirm={() => {
            if (!deleteIsDisabled && user?.role === 'CUSTOMER') remove.mutate(pendingDelete.id);
          }}
        />
      )}
    </div>
  );
}
