import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { ApiError } from '../../shared/api/httpClient';
import { Button, ErrorState } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { useAuth } from '../auth/AuthProvider';
import { useChat } from '../ai-chat/hooks/useChat';
import { ChatMessage } from '../ai-chat/components/ChatMessage';
import { PendingAssistant } from '../ai-chat/components/PendingAssistant';
import { TopicSwitchDialog } from '../ai-chat/components/TopicSwitchDialog';
import { Mascot } from './mascot/Mascot';
import type { MascotGesture, MascotMood } from './mascot/mascotScene';
import { mascotSkins, type MascotSkin } from './skins';
import { useAssistantConversation, useAssistantSkin } from './assistantPrefs';
import './AssistantWidget.css';

const suggestions = [
  'Điện thoại pin trâu dưới 10 triệu?',
  'Máy nào chụp ảnh đẹp tầm 20 triệu?',
  'So sánh 2 máy đang hot nhất shop',
];
const GREETED_KEY = 'smartphone-ai:assistant-greeted';

function Composer({
  disabled,
  busy,
  onSend,
  autoFocus,
}: {
  disabled: boolean;
  busy: boolean;
  onSend: (text: string) => boolean;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const submit = () => {
    const text = draft.trim();
    if (text && !disabled && onSend(text)) setDraft('');
  };
  return (
    <form
      className="ai-widget-composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor="ai-widget-input">
        Nhập câu hỏi cho trợ lý AI
      </label>
      <textarea
        id="ai-widget-input"
        rows={1}
        value={draft}
        maxLength={5000}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder="Hỏi về điện thoại…"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button
        type="submit"
        variant="ai"
        className="ai-widget-send"
        busy={busy}
        disabled={disabled || !draft.trim()}
        aria-label="Gửi tin nhắn"
      >
        {!busy && <Icon name="send" />}
      </Button>
    </form>
  );
}

function Conversation({
  id,
  firstMessage,
  onFirstMessageSent,
  onConversation,
  onMood,
  onAnswer,
}: {
  id: string;
  firstMessage: string | null;
  onFirstMessageSent: () => void;
  onConversation: (id: string | null) => void;
  onMood: (mood: MascotMood) => void;
  onAnswer: () => void;
}) {
  const chat = useChat(id, { onSwitched: onConversation, quiet: true });
  const stream = useRef<HTMLDivElement>(null);
  const follow = useCallback(() => {
    if (stream.current) stream.current.scrollTop = stream.current.scrollHeight;
  }, []);
  const loaded = !!chat.conversation.data;
  const missing =
    chat.conversation.error instanceof ApiError &&
    [403, 404].includes(chat.conversation.error.status);

  useEffect(() => {
    if (missing) onConversation(null);
  }, [missing, onConversation]);
  useEffect(() => {
    if (loaded && firstMessage && chat.sendMessage(firstMessage)) onFirstMessageSent();
    // sendMessage is recreated every render; the first message must be sent only once.
  }, [loaded, firstMessage]);
  useEffect(() => onMood(chat.waiting ? 'thinking' : 'idle'), [chat.waiting, onMood]);
  useEffect(() => {
    if (chat.animatedMessageId) onAnswer();
  }, [chat.animatedMessageId, onAnswer]);
  useEffect(() => () => onMood('idle'), [onMood]);
  useEffect(follow, [chat.messages.length, chat.waiting, follow]);

  if (chat.conversation.isPending)
    return (
      <div className="ai-widget-stream">
        <PendingAssistant />
      </div>
    );
  if (chat.conversation.error && !chat.conversation.data)
    return (
      <div className="ai-widget-stream">
        <ErrorState
          error={chat.conversation.error}
          retry={() => void chat.conversation.refetch()}
        />
      </div>
    );
  const locked = chat.busy || !!chat.pending || !!chat.failure;
  return (
    <>
      <div className="ai-widget-stream" ref={stream} role="log" aria-label="Tin nhắn với trợ lý AI">
        {!chat.messages.length && !chat.waiting && <Welcome />}
        {chat.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            compact
            animate={message.id === chat.animatedMessageId}
            onProgress={follow}
          />
        ))}
        {chat.waiting && <PendingAssistant />}
        {!!chat.failure && (
          <div className="chat-send-failure">
            <ErrorState error={chat.failure} />
            <Button variant="secondary" busy={chat.checking} onClick={() => void chat.retrySend()}>
              Kiểm tra và thử lại
            </Button>
            {chat.retryNotice && (
              <p className="text-sm text-secondary" role="status">
                {chat.retryNotice}
              </p>
            )}
            <button type="button" className="text-link" onClick={() => onConversation(null)}>
              Bắt đầu cuộc trò chuyện mới
            </button>
          </div>
        )}
      </div>
      <Composer disabled={locked} busy={chat.send.isPending} onSend={chat.sendMessage} autoFocus />
      {chat.pending && (
        <TopicSwitchDialog
          request={chat.pending}
          onConfirm={() => chat.confirm.mutate()}
          onCancel={() => chat.cancel.mutate()}
          busy={chat.confirm.isPending || chat.cancel.isPending}
          waiting={chat.confirm.isPending}
          error={chat.confirm.error || chat.cancel.error}
        />
      )}
    </>
  );
}

