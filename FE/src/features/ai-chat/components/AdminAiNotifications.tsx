import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../../shared/api';
import { useAuth } from '../../auth/AuthProvider';
import { Icon } from '../../../shared/components/Icon';
import { Button, ErrorState, Modal, Skeleton } from '../../../shared/components/Ui';
import { formatDate } from '../../../shared/utils/format';
import { providerLabel } from '../../../shared/constants/aiProviders';
import { notificationTitle, outcomes, reasonMessage } from './AdminAiKeyAlert';
import './AdminAiNotifications.css';

export function AdminAiNotifications() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const queryKey = ['ai-notifications', user?.id];
  const query = useQuery({
    queryKey,
    queryFn: api.aiNotifications,
    enabled: user?.role === 'ADMIN',
    refetchInterval: 15_000,
    refetchOnWindowFocus: 'always',
    retry: false,
  });
  const markRead = useMutation({
    meta: { toast: { success: false } },
    mutationFn: (throughId: string) => api.markAiNotificationsRead(throughId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
    },
  });
  if (user?.role !== 'ADMIN') return null;
  const count = query.data?.unreadCount ?? 0;
  return (
    <>
      <Button
        variant="secondary"
        className="admin-ai-bell"
        aria-label={`Thông báo AI, ${count} chưa đọc`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="notifications" />
        <span className="admin-ai-bell-label">Thông báo AI</span>
        {count > 0 && (
          <span className="admin-ai-unread" aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>
      {open && (
        <Modal title="Thông báo AI" onClose={() => setOpen(false)}>
          <div className="flex flex-wrap justify-between gap-3 mb-4">
            <p className="help-text" role="status">
              {count} thông báo chưa đọc
            </p>
            <Button
              variant="secondary"
              disabled={!count || !query.data?.latestId || markRead.isPending}
              busy={markRead.isPending}
              onClick={() => markRead.mutate(query.data!.latestId!)}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
          {query.isPending && <Skeleton count={1} />}
          {query.error && (
            <ErrorState
              error={query.error}
              retry={() => {
                void query.refetch();
              }}
            />
          )}
          {markRead.error && <ErrorState error={markRead.error} />}
          {query.data?.items.length === 0 && <p className="muted">Chưa có thông báo AI.</p>}
          <ul className="admin-ai-notification-list" aria-label="Lịch sử thông báo AI">
            {query.data?.items.map((item) => (
              <li key={item.id} className={item.read ? '' : 'unread'}>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge">{item.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                  <span className={`badge ${item.resolved ? 'badge-success' : ''}`}>
                    {item.resolved ? 'Đã xử lý' : 'Cần kiểm tra'}
                  </span>
                </div>
                <h3>{notificationTitle(item.status, item.reason)}</h3>
                <p>
                  {item.reason && reasonMessage(item.reason)} {outcomes[item.status]}
                </p>
                {item.backupKeyName && <p>Key dự phòng {item.backupKeyName}</p>}
                {item.backupFailureReason && <p>{reasonMessage(item.backupFailureReason)}</p>}
                <p className="help-text">
                  {item.provider && `${providerLabel(item.provider)} · `}Model {item.model} · {formatDate(item.detectedAt)}
                </p>
              </li>
            ))}
          </ul>
          <Link
            className="button button-secondary mt-4"
            to="/admin/ai-settings"
            onClick={() => setOpen(false)}
          >
            Quản lý API key <Icon name="arrow_forward" />
          </Link>
        </Modal>
      )}
    </>
  );
}
