import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import type {
  AiKeyIdentity,
  AiProvider,
  AiSettings,
  AiQuotaKey,
  AiKeyEditInput,
} from '../../shared/types/models';
import {
  Button,
  ConfirmDialog,
  ErrorState,
  Modal,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatDate } from '../../shared/utils/format';
import { QuotaUsage, useProviderQuota } from './AiQuotaSettings';
import './AiKeyManagement.css';

const STATUS_LABELS: Record<NonNullable<AiQuotaKey['status']>, string> = {
  UNKNOWN: 'Chưa kiểm tra',
  WORKING: 'Sẵn sàng',
  RATE_LIMIT: 'Chạm hạn mức',
  BALANCE_ERROR: 'Không đủ số dư',
  AUTH_ERROR: 'Lỗi API key',
  MODEL_ERROR: 'Không dùng được model',
  PROVIDER_ERROR: 'Lỗi nhà cung cấp',
  RETRY_READY: 'Có thể thử lại',
};
const EVENT_LABELS: Record<string, string> = {
  PRIMARY_CHANGED: 'Đổi key chính',
  KEY_ADDED: 'Thêm key',
  KEY_EDITED: 'Cập nhật key',
  KEY_CHECKED: 'Kiểm tra kết nối',
  KEY_FAILED: 'Key gặp lỗi',
  USING_BACKUP: 'Sử dụng key dự phòng',
  KEY_REMOVED: 'Xóa key',
  PRIORITY_CHANGED: 'Đổi ưu tiên',
};

function Pagination({
  page,
  total,
  size,
  label,
  onChange,
}: {
  page: number;
  total: number;
  size: number;
  label: string;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <nav className="ai-pagination" aria-label={'Phân trang ' + label}>
      <span className="help-text">
        {total ? page * size + 1 : 0}–{Math.min((page + 1) * size, total)} / {total} · {size}/trang
      </span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={page === 0} onClick={() => onChange(page - 1)}>
          Trước
        </Button>
        <span className="text-sm" aria-live="polite">
          {page + 1} / {pages}
        </span>
        <Button variant="secondary" disabled={page + 1 >= pages} onClick={() => onChange(page + 1)}>
          Sau
        </Button>
      </div>
    </nav>
  );
}

