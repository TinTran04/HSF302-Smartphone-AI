import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import { useAuth } from '../../auth/AuthProvider';
import type { TopicSwitchRequired } from '../../../shared/types/models';
export function useChat(id: string) {
  const { user } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [pendingSwitch, setPendingSwitch] = useState<TopicSwitchRequired | null>(null);
  const key = ['conversation', user?.id ?? 'guest', id];
  const conversation = useQuery({
    queryKey: key,
    queryFn: () => api.conversation(id),
    retry: false,
  });
  const pending = pendingSwitch ?? conversation.data?.pendingSwitch;
  const send = useMutation({
    mutationFn: (content: string) => api.sendMessage(id, content),
    onSuccess: async (result) => {
      if (result.type === 'SWITCH_REQUIRED') setPendingSwitch(result);
      await client.invalidateQueries({ queryKey: key });
      void client.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
  const confirm = useMutation({
    mutationFn: () => api.confirmSwitch(pending!.switchRequestId),
    onSuccess: async (result) => {
      if (result.type !== 'ANSWER' || !result.newConversationId)
        throw new Error('Máy chủ chưa trả về cuộc hội thoại mới. Vui lòng tải lại lịch sử.');
      setPendingSwitch(null);
      await client.invalidateQueries({ queryKey: ['conversations'] });
      void client.invalidateQueries({ queryKey: key });
      navigate(`/ai/conversations/${result.newConversationId}`, { replace: true });
    },
  });
  const cancel = useMutation({
    mutationFn: () => api.cancelSwitch(pending!.switchRequestId),
    onSuccess: async () => {
      setPendingSwitch(null);
      await client.invalidateQueries({ queryKey: key });
    },
  });
  return {
    conversation,
    pending,
    send,
    confirm,
    cancel,
    busy: send.isPending || confirm.isPending || cancel.isPending,
  };
}
