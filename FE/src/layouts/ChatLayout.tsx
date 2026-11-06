import { useState } from 'react';
import { Link, NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom';
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../shared/api';
import { useAuth } from '../features/auth/AuthProvider';
import { Icon } from '../shared/components/Icon';
import { topicInfo } from '../features/ai-chat/constants/chatTopics';
import { ConfirmDialog, ErrorState } from '../shared/components/Ui';
import type { Conversation } from '../shared/types/models';
import './ChatLayout.css';
export function ChatLayout() {
  const { user } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();
  const currentConversation = useMatch('/ai/conversations/:id');
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
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
      await client.invalidateQueries({ queryKey: historyKey, exact: true });
    },
  });
  const deleteIsDisabled = chatIsBusy || remove.isPending;
  return (
    <div className="container">
      <div className="chat-shell">
        <aside className="chat-sidebar">
          <Link to="/ai" className="button button-secondary">
            <Icon name="add_circle" />
            Cuộc trò chuyện mới
          </Link>
          <p className="eyebrow !mt-7 !mb-0">Hội thoại gần đây</p>
          <div className="chat-history">
            {chats.data?.map((c) => (
              <div key={c.id} className="chat-history-row">
                <NavLink to={`/ai/conversations/${c.id}`}>
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
        </aside>
        <section className="chat-content">
          <Outlet />
        </section>
      </div>
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