export function AiKeyManagement({
  provider,
  configId,
  model = '',
  disabled,
  mode = 'all',
  onSaved,
}: {
  provider: AiProvider;
  configId: string;
  model?: string;
  disabled: boolean;
  mode?: 'all' | 'keys' | 'history';
  onSaved?: (setting: AiSettings) => void;
}) {
  const client = useQueryClient();
  const { notify } = useToast();
  const section = useRef<HTMLElement>(null);
  const [keyPage, setKeyPage] = useState(0);
  const [logPage, setLogPage] = useState(0);
  const [editing, setEditing] = useState<{
    key?: AiKeyIdentity;
    usage?: AiQuotaKey;
    configId: string;
    model: string;
  } | null>(null);
  const [promoting, setPromoting] = useState<
    (AiKeyIdentity & { configId: string; model: string }) | null
  >(null);
  const [deleting, setDeleting] = useState<
    (AiKeyIdentity & { configId: string; model: string }) | null
  >(null);
  const [replacementKeyRef, setReplacementKeyRef] = useState('');
  const state = useQuery({
    queryKey: ['ai-key-management', provider, configId],
    queryFn: () => api.aiKeyManagement(provider),
    enabled: !!configId,
    refetchInterval: 15_000,
  });
  const quota = useProviderQuota(provider, configId, model);
  const activity = useQuery({
    queryKey: ['ai-activity', provider, logPage],
    queryFn: () => api.aiActivity(provider, logPage),
    enabled: mode !== 'keys',
    refetchInterval: 15_000,
  });
  const rows = state.data?.configId === configId ? state.data.keys : [];
  const primary = rows.find((key) => key.priority === 0);
  const backups = rows.filter((key) => key.priority > 0).sort((a, b) => a.priority - b.priority);
  const currentPage = Math.min(keyPage, Math.max(0, Math.ceil(backups.length / 5) - 1));
  const quotaKeys =
    quota.data?.configId === configId && quota.data.model === model ? quota.data.keys : [];
  const lastUsed = quotaKeys
    .map((key) => key.lastUsedAt || '')
    .sort()
    .at(-1);
  const latestKey = lastUsed ? quotaKeys.find((key) => key.lastUsedAt === lastUsed) : undefined;

  useEffect(() => {
    setEditing(null);
    setPromoting(null);
    setDeleting(null);
    setReplacementKeyRef('');
  }, [configId, model]);

  useEffect(() => {
    setKeyPage(0);
    setLogPage(0);
  }, [provider]);
  useEffect(() => {
    const closeMenus = (event: Event) => {
      const escape = event instanceof KeyboardEvent && event.key === 'Escape';
      if (event instanceof KeyboardEvent && !escape) return;
      section.current
        ?.querySelectorAll<HTMLDetailsElement>('.ai-key-menu[open]')
        .forEach((menu) => {
          if (escape || !menu.contains(event.target as Node)) {
            menu.open = false;
            if (escape) menu.querySelector('summary')?.focus();
          }
        });
    };
    document.addEventListener('pointerdown', closeMenus);
    document.addEventListener('keydown', closeMenus);
    return () => {
      document.removeEventListener('pointerdown', closeMenus);
      document.removeEventListener('keydown', closeMenus);
    };
  }, []);

  function refresh(saved?: AiSettings) {
    if (saved) onSaved?.(saved);
    for (const key of [
      'ai-settings',
      'ai-key-management',
      'ai-quota',
      'ai-activity',
      'ai-key-alert',
      'ai-notifications',
      'ai-saved-models',
    ])
      void client.invalidateQueries({ queryKey: [key] });
  }
  const promote = useMutation({
    meta: { toast: { success: false } },
    mutationFn: (target: { configId: string; keyRef: string }) =>
      api.promoteAiKey(target.configId, target.keyRef),
    onSuccess: () => {
      setPromoting(null);
      refresh();
      notify('Đã hoán đổi key chính và key dự phòng.');
    },
    onError: () => refresh(),
  });
  const remove = useMutation({
    meta: { toast: { success: false } },
    mutationFn: (target: { configId: string; keyRef: string; replacementKeyRef?: string }) =>
      api.removeAiKey(target.configId, target.keyRef, target.replacementKeyRef),
    onSuccess: (saved) => {
      setDeleting(null);
      refresh(saved);
      notify('Đã xóa API key.');
    },
    onError: () => refresh(),
  });
  const check = useMutation({
    meta: { toast: { success: false } },
    mutationFn: (keyRef: string) => api.checkAiKey(configId, keyRef),
    onSuccess: () => notify('Kiểm tra key thành công. Trạng thái model đã được cập nhật.'),
    onSettled: () => refresh(),
  });
  const move = useMutation({
    meta: { toast: { success: false } },
    mutationFn: ({ keyRef, direction }: { keyRef: string; direction: number }) =>
      api.moveAiKey(configId, keyRef, direction),
    onSuccess: (saved) => {
      refresh(saved);
      notify('Đã cập nhật thứ tự ưu tiên.');
    },
    onError: () => refresh(),
  });
  const busy =
    disabled || promote.isPending || remove.isPending || check.isPending || move.isPending;

  function actions(key: AiKeyIdentity) {
    return (
      <div className="ai-key-row-actions">
        {key.priority > 0 && (
          <Button
            variant="secondary"
            aria-label={`Đặt ${key.name} làm key chính`}
            disabled={busy || !state.data?.active}
            onClick={() => setPromoting({ ...key, configId, model })}
          >
            Đặt làm chính
          </Button>
        )}
        <Button
          variant="secondary"
          aria-label={'Sửa ' + key.name}
          disabled={busy}
          onClick={() =>
            setEditing({
              configId,
              model,
              key,
              usage: quotaKeys.find((usage) => usage.keyRef === key.keyRef),
            })
          }
        >
          Sửa
        </Button>
        {
          <Button
            variant="danger"
            aria-label={'Xóa ' + key.name}
            disabled={busy}
            onClick={() => {
              setReplacementKeyRef('');
              setDeleting({ ...key, configId, model });
            }}
          >
            Xóa key
          </Button>
        }
        <details
          className="ai-key-menu"
          name={'key-actions-' + provider}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('button'))
              event.currentTarget.removeAttribute('open');
          }}
        >
          <summary aria-label={'Thao tác ' + key.name}>
            Thao tác <span aria-hidden="true">⌄</span>
          </summary>
          <div className="ai-key-menu-items">
            <Button
              variant="ghost"
              disabled={busy}
              aria-label={'Kiểm tra ' + key.name}
              onClick={() => check.mutate(key.keyRef)}
            >
              Kiểm tra lại
            </Button>
            {key.priority > 0 && (
              <>
                <Button
                  variant="ghost"
                  aria-label={'Tăng ưu tiên ' + key.name}
                  disabled={busy || key.priority === 1}
                  onClick={() => move.mutate({ keyRef: key.keyRef, direction: -1 })}
                >
                  Tăng ưu tiên
                </Button>
                <Button
                  variant="ghost"
                  aria-label={'Giảm ưu tiên ' + key.name}
                  disabled={busy || key.priority === backups.length}
                  onClick={() => move.mutate({ keyRef: key.keyRef, direction: 1 })}
                >
                  Giảm ưu tiên
                </Button>
              </>
            )}
          </div>
        </details>
      </div>
    );
  }

  function status(usage?: AiQuotaKey) {
    const value = usage?.status || 'UNKNOWN';
    const isError = [
      'RATE_LIMIT',
      'AUTH_ERROR',
      'MODEL_ERROR',
      'BALANCE_ERROR',
      'PROVIDER_ERROR',
    ].includes(value);
    return (
      <div className="ai-key-status">
        <span
          className={
            'badge ' + (isError ? 'badge-error' : value === 'WORKING' ? 'badge-success' : '')
          }
        >
          {value === 'RATE_LIMIT'
            ? usage?.reason === 'AI_PROVIDER_DAILY_LIMIT'
              ? 'Chạm hạn mức ngày'
              : usage?.reason === 'AI_PROVIDER_MINUTE_LIMIT'
                ? 'Chạm hạn mức phút'
                : 'Chạm hạn mức · Chưa rõ loại'
            : value === 'PROVIDER_ERROR' &&
                (usage?.reason === 'AI_PROVIDER_BUSY' ||
                  usage?.reason === 'AI_PROVIDER_SERVICE_BUSY')
              ? 'Nhà cung cấp đang bận'
              : STATUS_LABELS[value]}
        </span>
        {usage?.retryAt && (
          <span className="help-text">Thử lại từ {formatDate(usage.retryAt)}</span>
        )}
        {isError && !usage?.retryAt && (
          <span className="help-text">Chưa xác định thời gian phục hồi. Hãy kiểm tra lại.</span>
        )}
        {usage?.checkedAt && (
          <span className="help-text">Kiểm tra {formatDate(usage.checkedAt)}</span>
        )}
      </div>
    );
  }

  return (
    <section
      className="ai-key-management"
      ref={section}
      aria-label={mode === 'history' ? 'Nhật ký AI' : 'Quản lý API key'}
    >
      {mode !== 'history' && (
        <>
          <div className="ai-section-heading">
            <div>
              <h2>API key</h2>
              <p className="help-text mt-2">
                Model {model || 'chưa chọn'} · Một key chính và tối đa 10 key dự phòng
              </p>
            </div>
            <Button
              disabled={
                busy || (!!configId && state.isPending) || !model.trim() || backups.length >= 10
              }
              onClick={() => setEditing({ configId, model })}
            >
              {primary ? 'Thêm key dự phòng' : 'Thêm key chính'}
            </Button>
          </div>
          {disabled && (
            <p className="notice mt-4">
              Hãy lưu model đang chọn trước khi chỉnh sửa hoặc kiểm tra key.
            </p>
          )}
          {state.error && <ErrorState error={state.error} retry={() => void state.refetch()} />}
          {quota.error && <ErrorState error={quota.error} retry={() => void quota.refetch()} />}
          {latestKey && (
            <p className="notice mt-4">
              Lần trả lời gần nhất dùng{' '}
              <strong>{rows.find((key) => key.keyRef === latestKey.keyRef)?.name}</strong> ·{' '}
              {formatDate(latestKey.lastUsedAt!)}
            </p>
          )}
          {state.isPending && configId ? (
            <Skeleton count={1} />
          ) : primary ? (
            <div className="ai-key-primary mt-5">
              <div className="ai-key-identity-main">
                <div className="flex items-center flex-wrap gap-3">
                  <strong>{primary.name}</strong>
                  <span className="badge badge-success">Key chính</span>
                  <span className="help-text">{primary.maskedKey}</span>
                </div>
                <p className="help-text mt-2">
                  {quotaKeys.find((key) => key.keyRef === 'PRIMARY')?.projectName ||
                    'Chưa xác định nhóm hạn mức'}
                </p>
                {status(quotaKeys.find((key) => key.keyRef === 'PRIMARY'))}
                <QuotaUsage usage={quotaKeys.find((key) => key.keyRef === 'PRIMARY')} />
                <details className="ai-key-detail">
                  <summary>Thông tin nhận diện</summary>
                  <p className="help-text">Mã nhận diện {primary.identity.slice(0, 12)}</p>
                  <p className="help-text">
                    Lần gần nhất đặt làm chính{' '}
                    {primary.lastPrimaryAt ? formatDate(primary.lastPrimaryAt) : '— chưa ghi nhận'}
                  </p>
                </details>
              </div>
              {actions(primary)}
            </div>
          ) : (
            <p className="ai-settings-empty">Thêm key chính để cấu hình kết nối.</p>
          )}
          <div className="ai-section-heading mt-6">
            <h3>Key dự phòng ({backups.length}/10)</h3>
            <span className="help-text">Ưu tiên từ trên xuống</span>
          </div>
          <table className="ai-backup-table mt-3">
            <thead>
              <tr>
                <th>API key</th>
                <th>Nhóm hạn mức</th>
                <th>Trạng thái</th>
                <th>Mức sử dụng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {backups.slice(currentPage * 5, currentPage * 5 + 5).map((key) => {
                const usage = quotaKeys.find((item) => item.keyRef === key.keyRef);
                return (
                  <tr key={key.identity}>
                    <td>
                      <strong>{key.name}</strong>
                      <p className="help-text">
                        Dự phòng {key.priority} · {key.maskedKey}
                      </p>
                    </td>
                    <td>{usage?.projectName || 'Chưa xác định'}</td>
                    <td>{status(usage)}</td>
                    <td>
                      <QuotaUsage usage={usage} />
                    </td>
                    <td>{actions(key)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!backups.length && <p className="ai-settings-empty">Chưa có key dự phòng.</p>}
          <Pagination
            page={currentPage}
            total={backups.length}
            size={5}
            label="key dự phòng"
            onChange={setKeyPage}
          />
        </>
      )}
      {mode !== 'keys' && (
        <div className={mode === 'all' ? 'mt-7' : ''}>
          <h2>Nhật ký hoạt động</h2>
          <p className="help-text mt-2">Thao tác quản trị và chuyển key tự động, mới nhất trước.</p>
          {activity.isPending ? (
            <Skeleton count={1} />
          ) : activity.error ? (
            <ErrorState error={activity.error} retry={() => void activity.refetch()} />
          ) : (
            <>
              <table className="ai-activity-table mt-4">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Sự kiện</th>
                    <th>Thực hiện</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.data?.items.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
                      </td>
                      <td>
                        <strong>{EVENT_LABELS[entry.type] || entry.type}</strong>
                        <p>
                          {entry.keyName} · {entry.maskedKey}
                        </p>
                        {entry.model && <p className="help-text">{entry.model}</p>}
                        {entry.reason && <p className="help-text">{entry.reason}</p>}
                      </td>
                      <td>{entry.actor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!activity.data?.total && (
                <p className="ai-settings-empty">Chưa có hoạt động được ghi nhận.</p>
              )}
              <Pagination
                page={logPage}
                total={activity.data?.total || 0}
                size={10}
                label="nhật ký"
                onChange={setLogPage}
              />
            </>
          )}
        </div>
      )}
      {check.error && <ErrorState error={check.error} />}
      {move.error && <ErrorState error={move.error} />}
      {promoting && (
        <ConfirmDialog
          title={`Đặt ${promoting.name} làm key chính?`}
          message={`Key chính hiện tại xuống vị trí dự phòng ${promoting.priority}. Tên, nhóm hạn mức và trạng thái đi theo từng key.`}
          label="Hoán đổi key"
          busy={promote.isPending}
          error={promote.error}
          onClose={() => {
            if (!promote.isPending) setPromoting(null);
          }}
          onConfirm={() => promote.mutate(promoting)}
        />
      )}
      {deleting && (
        <Modal
          title={deleting.priority === 0 ? 'Xóa key chính' : 'Xóa key dự phòng'}
          busy={remove.isPending}
          onClose={() => {
            if (!remove.isPending) setDeleting(null);
          }}
        >
          <p>Xóa {deleting.name} khỏi danh sách?</p>
          {deleting.priority === 0 &&
            (backups.length ? (
              <label className="form-field mt-4">
                Key dự phòng thay thế
                <select
                  aria-label="Key dự phòng thay thế"
                  value={replacementKeyRef}
                  disabled={remove.isPending}
                  onChange={(event) => setReplacementKeyRef(event.target.value)}
                >
                  <option value="">Chọn key làm chính</option>
                  {backups.map((key) => (
                    <option key={key.keyRef} value={key.keyRef}>
                      {key.name} · {key.maskedKey}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="notice mt-4">
                Đây là key cuối cùng. Nền tảng này sẽ bị tắt.
                {state.data?.active && ' Chat sẽ dừng cho đến khi bạn thêm key mới.'}
              </p>
            ))}
          {remove.error && <ErrorState error={remove.error} />}
          <div className="modal-actions">
            <Button
              variant="secondary"
              disabled={remove.isPending}
              onClick={() => setDeleting(null)}
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              busy={remove.isPending}
              disabled={deleting.priority === 0 && backups.length > 0 && !replacementKeyRef}
              onClick={() =>
                remove.mutate({
                  configId: deleting.configId,
                  keyRef: deleting.keyRef,
                  replacementKeyRef: replacementKeyRef || undefined,
                })
              }
            >
              Xóa key
            </Button>
          </div>
        </Modal>
      )}
      {editing && (
        <KeyEditor
          provider={provider}
          configId={editing.configId}
          model={editing.model}
          entry={editing}
          hasPrimary={!!primary}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEditing(null);
            refresh(saved);
            notify('Đã lưu API key và hạn mức.');
          }}
        />
      )}
    </section>
  );
}

function KeyEditor({
  provider,
  configId,
  model,
  entry,
  hasPrimary,
  onClose,
  onSaved,
}: {
  provider: AiProvider;
  configId: string;
  model: string;
  entry: { key?: AiKeyIdentity; usage?: AiQuotaKey };
  hasPrimary: boolean;
  onClose: () => void;
  onSaved: (saved: AiSettings) => void;
}) {
  const [name, setName] = useState(entry.key?.name || (!hasPrimary ? 'Key chính' : ''));
  const [secret, setSecret] = useState('');
  const [visible, setVisible] = useState(false);
  const [project, setProject] = useState(entry.usage?.projectName || '');
  const [useDefault, setUseDefault] = useState(entry.usage?.limitSource !== 'MANUAL');
  const defaultLimit = provider === 'GEMINI' && /flash|pro/.test(model) ? '250000' : '';
  const [limit, setLimit] = useState(entry.usage?.tpmLimit?.toString() || defaultLimit);
  const [useDefaultDaily, setUseDefaultDaily] = useState(
    entry.usage?.dailyLimitSource !== 'MANUAL',
  );
  const [dailyLimit, setDailyLimit] = useState(entry.usage?.dailyRequestLimit?.toString() || '');
  const save = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () => {
      const tpmLimit = limit.trim() ? Number(limit) : null;
      if (
        !useDefault &&
        tpmLimit !== null &&
        (!Number.isSafeInteger(tpmLimit) || tpmLimit <= 0 || tpmLimit > 1_000_000_000)
      )
        throw new Error('Giới hạn mỗi phút không hợp lệ.');
      const dailyRequestLimit = dailyLimit.trim() ? Number(dailyLimit) : null;
      if (
        !useDefaultDaily &&
        (dailyRequestLimit === null ||
          !Number.isSafeInteger(dailyRequestLimit) ||
          dailyRequestLimit <= 0 ||
          dailyRequestLimit > 1_000_000_000)
      )
        throw new Error('Giới hạn yêu cầu mỗi ngày không hợp lệ.');
      const input: AiKeyEditInput = {
        provider,
        model,
        configId: configId || undefined,
        keyRef: entry.key?.keyRef,
        name: name.trim(),
        apiKey: secret.trim() || undefined,
        projectName: project.trim() || null,
        tpmLimit: useDefault ? null : tpmLimit,
        useDefault,
        useDefaultDaily,
        dailyRequestLimit: useDefaultDaily ? null : dailyRequestLimit,
      };
      return api.saveAiKey(input);
    },
    onSuccess: onSaved,
  });
  const changed = !entry.key || !!secret.trim();
  return (
    <Modal
      title={entry.key ? 'Sửa API key' : hasPrimary ? 'Thêm key dự phòng' : 'Thêm key chính'}
      onClose={() => {
        if (!save.isPending) onClose();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!save.isPending) save.mutate();
        }}
      >
        <div className="ai-key-editor-fields">
          <p className="help-text">Model {model}</p>
          <label className="form-field">
            Tên nhận diện
            <input
              required
              maxLength={80}
              value={name}
              disabled={save.isPending}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="form-field">
            {entry.key ? 'Thay API key' : 'API key'}
            <div className="password-field">
              <input
                aria-label={entry.key ? 'Thay API key' : 'API key'}
                required={!entry.key}
                maxLength={2048}
                type={visible ? 'text' : 'password'}
                value={secret}
                autoComplete="off"
                disabled={save.isPending}
                placeholder={entry.key ? 'Để trống để giữ key hiện tại' : 'Nhập API key'}
                onChange={(event) => {
                  setSecret(event.target.value);
                  if (!secret && event.target.value) {
                    setProject('');
                    setUseDefault(true);
                    setLimit(defaultLimit);
                    setUseDefaultDaily(true);
                    setDailyLimit('');
                  }
                }}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={visible ? 'Ẩn API key' : 'Hiện API key'}
                onClick={() => setVisible(!visible)}
              >
                <Icon name={visible ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>
          <label className="form-field">
            {provider === 'GEMINI' ? 'Project ID' : 'Nhóm hạn mức'}
            <input
              aria-label={provider === 'GEMINI' ? 'Project ID' : 'Nhóm hạn mức'}
              maxLength={100}
              value={project}
              disabled={save.isPending}
              onChange={(event) => setProject(event.target.value)}
              placeholder={
                provider === 'GEMINI'
                  ? 'Project ID trên Google AI Studio'
                  : 'Mã nhóm của tổ chức hoặc tài khoản'
              }
            />
            <span className="help-text">
              Các key cùng tổ chức hoặc project dùng chung mã nhóm để tính hạn mức chính xác.
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={useDefaultDaily}
              disabled={save.isPending}
              onChange={(event) => setUseDefaultDaily(event.target.checked)}
            />
            Dùng hạn mức ngày mặc định
          </label>
          <label className="form-field">
            Giới hạn yêu cầu mỗi ngày
            <input
              aria-label="Giới hạn yêu cầu mỗi ngày"
              type="number"
              min={1}
              max={1000000000}
              step={1}
              required={!useDefaultDaily}
              disabled={save.isPending || useDefaultDaily}
              value={
                useDefaultDaily
                  ? entry.usage?.dailyLimitSource !== 'MANUAL' && !secret
                    ? (entry.usage?.dailyRequestLimit ?? '')
                    : ''
                  : dailyLimit
              }
              placeholder="Chưa xác định"
              onChange={(event) => setDailyLimit(event.target.value)}
            />
            <span className="help-text">
              Ưu tiên giới hạn ngày từ nhà cung cấp, sau đó dùng mặc định ước tính nếu có. Số còn
              lại dựa trên lượt gọi AI do ứng dụng ghi nhận.
            </span>
          </label>
          <details>
            <summary>Hạn mức token mỗi phút để chuyển key</summary>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={useDefault}
                disabled={save.isPending}
                onChange={(event) => setUseDefault(event.target.checked)}
              />
              Dùng hạn mức mặc định
            </label>
            <label className="form-field">
              Giới hạn mỗi phút
              <input
                aria-label="Giới hạn mỗi phút"
                required={!useDefault}
                type="number"
                min={1}
                max={1000000000}
                step={1}
                disabled={save.isPending || useDefault}
                value={
                  useDefault
                    ? entry.usage?.limitSource === 'PROVIDER' && !secret
                      ? entry.usage.tpmLimit?.toString() || ''
                      : defaultLimit
                    : limit
                }
                onChange={(event) => setLimit(event.target.value)}
                placeholder="Chưa xác định"
              />
              <span className="help-text">
                {useDefault
                  ? 'Ưu tiên hạn mức nhà cung cấp trả về, sau đó dùng mặc định ước tính nếu có.'
                  : 'Hạn mức token mỗi phút do admin thiết lập.'}
              </span>
            </label>
          </details>
          {provider === 'DEEPSEEK' && (
            <p className="help-text">
              Lỗi hết số dư sẽ được ghi nhận và chuyển key. Hạn mức token mỗi phút phục vụ chuyển
              key nếu bạn thiết lập.
            </p>
          )}
        </div>
        {save.error && <ErrorState error={save.error} />}
        <div className="modal-actions">
          <Button variant="secondary" disabled={save.isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            busy={save.isPending}
            disabled={!name.trim() || (!entry.key && !secret.trim())}
          >
            {changed ? 'Kiểm tra và lưu' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
