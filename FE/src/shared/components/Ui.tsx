import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { errorMessage } from '../utils/format';

export function Button({
  children,
  busy,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai';
}) {
  return (
    <button
      type="button"
      className={`button button-${variant} ${className}`}
      disabled={busy || disabled}
      {...props}
    >
      {busy && <Icon name="progress_activity" className="spin" />}
      {children}
    </button>
  );
}
export function ProductImage({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      className={className}
      src={src || '/images/placeholder.svg'}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/images/placeholder.svg';
      }}
    />
  );
}
export function EmptyState({
  title,
  description,
  action,
  icon = 'search_off',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="empty-state">
      <div className="icon-tile">
        <Icon name={icon} />
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="error-state" role="alert">
      <Icon name="error" />
      <p>{errorMessage(error)}</p>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="product-grid" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton-card">
          <div className="skeleton h-48" />
          <div className="skeleton h-5 mt-6" />
          <div className="skeleton h-4 mt-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Đường dẫn" className="breadcrumb">
      <Link to="/">Trang chủ</Link>
      {items.map((i, n) => (
        <span key={n}>
          <Icon name="chevron_right" />
          {i.to ? <Link to={i.to}>{i.label}</Link> : <span aria-current="page">{i.label}</span>}
        </span>
      ))}
    </nav>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted mt-3">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  busy = false,
}: PropsWithChildren<{ title: string; onClose: () => void; busy?: boolean }>) {
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={heading}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 id={heading}>{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Đóng hộp thoại"
            disabled={busy}
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
export function ConfirmDialog({
  title,
  message,
  label = 'Xác nhận',
  onConfirm,
  onClose,
  busy,
  error,
}: {
  title: string;
  message: string;
  label?: string;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
  error?: unknown;
}) {
  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <p className="muted">{message}</p>
      {!!error && <ErrorState error={error} />}
      <div className="modal-actions">
        <Button variant="secondary" disabled={busy} onClick={onClose}>
          Quay lại
        </Button>
        <Button busy={busy} onClick={onConfirm}>
          {label}
        </Button>
      </div>
    </Modal>
  );
}
type ToastValue = { notify: (message: string, tone?: 'success' | 'error') => void };
const ToastContext = createContext<ToastValue>({ notify: () => {} });
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<{ id: string; message: string; tone: string }[]>([]);
  function notify(message: string, tone = 'success') {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4500);
  }
  return (
    <ToastContext value={{ notify }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            <Icon name={t.tone === 'error' ? 'error' : 'check_circle'} />
            <span>{t.message}</span>
            <button
              className="icon-button"
              aria-label="Đóng thông báo"
              onClick={() => setToasts((v) => v.filter((x) => x.id !== t.id))}
            >
              <Icon name="close" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
