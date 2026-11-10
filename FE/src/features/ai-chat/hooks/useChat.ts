import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import { useAuth } from '../../auth/AuthProvider';
import type { Conversation, TopicSwitchRequired, User } from '../../../shared/types/models';
import {
  canResendChat,
  findPersistedTurn,
  isCurrentChatRequest,
  mergeChatTurn,
  resolveCanceledChatTurn,
  type ChatRequestOwner,
  type ChatTurn,
} from '../utils/chatPresentation';

export function useChat(
  id: string,
  options?: {
    /** Stay on the current screen after a topic switch instead of opening the full chat page. */
    onSwitched?: (conversationId: string) => void;
    /** Skip the "message sent" toast, e.g. in the floating assistant. */
    quiet?: boolean;
  },
) {
  const { user } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();
  const scope = `${user?.id ?? 'guest'}:${id}`;
  const owner = useRef<ChatRequestOwner & { scope: string }>({
    accountId: user?.id ?? 'guest',
    active: true,
    scope,
  });
  if (owner.current.scope !== scope)
    owner.current = { accountId: user?.id ?? 'guest', active: true, scope };
  useEffect(() => {
    const current = owner.current;
    current.active = true;
    return () => {
      current.active = false;
    };
  }, [scope]);
  function isCurrent(request: ChatRequestOwner) {
    return isCurrentChatRequest(
      request,
      owner.current,
      client.getQueryData<User | null>(['me'])?.id,
    );
  }
  const [pendingSwitch, setPendingSwitch] = useState<{
    scope: string;
    value: TopicSwitchRequired;
  } | null>(null);
  const revealKey = ['chat-reveal', user?.id ?? 'guest', id];
  const [localTurn, setLocalTurn] = useState<{ scope: string; value: ChatTurn } | null>(() => {
    const fresh = client.getQueryData<ChatTurn>(revealKey);
    return fresh ? { scope, value: fresh } : null;
  });
  useEffect(() => {
    // Consume the in-memory handoff so revisiting or reloading renders history immediately.
    client.removeQueries({ queryKey: revealKey, exact: true });
  }, [client, scope]);
  const [checking, setChecking] = useState(false);
  const [retryNotice, setRetryNotice] = useState('');
  const sending = useRef(false);
  const turn = localTurn?.scope === scope ? localTurn.value : null;
  const key = ['conversation', user?.id ?? 'guest', id];
  const conversation = useQuery({
    queryKey: key,
    queryFn: () => api.conversation(id),
    enabled: user?.role === 'CUSTOMER',
    retry: false,
  });
  const pending =
    (pendingSwitch?.scope === scope ? pendingSwitch.value : null) ??
    conversation.data?.pendingSwitch;
  const send = useMutation({
    mutationKey: ['chat', user?.id, id, 'send'],
    meta: { toast: { success: options?.quiet ? false : 'Đã gửi tin nhắn.' } },
    retry: false,
    mutationFn: ({ turn: attempt }: { turn: ChatTurn; owner: ChatRequestOwner }) =>
      api.sendMessage(id, attempt.user.content),
    onSuccess: async (result, attempt) => {
      if (!isCurrent(attempt.owner)) return;
      const received: ChatTurn = {
        ...attempt.turn,
        status: 'received',
        assistant:
          result.type === 'SWITCH_REQUIRED'
            ? undefined
            : {
                id: `${attempt.turn.user.id}-answer`,
                role: 'assistant',
                content: result.type === 'ANSWER' ? result.answer : result.message,
                ...(result.type === 'ANSWER'
                  ? {
                      sources: result.sources,
                      recommendedProducts: result.recommendedProducts,
                      comparedProducts: result.comparedProducts,
                    }
                  : {}),
              },
      };
      setLocalTurn({ scope, value: received });
      if (result.type === 'SWITCH_REQUIRED') setPendingSwitch({ scope, value: result });
      // Keep the received JSON answer available even if the history refresh fails.
      client.setQueryData<Conversation>(key, (data) =>
        data ? { ...data, messages: mergeChatTurn(data.messages, received) } : data,
      );
      await client.invalidateQueries({ queryKey: key });
      if (isCurrent(attempt.owner)) void client.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error, attempt) => {
      if (isCurrent(attempt.owner))
        setLocalTurn({ scope, value: { ...attempt.turn, status: 'failed', error } });
    },
    onSettled: (_result, _error, attempt) => {
      if (isCurrent(attempt.owner)) sending.current = false;
    },
  });
  function sendMessage(content: string) {
    if (!content.trim() || sending.current || checking || pending || turn?.status === 'failed')
      return false;
    const attempt: ChatTurn = {
      user: { id: `local-${crypto.randomUUID()}`, role: 'user', content: content.trim() },
      baselineIds: conversation.data?.messages.map((message) => message.id) ?? [],
      status: 'sending',
    };
    setRetryNotice('');
    sending.current = true;
    setLocalTurn({ scope, value: attempt });
    send.mutate({ turn: attempt, owner: owner.current });
    return true;
  }
  async function retrySend() {
    if (!turn || turn.status !== 'failed' || checking || send.isPending) return;
    const request = owner.current;
    setChecking(true);
    setRetryNotice('');
    try {
      const refreshed = await conversation.refetch();
      if (!isCurrent(request)) return;
      if (refreshed.error || !refreshed.data) {
        setRetryNotice('Chưa kiểm tra được lịch sử. Hãy kiểm tra kết nối và thử lại.');
        return;
      }
      const saved = findPersistedTurn(refreshed.data.messages, turn);
      if (saved?.assistant) {
        setLocalTurn({
          scope,
          value: {
            ...turn,
            status: 'received',
            error: undefined,
            assistant: { ...saved.assistant, id: `${turn.user.id}-answer` },
          },
        });
      } else if (canResendChat(turn.error, refreshed.data.messages, turn)) {
        const attempt: ChatTurn = { ...turn, status: 'sending', error: undefined };
        sending.current = true;
        setLocalTurn({ scope, value: attempt });
        send.mutate({ turn: attempt, owner: request });
      } else {
        setRetryNotice(
          saved
            ? 'Câu hỏi đã được lưu. Hãy kiểm tra lại phản hồi sau ít phút.'
            : 'Chưa xác định được máy chủ đã xử lý câu hỏi hay chưa. Hãy kiểm tra lại phản hồi sau ít phút hoặc tạo cuộc hội thoại mới.',
        );
      }
    } finally {
      if (isCurrent(request)) setChecking(false);
    }
  }
  const confirm = useMutation({
    mutationKey: ['chat', user?.id, id, 'confirm-switch'],
    meta: { toast: { success: 'Đã chuyển chủ đề tư vấn.' } },
    mutationFn: async () => {
      const request = owner.current;
      const result = await api.confirmSwitch(pending!.switchRequestId);
      if (result.type !== 'ANSWER' || !result.newConversationId)
        throw new Error('Máy chủ chưa trả về cuộc hội thoại mới. Vui lòng tải lại lịch sử.');
      return { result, request };
    },
    onSuccess: async ({ result, request }) => {
      if (!isCurrent(request)) return;
      await client.invalidateQueries({ queryKey: ['conversations'] });
      if (!isCurrent(request)) return;
      const nextId = result.newConversationId!;
      const question =
        result.originalQuestion ??
        turn?.user.content ??
        conversation.data?.messages
          .slice()
          .reverse()
          .find((message) => message.role === 'user')?.content ??
        '';
      const localId = `local-${crypto.randomUUID()}`;
      const received: ChatTurn = {
        user: { id: localId, role: 'user', content: question },
        assistant: {
          id: `${localId}-answer`,
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          recommendedProducts: result.recommendedProducts,
          comparedProducts: result.comparedProducts,
        },
        baselineIds: [],
        status: 'received',
      };
      client.setQueryData<Conversation>(
        ['conversation', request.accountId, nextId],
        (data) =>
          data ?? {
            id: nextId,
            topic: result.topic ?? pending!.suggestedTopic,
            title: question.slice(0, 55),
            messages: [received.user, received.assistant!],
          },
      );
      client.setQueryData(['chat-reveal', request.accountId, nextId], received);
      setPendingSwitch(null);
      void client.invalidateQueries({ queryKey: key });
      if (options?.onSwitched) options.onSwitched(nextId);
      else navigate(`/ai/conversations/${nextId}`, { replace: true });
    },
  });
  const cancel = useMutation({
    mutationKey: ['chat', user?.id, id, 'cancel-switch'],
    meta: { toast: { success: 'Đã giữ chủ đề hiện tại.' } },
    mutationFn: async () => {
      const request = owner.current;
      const switchRequestId = pending!.switchRequestId;
      await api.cancelSwitch(switchRequestId);
      return { request, switchRequestId };
    },
    onSuccess: async ({ request, switchRequestId }) => {
      if (!isCurrent(request)) return;
      const recovered = client.getQueryData<Conversation>(key);
      setLocalTurn((current) =>
        current?.scope === scope
          ? {
              ...current,
              value: resolveCanceledChatTurn(current.value, recovered, switchRequestId),
            }
          : current,
      );
      setRetryNotice('');
      setPendingSwitch(null);
      client.setQueryData<Conversation>(key, (data) =>
        data ? { ...data, pendingSwitch: undefined } : data,
      );
      await client.invalidateQueries({ queryKey: key });
    },
  });
  return {
    conversation,
    messages: mergeChatTurn(conversation.data?.messages ?? [], turn),
    animatedMessageId: turn?.assistant?.id,
    waiting: turn?.status === 'sending',
    failure: turn?.status === 'failed' ? turn.error : null,
    retryNotice,
    retrySend,
    checking,
    sendMessage,
    pending,
    send,
    confirm,
    cancel,
    busy: send.isPending || confirm.isPending || cancel.isPending || checking,
  };
}
