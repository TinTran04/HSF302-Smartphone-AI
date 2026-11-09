import { describe, expect, it } from 'vitest';
import type { ChatMessage, Conversation } from '../../../shared/types/models';
import {
  mergeChatTurn,
  findPersistedTurn,
  canResendChat,
  revealText,
  splitChatText,
  isCurrentChatRequest,
  resolveCanceledChatTurn,
  type ChatTurn,
} from './chatPresentation';

const history: ChatMessage[] = [
  { id: 'old-user', role: 'user', content: 'Hello' },
  { id: 'old-answer', role: 'assistant', content: 'Welcome' },
];
const turn: ChatTurn = {
  user: { id: 'local-user', role: 'user', content: 'Hello' },
  baselineIds: history.map((message) => message.id),
  status: 'sending',
};

describe('chat turn presentation', () => {
  it('shows the outgoing bubble before a response, including when its text repeats history', () => {
    expect(mergeChatTurn(history, turn).map((message) => message.id)).toEqual([
      'old-user',
      'old-answer',
      'local-user',
    ]);
  });
  it('reconciles the optimistic user and newly received answer with refetched history', () => {
    const received: ChatTurn = {
      ...turn,
      status: 'received',
      assistant: { id: 'local-answer', role: 'assistant', content: 'New answer' },
    };
    const saved: ChatMessage[] = [
      ...history,
      { id: 'saved-user', role: 'user', content: 'Hello' },
      {
        id: 'saved-answer',
        role: 'assistant',
        content: 'New answer',
        sources: [{ documentId: 'policy', documentName: 'Policy' }],
      },
    ];
    const messages = mergeChatTurn(saved, received);
    expect(messages.map((message) => message.id)).toEqual([
      'old-user',
      'old-answer',
      'local-user',
      'local-answer',
    ]);
    expect(messages[3].sources?.[0].documentId).toBe('policy');
  });
  it('keeps a failed outgoing bubble and discovers partial persistence without duplicating it', () => {
    const failed: ChatTurn = { ...turn, status: 'failed', error: { status: 503 } };
    const saved: ChatMessage[] = [...history, { id: 'saved-user', role: 'user', content: 'Hello' }];
    expect(mergeChatTurn(saved, failed)).toHaveLength(3);
    expect(findPersistedTurn(saved, failed)?.user.id).toBe('saved-user');
    expect(canResendChat(failed.error, saved, failed)).toBe(false);
  });
  it('resolves a lost topic-switch response after cancellation while preserving one user bubble', () => {
    const failed: ChatTurn = { ...turn, status: 'failed', error: { status: 0 } };
    const recovered: Conversation = {
      id: 'current',
      title: 'Chat',
      topic: 'PHONE_CONSULTATION',
      messages: [...history, { id: 'saved-question', role: 'user', content: 'Hello' }],
      pendingSwitch: {
        type: 'SWITCH_REQUIRED',
        switchRequestId: 'recovered-switch',
        currentTopic: 'PHONE_CONSULTATION',
        suggestedTopic: 'SHOP_SUPPORT',
        message: 'Confirm?',
      },
    };
    const resolved = resolveCanceledChatTurn(failed, recovered, 'recovered-switch');
    expect(resolved.status).toBe('received');
    expect(resolved.error).toBeUndefined();
    expect(mergeChatTurn(recovered.messages, resolved).map((message) => message.id)).toEqual([
      'old-user',
      'old-answer',
      'local-user',
    ]);
    expect(resolveCanceledChatTurn(failed, recovered, 'another-switch')).toBe(failed);
    const unrelated = {
      ...recovered,
      messages: [
        ...recovered.messages,
        { id: 'another-question', role: 'user' as const, content: 'Different question' },
      ],
    };
    expect(resolveCanceledChatTurn(failed, unrelated, 'recovered-switch')).toBe(failed);
  });
  it('permits a controlled retry after a server rejection only when fresh history has no saved question', () => {
    expect(canResendChat({ status: 503, code: 'AI_PROVIDER_BUSY' }, history, turn)).toBe(true);
    expect(canResendChat({ status: 503 }, history, turn)).toBe(false);
    expect(canResendChat({ status: 502 }, history, turn)).toBe(false);
    expect(canResendChat({ status: 409, code: 'INVALID_AI_CONFIGURATION' }, history, turn)).toBe(
      true,
    );
    expect(canResendChat({ status: 0 }, history, turn)).toBe(false);
    expect(canResendChat({ status: 504 }, history, turn)).toBe(false);
    expect(canResendChat(new Error('Disconnected'), history, turn)).toBe(false);
  });
  it('recovers a persisted answer after a lost response', () => {
    const saved: ChatMessage[] = [
      ...history,
      { id: 'saved-user', role: 'user', content: 'Hello' },
      { id: 'saved-answer', role: 'assistant', content: 'Recovered' },
    ];
    expect(findPersistedTurn(saved, turn)?.assistant?.content).toBe('Recovered');
  });
  it('matches the latest repeated question after an earlier cached answer receives server IDs', () => {
    const second: ChatTurn = {
      user: { id: 'local-second', role: 'user', content: 'Hello' },
      assistant: { id: 'local-second-answer', role: 'assistant', content: 'Second reply' },
      baselineIds: ['local-first', 'local-first-answer'],
      status: 'received',
    };
    const refreshed: ChatMessage[] = [
      { id: 'real-first', role: 'user', content: 'Hello' },
      { id: 'real-first-answer', role: 'assistant', content: 'First reply' },
      { id: 'real-second', role: 'user', content: 'Hello' },
      { id: 'real-second-answer', role: 'assistant', content: 'Second reply' },
    ];
    expect(mergeChatTurn(refreshed, second).map(({ id, content }) => ({ id, content }))).toEqual([
      { id: 'real-first', content: 'Hello' },
      { id: 'real-first-answer', content: 'First reply' },
      { id: 'local-second', content: 'Hello' },
      { id: 'local-second-answer', content: 'Second reply' },
    ]);
  });
});

describe('answer reveal', () => {
  it('reveals readable Unicode graphemes without splitting emoji or combining marks', () => {
    const units = splitChatText('A👨‍👩‍👧‍👦e\u0301🇻🇳');
    expect(units).toEqual(['A', '👨‍👩‍👧‍👦', 'e\u0301', '🇻🇳']);
    expect(revealText(units, 0, false)).toBe('');
    expect(revealText(units, 300, false)).toBe('A👨‍👩‍👧‍👦');
    expect(revealText(units, 600, false)).toBe('A👨‍👩‍👧‍👦e\u0301🇻🇳');
  });
  it('finishes long answers within eight seconds and respects reduced motion immediately', () => {
    const units = splitChatText('a'.repeat(20000));
    expect(revealText(units, 4000, false)).toHaveLength(10000);
    expect(revealText(units, 8000, false)).toHaveLength(20000);
    expect(revealText(units, 0, true)).toHaveLength(20000);
  });
});

describe('request ownership', () => {
  it('ignores responses after navigation, unmount, or an account change', () => {
    const request = { accountId: 'one', active: true };
    expect(isCurrentChatRequest(request, request, 'one')).toBe(true);
    expect(isCurrentChatRequest(request, { accountId: 'one', active: true }, 'one')).toBe(false);
    expect(isCurrentChatRequest(request, request, 'two')).toBe(false);
    request.active = false;
    expect(isCurrentChatRequest(request, request, 'one')).toBe(false);
  });
});
