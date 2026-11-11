import type { ChatMessage, Conversation } from '../../../shared/types/models';

export interface ChatTurn {
  user: ChatMessage;
  assistant?: ChatMessage;
  baselineIds: string[];
  status: 'sending' | 'received' | 'failed';
  error?: unknown;
}

export function resolveCanceledChatTurn(
  turn: ChatTurn,
  conversation: Conversation | undefined,
  switchRequestId: string,
): ChatTurn {
  if (turn.status !== 'failed' || conversation?.pendingSwitch?.switchRequestId !== switchRequestId)
    return turn;
  const saved = findPersistedTurn(conversation.messages, turn);
  if (!saved || saved.user.id !== conversation.messages.at(-1)?.id) return turn;
  return { ...turn, status: 'received', error: undefined };
}

export function findPersistedTurn(messages: ChatMessage[], turn: ChatTurn) {
  const baseline = new Set(turn.baselineIds);
  // Full conversation history is append-only. Its existing prefix remains old
  // history even when a cached JSON answer's temporary IDs become server IDs.
  const index = messages.findIndex(
    (message, position) =>
      position >= turn.baselineIds.length &&
      !baseline.has(message.id) &&
      message.role === 'user' &&
      message.content === turn.user.content,
  );
  if (index < 0) return undefined;
  const following = messages.slice(index + 1);
  const nextUser = following.findIndex((message) => message.role === 'user');
  const reply = nextUser < 0 ? following : following.slice(0, nextUser);
  return {
    user: messages[index],
    assistant: reply.find((message) => message.role === 'assistant'),
  };
}

export function mergeChatTurn(messages: ChatMessage[], turn: ChatTurn | null): ChatMessage[] {
  if (!turn) return messages;
  const saved = findPersistedTurn(messages, turn);
  const merged = messages.map((message) => {
    if (message.id === saved?.user.id) return { ...message, id: turn.user.id };
    if (turn.assistant && message.id === saved?.assistant?.id)
      return { ...message, id: turn.assistant.id };
    return message;
  });
  if (!saved) merged.push(turn.user);
  if (turn.assistant && !saved?.assistant) merged.push(turn.assistant);
  return merged;
}

export function canResendChat(error: unknown, messages: ChatMessage[], turn: ChatTurn) {
  const status = error && typeof error === 'object' && 'status' in error ? error.status : 0;
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  const stableRequestId = /^local-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(turn.user.id);
  if (stableRequestId && (status === 0 || status === 408 || status === 504 || code === 'CHAT_BUSY')) {
    return !findPersistedTurn(messages, turn);
  }
  const rejected = [
    'AI_PROVIDER_ERROR',
    'AI_PROVIDER_AUTH_ERROR',
    'AI_PROVIDER_MODEL_ERROR',
    'AI_PROVIDER_RATE_LIMIT',
    'AI_PROVIDER_BUSY',
    'INVALID_AI_CONFIGURATION',
    'VALIDATION_ERROR',
  ].includes(typeof code === 'string' ? code : '');
  // A transport failure or timeout can leave a still-running server request.
  // Only a completed server rejection with no persisted question allows a resend.
  return (
    typeof status === 'number' &&
    rejected &&
    status >= 400 &&
    status !== 408 &&
    status !== 504 &&
    !findPersistedTurn(messages, turn)
  );
}

export function splitChatText(text: string): string[] {
  return Array.from(
    new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
    (part) => part.segment,
  );
}

export function revealText(units: string[], elapsed: number, reducedMotion: boolean) {
  if (reducedMotion) return units.join('');
  const duration = Math.min(8000, Math.max(600, units.length * 18));
  const count = Math.min(
    units.length,
    Math.floor((units.length * Math.max(0, elapsed)) / duration),
  );
  return units.slice(0, count).join('');
}

export interface ChatRequestOwner {
  accountId: string;
  active: boolean;
}

export function isCurrentChatRequest(
  request: ChatRequestOwner,
  current: ChatRequestOwner,
  accountId: string | undefined,
) {
  return request === current && request.active && request.accountId === accountId;
}
