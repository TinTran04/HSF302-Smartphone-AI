import { Link, NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../shared/api';
import { useAuth } from '../features/auth/AuthProvider';
import { Icon } from '../shared/components/Icon';
import { topicInfo } from '../features/ai-chat/constants/chatTopics';
import { ErrorState } from '../shared/components/Ui';
export function ChatLayout() {
  const { user } = useAuth();
  const chats = useQuery({
    queryKey: ['conversations', user?.id ?? 'guest'],
    queryFn: api.conversations,
  });
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
              <NavLink key={c.id} to={`/ai/conversations/${c.id}`}>
                <span className="badge badge-ai">{topicInfo(c.topic).title}</span>
                <p>{c.title}</p>
              </NavLink>
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
            <p className="help-text px-3">
              {user
                ? 'Lịch sử gắn với tài khoản của bạn.'
                : 'Lịch sử khách chỉ lưu theo phiên hiện tại.'}
            </p>
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
    </div>
  );
}
