import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { chatTopics } from '../../features/ai-chat/constants/chatTopics';
import { Icon } from '../../shared/components/Icon';
import { ErrorState } from '../../shared/components/Ui';
import type { ChatTopic } from '../../shared/types/models';
export default function TopicSelectionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const productIds = [
    ...new Set((params.get('productIds') || '').split(',').filter(Boolean)),
  ].slice(0, 3);
  const create = useMutation({
    mutationFn: (topic: ChatTopic) =>
      api.createConversation(topic, productIds.length ? { productIds } : undefined),
    onSuccess: (chat) => {
      void client.invalidateQueries({ queryKey: ['conversations'] });
      navigate(`/ai/conversations/${chat.id}`);
    },
  });
  return (
    <div className="topic-welcome">
      <div className="text-center">
        <span className="icon-tile !w-16 !h-16 !rounded-2xl">
          <Icon name="auto_awesome" className="!text-3xl" />
        </span>
        <p className="eyebrow mt-6">SmartPhone AI Assistant</p>
        <h1>Xin chào! Mình có thể giúp gì cho bạn hôm nay?</h1>
        <p className="muted text-sm">Chọn một chủ đề để bắt đầu cuộc trò chuyện mới.</p>
      </div>
      {create.error && <ErrorState error={create.error} />}
      {!!productIds.length && (
        <p className="notice mt-6">
          Đã chọn {productIds.length} sản phẩm làm ngữ cảnh cho cuộc trò chuyện.
        </p>
      )}
      <div className="topic-grid">
        {chatTopics.map((t) => (
          <button
            className={`card topic-card ${params.get('topic') === t.id ? '!border-secondary !bg-[#fcfaff]' : ''}`}
            key={t.id}
            disabled={create.isPending}
            onClick={() => create.mutate(t.id)}
          >
            <span className="icon-tile">
              <Icon
                name={create.isPending && create.variables === t.id ? 'progress_activity' : t.icon}
                className={create.isPending && create.variables === t.id ? 'spin' : ''}
              />
            </span>
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <span className="text-link">
              Bắt đầu trò chuyện
              <Icon name="arrow_forward" className="!text-base" />
            </span>
          </button>
        ))}
      </div>
      <p className="help-text text-center mt-8">
        AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin trước khi quyết định.
      </p>
    </div>
  );
}