function Welcome({ onPick }: { onPick?: (text: string) => void }) {
  return (
    <div className="ai-widget-welcome">
      <p className="ai-widget-welcome-title">Chào bạn!</p>
      <p>Mình tư vấn chọn máy, so sánh và giải đáp về điện thoại. Hỏi ngắn thôi cũng được!</p>
      {onPick && (
        <div className="ai-widget-chips">
          {suggestions.map((text) => (
            <button key={text} type="button" onClick={() => onPick(text)}>
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Starter({ onCreated }: { onCreated: (id: string, firstMessage: string) => void }) {
  const client = useQueryClient();
  const { user } = useAuth();
  const product = useMatch('/products/:id');
  const create = useMutation({
    mutationKey: ['chat', user?.id, 'create', 'widget'],
    meta: { toast: false },
    mutationFn: (_message: string) =>
      api.createConversation(
        'PHONE_CONSULTATION',
        product?.params.id ? { productIds: [product.params.id] } : undefined,
      ),
    onSuccess: (conversation, message) => {
      void client.invalidateQueries({ queryKey: ['conversations'] });
      onCreated(conversation.id, message);
    },
  });
  const start = (text: string) => {
    if (create.isPending) return false;
    create.mutate(text);
    return true;
  };
  return (
    <>
      <div className="ai-widget-stream">
        <Welcome onPick={start} />
        {create.isPending && <PendingAssistant />}
        {create.error && <ErrorState error={create.error} />}
      </div>
      <Composer disabled={create.isPending} busy={create.isPending} onSend={start} autoFocus />
    </>
  );
}

function SkinPicker({
  current,
  onChoose,
}: {
  current: MascotSkin;
  onChoose: (id: string) => void;
}) {
  return (
    <div className="ai-widget-stream">
      <p className="ai-widget-section-title">Chọn trang phục cho trợ lý</p>
      <div className="ai-widget-skins" role="radiogroup" aria-label="Trang phục trợ lý">
        {mascotSkins.map((skin) => (
          <button
            key={skin.id}
            type="button"
            role="radio"
            aria-checked={skin.id === current.id}
            className="ai-widget-skin"
            onClick={() => onChoose(skin.id)}
          >
            <span className="ai-widget-skin-swatch" aria-hidden="true">
              <span style={{ background: skin.colors.outfit }} />
              <span style={{ background: skin.colors.headphones }} />
              <span style={{ background: skin.colors.hair }} />
              <span style={{ background: skin.colors.glow }} />
            </span>
            <span className="ai-widget-skin-name">{skin.name}</span>
            <span className="ai-widget-skin-desc">{skin.description}</span>
            {skin.id === current.id && (
              <Icon name="check_circle" className="ai-widget-skin-check" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AssistantWidget() {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'skins'>('chat');
  const [mood, setMood] = useState<MascotMood>('idle');
  const [gesture, setGesture] = useState<{ name: MascotGesture; key: number }>();
  const [greeting, setGreeting] = useState(false);
  const [firstMessage, setFirstMessage] = useState<string | null>(null);
  // Click ripple + reaction emojis on the launcher; key restarts the CSS animation.
  const [burst, setBurst] = useState(0);
  const lastHover = useRef(0);
  const { skin, choose } = useAssistantSkin();
  const customer = user?.role === 'CUSTOMER' ? user : null;
  const [conversationId, setConversationId] = useAssistantConversation(customer?.id);
  const play = useCallback((name: MascotGesture) => setGesture({ name, key: Date.now() }), []);
  const onAnswer = useCallback(() => play('happy'), [play]);

  useEffect(() => {
    let greeted = true;
    try {
      greeted = sessionStorage.getItem(GREETED_KEY) === '1';
      sessionStorage.setItem(GREETED_KEY, '1');
    } catch {
      greeted = true;
    }
    if (greeted) return;
    const show = window.setTimeout(() => {
      setGreeting(true);
      play('wave');
    }, 2500);
    const hide = window.setTimeout(() => setGreeting(false), 9000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [play]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (pathname.startsWith('/ai') || user?.role === 'ADMIN') return null;

  const toggle = () => {
    setBurst(Date.now());
    setOpen((value) => !value);
    setGreeting(false);
    if (!open) play('wave');
  };
  const newConversation = () => {
    setFirstMessage(null);
    setConversationId(null);
    setView('chat');
  };
  const status =
    mood === 'thinking'
      ? 'Đang suy nghĩ…'
      : customer
        ? 'Sẵn sàng tư vấn'
        : 'Đăng nhập để trò chuyện';

  return (
    <div className={`ai-widget${open ? ' is-open' : ''}`}>
      {open && (
        <section className="ai-widget-panel" role="dialog" aria-label="Trợ lý SmartPhone AI">
          <header className="ai-widget-header">
            <span
              className="ai-widget-dot"
              style={{ background: skin.colors.glow }}
              aria-hidden="true"
            />
            <div className="ai-widget-heading">
              <h2>Trợ lý SmartPhone AI</h2>
              <p role="status">{status}</p>
            </div>
            <button
              type="button"
              className={`icon-button ai-widget-tool${view === 'skins' ? ' is-active' : ''}`}
              aria-label="Đổi trang phục trợ lý"
              aria-pressed={view === 'skins'}
              onClick={() => setView(view === 'skins' ? 'chat' : 'skins')}
            >
              <Icon name="checkroom" />
            </button>
            {customer && (
              <button
                type="button"
                className="icon-button ai-widget-tool"
                aria-label="Cuộc trò chuyện mới"
                onClick={newConversation}
              >
                <Icon name="edit_square" />
              </button>
            )}
            {customer && (
              <Link
                className="icon-button ai-widget-tool"
                aria-label="Mở trang trò chuyện đầy đủ"
                to={conversationId ? `/ai/conversations/${conversationId}` : '/ai'}
              >
                <Icon name="open_in_full" />
              </Link>
            )}
            <button
              type="button"
              className="icon-button ai-widget-tool"
              aria-label="Thu nhỏ trợ lý"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" />
            </button>
          </header>
          {view === 'skins' ? (
            <SkinPicker
              current={skin}
              onChoose={(id) => {
                choose(id);
                play('happy');
              }}
            />
          ) : !customer ? (
            <div className="ai-widget-stream">
              <Welcome />
              <Link
                className="button button-ai"
                to="/login"
                state={{ from: `${pathname}${search}` }}
              >
                Đăng nhập để trò chuyện
              </Link>
            </div>
          ) : conversationId ? (
            <Conversation
              key={conversationId}
              id={conversationId}
              firstMessage={firstMessage}
              onFirstMessageSent={() => setFirstMessage(null)}
              onConversation={setConversationId}
              onMood={setMood}
              onAnswer={onAnswer}
            />
          ) : (
            <Starter
              onCreated={(id, message) => {
                setFirstMessage(message);
                setConversationId(id);
              }}
            />
          )}
        </section>
      )}
      {greeting && !open && (
        <button type="button" className="ai-widget-greeting" onClick={toggle}>
          Chào bạn! Cần tư vấn điện thoại không?
        </button>
      )}
      <button
        type="button"
        className="ai-widget-launcher"
        aria-label={open ? 'Thu nhỏ trợ lý AI' : 'Mở trợ lý AI'}
        aria-expanded={open}
        onClick={toggle}
        onPointerEnter={() => {
          // Hover reaction: a friendly wave, at most every few seconds.
          if (Date.now() - lastHover.current > 4000) {
            lastHover.current = Date.now();
            play('wave');
          }
        }}
      >
        <Mascot skin={skin} mood={mood} gesture={gesture} />
        {!!burst && (
          <span key={burst} className="ai-widget-burst" aria-hidden="true">
            <span className="ai-widget-ripple" />
            <span className="ai-widget-emoji">❤️</span>
            <span className="ai-widget-emoji">👍</span>
            <span className="ai-widget-emoji">😄</span>
          </span>
        )}
      </button>
    </div>
  );
}
