import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useChat } from './useChat';
import { api } from '../../../shared/api';
import type { ChatSendResponse, Conversation } from '../../../shared/types/models';

vi.mock('../../../shared/api', () => ({
  api: { sendMessage: vi.fn(), conversation: vi.fn(), confirmSwitch: vi.fn() },
}));
vi.mock('react-router-dom', async (original) => ({
  ...(await original<typeof import('react-router-dom')>()),
  useNavigate: () => vi.fn(),
}));
vi.mock('../../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'account', role: 'CUSTOMER' } }),
}));

let client: QueryClient;
const key = ['conversation', 'account', 'current'];
const saved: Conversation = { id: 'current', title: 'Chat', topic: 'GENERAL_CHAT', messages: [] };
let chat: ReturnType<typeof useChat>;
function Harness({ id }: { id: string }) {
  chat = useChat(id);
  return null;
}
function mount(id = 'current') {
  renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Harness id={id} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(['me'], { id: 'account' });
  client.setQueryData(key, saved);
  mount();
});
afterEach(() => client.clear());

describe('chat send request ownership', () => {
  it('transfers a newly confirmed topic answer to the destination for a one-time reveal', async () => {
    client.setQueryData(key, {
      ...saved,
      messages: [{ id: 'question', role: 'user', content: 'Shop policy?' }],
      pendingSwitch: {
        type: 'SWITCH_REQUIRED',
        switchRequestId: 'switch',
        currentTopic: 'PHONE_CONSULTATION',
        suggestedTopic: 'SHOP_SUPPORT',
        message: 'Confirm',
      },
    });
    mount();
    vi.mocked(api.confirmSwitch).mockResolvedValue({
      type: 'ANSWER',
      conversationId: 'next',
      newConversationId: 'next',
      answer: 'New topic answer',
    });
    chat.confirm.mutate();
    await vi.waitFor(() =>
      expect(client.getMutationCache().getAll()[0].state.status).toBe('success'),
    );
    expect(
      client
        .getQueryData<Conversation>(['conversation', 'account', 'next'])
        ?.messages.map((message) => message.content),
    ).toEqual(['Shop policy?', 'New topic answer']);
    mount('next');
    expect(chat.animatedMessageId).toBeDefined();
    expect(chat.messages.find((message) => message.id === chat.animatedMessageId)?.content).toBe(
      'New topic answer',
    );
    client.removeQueries({ queryKey: ['chat-reveal', 'account', 'next'] });
    mount('next');
    expect(chat.animatedMessageId).toBeUndefined();
    expect(chat.messages.at(-1)?.content).toBe('New topic answer');
  });
  it('keeps a topic-switch prompt in the dialog instead of inventing a saved assistant message', async () => {
    vi.mocked(api.sendMessage).mockResolvedValue({
      type: 'SWITCH_REQUIRED',
      switchRequestId: 'switch',
      currentTopic: 'PHONE_CONSULTATION',
      suggestedTopic: 'SHOP_SUPPORT',
      message: 'Confirm the new topic',
    });
    chat.sendMessage('Shop policy?');
    await vi.waitFor(() =>
      expect(client.getMutationCache().getAll()[0].state.status).toBe('success'),
    );
    expect(
      client.getQueryData<Conversation>(key)?.messages.map((message) => message.content),
    ).toEqual(['Shop policy?']);
  });
  it('keeps the received JSON answer and outgoing question available if history has not refreshed', async () => {
    vi.mocked(api.sendMessage).mockResolvedValue({
      type: 'ANSWER',
      conversationId: 'current',
      answer: 'Actual JSON answer',
    });
    expect(chat.sendMessage('  Question  ')).toBe(true);
    await vi.waitFor(() =>
      expect(
        client.getQueryData<Conversation>(key)?.messages.map((message) => message.content),
      ).toEqual(['Question', 'Actual JSON answer']),
    );
    expect(api.sendMessage).toHaveBeenCalledWith('current', 'Question');
  });
  it('blocks two submissions in the same render before the pending state can rerender', async () => {
    vi.mocked(api.sendMessage).mockResolvedValue({
      type: 'CLARIFICATION_REQUIRED',
      message: 'Please clarify',
    });
    expect(chat.sendMessage('Question')).toBe(true);
    expect(chat.sendMessage('Question')).toBe(false);
    await vi.waitFor(() =>
      expect(client.getQueryData<Conversation>(key)?.messages.at(-1)?.content).toBe(
        'Please clarify',
      ),
    );
    expect(api.sendMessage).toHaveBeenCalledTimes(1);
  });
  it('does not write a late answer into cache after the account changes', async () => {
    let resolve!: (result: ChatSendResponse) => void;
    vi.mocked(api.sendMessage).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    chat.sendMessage('Private question');
    await vi.waitFor(() => expect(api.sendMessage).toHaveBeenCalledTimes(1));
    client.setQueryData(['me'], { id: 'another-account' });
    resolve({ type: 'ANSWER', conversationId: 'current', answer: 'Private answer' });
    await vi.waitFor(() =>
      expect(client.getMutationCache().getAll()[0].state.status).toBe('success'),
    );
    expect(client.getQueryData<Conversation>(key)?.messages).toEqual([]);
  });
});
