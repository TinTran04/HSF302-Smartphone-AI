import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, isDemo } from '../../shared/api';
import { http } from '../../shared/api/httpClient';
import type { AiBackupKey, AiSettings } from '../../shared/types/models';
import {
  Button,
  ConfirmDialog,
  Modal,
  ErrorState,
  PageHeading,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatDate } from '../../shared/utils/format';
import { reasonMessage } from '../../features/ai-chat/components/AdminAiKeyAlert';
import { AiQuotaSettings } from './AiQuotaSettings';
import './AiSettingsPage.css';
export default function AiSettingsPage() {
  const settings = useQuery({
    queryKey: ['ai-settings'],
    queryFn: api.aiSettings,
    refetchInterval: 15_000,
    refetchOnWindowFocus: 'always',
  });
  const provider = 'GEMINI';
  return (
    <>
      <PageHeading
        eyebrow="Trợ lý AI"
        title="Cấu hình Google Gemini"
        description="Lưu model và API key, kiểm tra kết nối, sau đó kích hoạt cho Chat."
      />
      <AiMetrics />
      {settings.isPending ? (
        <Skeleton count={1} />
      ) : settings.error ? (
        <ErrorState
          error={settings.error}
          retry={() => {
            void settings.refetch();
          }}
        />
      ) : (
        settings.data && (
          <>
            <div className="provider-grid">
              {settings.data.map((s) => (
                <div className="card provider-card selected" key={s.provider}>
                  <span className="flex items-center gap-4">
                    <span className="icon-tile">
                      <Icon name="auto_awesome" />
                    </span>
                    <span>
                      <h2 className="!text-xl">Google Gemini</h2>
                      <span className="help-text block mt-2">
                        {s.model || 'Chưa cấu hình model'}
                      </span>
                    </span>
                  </span>
                  {(s.active || s.activeModel) && (
                    <span className="badge badge-success">
                      Đang hoạt động: {s.activeModel || s.model}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <ProviderForm
              key={provider}
              setting={settings.data.find((s) => s.provider === provider)!}
            />
          </>
        )
      )}
    </>
  );
}
export function AiMetrics() {
  const metrics = useQuery({
    queryKey: ['ai-metrics'],
    queryFn: () => http<{ requests: number; failures: number; averageMillis: number }>('/admin/ai-settings/metrics'),
    refetchInterval: 30_000,
    enabled: !isDemo,
    retry: false,
  });
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2 className="!text-xl">Hoạt động chatbot</h2>
      <p className="help-text">Số liệu từ lần khởi động backend gần nhất. Cảnh báo key dự phòng được lưu trong thông báo quản trị.</p>
      {metrics.data ? (
        <p>Yêu cầu: <strong>{metrics.data.requests}</strong> · Lỗi: <strong>{metrics.data.failures}</strong> · Thời gian trung bình: <strong>{metrics.data.averageMillis} ms</strong></p>
      ) : <p className="help-text">{metrics.isError ? 'Không thể tải số liệu.' : 'Chưa có số liệu.'}</p>}
    </div>
  );
}
type BackupDraft = {
  id?: string;
  localId: string;
  name: string;
  apiKey?: string;
  maskedKey: string;
};
const toDraft = (setting: AiSettings): BackupDraft[] =>
  (setting.backupKeys ?? []).map((key) => ({
    id: key.id,
    localId: key.id,
    name: key.name,
    maskedKey: key.maskedKey,
  }));
const statusLabels: Record<AiBackupKey['lastStatus'], string> = {
  UNKNOWN: 'Chưa kiểm tra',
  WORKING: 'Hoạt động',
  KEY_ERROR: 'Lỗi key',
  PROVIDER_ERROR: 'Lỗi nhà cung cấp',
};
const defaultChatModel = 'gemini-3.6-flash';
const initialModel = (setting: AiSettings) => setting.model || (!setting.id ? defaultChatModel : '');
function ProviderForm({ setting }: { setting: AiSettings }) {
  const [baseline, setBaseline] = useState(setting);
  const [model, setModel] = useState(() => initialModel(setting));
  const [apiKey, setApiKey] = useState('');
  const [keys, setKeys] = useState(() => toDraft(setting));
  const [visible, setVisible] = useState(false);
  const [activate, setActivate] = useState<AiSettings | null>(null);
  const [editing, setEditing] = useState<BackupDraft | null>(null);
  const [deleting, setDeleting] = useState<BackupDraft | null>(null);
  const client = useQueryClient();
  const { notify } = useToast();
  const dirty =
    model.trim() !== initialModel(baseline) ||
    !!apiKey.trim() ||
    JSON.stringify(
      keys.map((key) => ({ id: key.id, name: key.name, apiKey: key.apiKey || '' })),
    ) !==
      JSON.stringify(toDraft(baseline).map((key) => ({ id: key.id, name: key.name, apiKey: '' })));
  useEffect(() => {
    if (!dirty && setting.id !== baseline.id) {
      setBaseline(setting);
      setModel(initialModel(setting));
      setKeys(toDraft(setting));
    }
  }, [setting, baseline.id, dirty]);
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ['ai-settings'] });
    void client.invalidateQueries({ queryKey: ['ai-quota'] });
    void client.invalidateQueries({ queryKey: ['ai-key-alert'] });
    void client.invalidateQueries({ queryKey: ['ai-notifications'] });
  };
  const save = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      api.saveAiSettings({
        provider: 'GEMINI',
        configId: baseline.id || undefined,
        model: model.trim(),
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        backupKeys: keys.map((key) => ({
          ...(key.id ? { id: key.id } : {}),
          name: key.name,
          ...(key.apiKey?.trim() ? { apiKey: key.apiKey.trim() } : {}),
        })),
      }),
    onSuccess: (saved) => {
      setApiKey('');
      setVisible(false);
      setBaseline(saved);
      setModel(saved.model);
      setKeys(toDraft(saved));
      client.setQueryData<AiSettings[]>(['ai-settings'], (previous) =>
        previous?.map((current) =>
          current.provider === saved.provider
            ? {
                ...saved,
                activeModel:
                  saved.activeModel ||
                  current.activeModel ||
                  (current.active ? current.model : undefined),
              }
            : current,
        ),
      );
      refresh();
      notify('Đã lưu cấu hình AI. Hãy kiểm tra kết nối rồi kích hoạt để áp dụng.');
    },
  });
  const test = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      api.testAiConnection({
        provider: 'GEMINI',
        model: baseline.model,
        configId: baseline.id || undefined,
      }),
    onSuccess: (data) => {
      refresh();
      notify(`${data.message} Hãy kích hoạt cấu hình để áp dụng.`);
    },
  });
  const individualTest = useMutation({
    meta: { toast: { success: false } },
    mutationFn: (keyId: string) => api.testBackupKey(baseline.id, keyId),
    onSettled: refresh,
    onSuccess: (data) =>
      notify(`${data.message} Kiểm tra toàn bộ kết nối rồi kích hoạt để áp dụng.`),
  });
  const activation = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () => api.activateProvider('GEMINI', activate?.id || undefined),
    onSuccess: (data) => {
      client.setQueryData(['ai-settings'], data);
      refresh();
      setActivate(null);
      notify('Đã kích hoạt cấu hình Google Gemini.');
    },
  });
  const busy = save.isPending || test.isPending || individualTest.isPending || activation.isPending;
  function moveKey(index: number, direction: number) {
    setKeys((current) => {
      const reordered = [...current];
      [reordered[index], reordered[index + direction]] = [
        reordered[index + direction],
        reordered[index],
      ];
      return reordered;
    });
    notify('Đã đổi ưu tiên trong bản nháp. Hãy lưu, kiểm tra kết nối rồi kích hoạt để áp dụng.');
  }
  return (
    <>
      <form
        className="card panel max-w-4xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) save.mutate();
        }}
      >
        <h2 className="!text-xl mb-7">Cấu hình chi tiết — Google Gemini</h2>
        <div className="form-grid">
          <label className="form-field">
            Chat Model
            <input
              required
              value={model}
              onChange={(event) => setModel(event.target.value)}
              disabled={busy}
              placeholder="Nhập mã model Gemini trong project của bạn"
            />
            <span className="help-text">
              {!baseline.id ? 'Mặc định gemini-3.6-flash; bạn có thể đổi model. ' : ''}
              Model hợp lệ được Backend và nhà cung cấp kiểm tra.
            </span>
          </label>
          <label className="form-field">
            API Key đã lưu
            <input
              type="password"
              value={setting.maskedKey}
              readOnly
              placeholder="Chưa lưu API Key"
            />
            <span className="help-text">Máy chủ chỉ trả về khóa đã được che.</span>
          </label>
          <label className="form-field col-span-full">
            API Key mới (để trống nếu giữ nguyên)
            <div className="password-field">
              <input
                type={visible ? 'text' : 'password'}
                autoComplete="off"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                disabled={busy}
                placeholder="Nhập khóa mới khi cần thay đổi"
              />
              <button
                className="icon-button"
                type="button"
                aria-label={visible ? 'Ẩn API Key mới' : 'Hiện API Key mới'}
                onClick={() => setVisible((value) => !value)}
              >
                <Icon name={visible ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>
        </div>
        <section className="mt-7" aria-label="Danh sách key dự phòng">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3>Key dự phòng ({keys.length}/10)</h3>
            <Button
              variant="secondary"
              disabled={busy || keys.length >= 10}
              onClick={() => setEditing({ localId: crypto.randomUUID(), name: '', maskedKey: '' })}
            >
              <Icon name="add" />
              Thêm key dự phòng
            </Button>
          </div>
          {keys.length === 0 && <p className="help-text">Chưa có key dự phòng.</p>}
          <ol className="ai-backup-list">
            {keys.map((key, index) => {
              const saved = setting.backupKeys?.find((savedKey) => savedKey.id === key.id);
              const pending = !key.id || !!key.apiKey;
              return (
                <li className="ai-backup-row" key={key.localId}>
                  <div className="ai-backup-summary">
                    <strong>
                      {index + 1}. {key.name}
                    </strong>
                    <span className="help-text">
                      {pending ? 'Key mới trong bản nháp' : key.maskedKey}
                    </span>
                    <span
                      className={`badge ${saved?.lastStatus === 'WORKING' && !pending ? 'badge-success' : ''}`}
                    >
                      {pending ? 'Chưa lưu' : statusLabels[saved?.lastStatus ?? 'UNKNOWN']}
                    </span>
                    {saved?.lastFailureReason && !pending && (
                      <span className="help-text">{reasonMessage(saved.lastFailureReason)}</span>
                    )}
                    {saved?.lastCheckedAt && !pending && (
                      <span className="help-text">
                        Kiểm tra lúc {formatDate(saved.lastCheckedAt)}
                      </span>
                    )}
                  </div>
                  <div className="ai-backup-actions">
                    <Button
                      variant="ghost"
                      aria-label={`Tăng ưu tiên ${key.name}`}
                      disabled={busy || index === 0}
                      onClick={() => moveKey(index, -1)}
                    >
                      <Icon name="arrow_upward" />
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Giảm ưu tiên ${key.name}`}
                      disabled={busy || index === keys.length - 1}
                      onClick={() => moveKey(index, 1)}
                    >
                      <Icon name="arrow_downward" />
                    </Button>
                    <Button
                      variant="secondary"
                      aria-label={`Kiểm tra ${key.name}`}
                      disabled={busy || dirty || !key.id || !baseline.id}
                      onClick={() => individualTest.mutate(key.id!)}
                    >
                      Kiểm tra
                    </Button>
                    <Button
                      variant="secondary"
                      aria-label={`Thay ${key.name}`}
                      disabled={busy}
                      onClick={() => setEditing(key)}
                    >
                      Thay
                    </Button>
                    <Button
                      variant="danger"
                      aria-label={`Xóa ${key.name}`}
                      disabled={busy}
                      onClick={() => setDeleting(key)}
                    >
                      Xóa
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
        <p className="help-text mt-4">
          Mỗi yêu cầu ưu tiên key chính, sau đó thử các key dự phòng theo thứ tự từ trên xuống với
          cùng model. Các key Gemini cùng project dùng chung quota.
        </p>
        {setting.activeModel && !setting.active && (
          <p className="notice mt-7">
            Model đang hoạt động: {setting.activeModel}. Cấu hình bên dưới chưa được kích hoạt.
          </p>
        )}
        <div className="notice mt-7">
          Model Gemini cho Chat và embedding được cấu hình riêng. Khi đổi Embedding Model, kiểm tra
          trạng thái tài liệu và lập chỉ mục lại nếu được yêu cầu.
        </div>
        {save.error && <ErrorState error={save.error} />}
        {test.error && <ErrorState error={test.error} />}
        {individualTest.error && <ErrorState error={individualTest.error} />}
        <div className="flex flex-wrap gap-3 justify-end mt-7">
          <Button
            variant="secondary"
            busy={test.isPending}
            disabled={busy || dirty || !setting.maskedKey}
            onClick={() => test.mutate()}
          >
            <Icon name="network_check" />
            Kiểm tra kết nối
          </Button>
          <Button type="submit" busy={save.isPending} disabled={busy || !model.trim()}>
            Lưu cấu hình
          </Button>
          <Button
            variant="ai"
            disabled={busy || setting.active || dirty || !setting.maskedKey || !setting.tested}
            onClick={() => setActivate({ ...setting, id: baseline.id, model: baseline.model })}
          >
            {setting.active ? 'Đang hoạt động' : 'Kích hoạt'}
          </Button>
        </div>
        {(dirty || !setting.tested) && (
          <p className="help-text text-right mt-4">
            {dirty
              ? 'Lưu thay đổi trước khi kiểm tra và kích hoạt.'
              : 'Kiểm tra kết nối các key đã lưu trước khi kích hoạt.'}
          </p>
        )}
      </form>
      <AiQuotaSettings configId={baseline.id || ''} />
      {editing && (
        <BackupKeyModal
          draft={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setKeys((current) =>
              current.some((key) => key.localId === updated.localId)
                ? current.map((key) => (key.localId === updated.localId ? updated : key))
                : [...current, updated],
            );
            setEditing(null);
            notify(
              'Đã cập nhật key trong bản nháp. Hãy lưu, kiểm tra kết nối rồi kích hoạt để áp dụng.',
            );
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`Xóa ${deleting.name}?`}
          message="Chỉ key này được xóa khỏi bản nháp. Hãy lưu, kiểm tra kết nối rồi kích hoạt cấu hình để áp dụng."
          label="Xóa key"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setKeys((current) => current.filter((key) => key.localId !== deleting.localId));
            setDeleting(null);
            notify('Đã xóa key khỏi bản nháp. Hãy lưu, kiểm tra kết nối rồi kích hoạt để áp dụng.');
          }}
        />
      )}
      {activate && (
        <ConfirmDialog
          title="Kích hoạt Google Gemini?"
          message={`Model ${activate.model} sẽ được sử dụng cho các yêu cầu Chat mới.`}
          onConfirm={() => activation.mutate()}
          onClose={() => {
            setActivate(null);
            activation.reset();
          }}
          busy={activation.isPending}
          error={activation.error}
        />
      )}
    </>
  );
}
function BackupKeyModal({
  draft,
  onSave,
  onClose,
}: {
  draft: BackupDraft;
  onSave: (key: BackupDraft) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(draft.name);
  const [secret, setSecret] = useState('');
  const [visible, setVisible] = useState(false);
  return (
    <Modal title={draft.name ? 'Thay key dự phòng' : 'Thêm key dự phòng'} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...draft, name: name.trim(), apiKey: secret.trim() || draft.apiKey });
        }}
      >
        <label className="form-field">
          Tên key
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ví dụ Project dự phòng"
          />
        </label>
        <label className="form-field mt-4">
          API key mới
          <div className="password-field">
            <input
              aria-label="API key mới"
              required={!draft.id && !draft.apiKey}
              type={visible ? 'text' : 'password'}
              autoComplete="off"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder={draft.id ? 'Để trống để giữ key đã lưu' : 'Nhập API key Gemini'}
            />
            <button
              type="button"
              className="icon-button"
              aria-label={visible ? 'Ẩn key dự phòng mới' : 'Hiện key dự phòng mới'}
              onClick={() => setVisible((value) => !value)}
            >
              <Icon name={visible ? 'visibility_off' : 'visibility'} />
            </button>
          </div>
        </label>
        <p className="help-text mt-4">
          Thay đổi được giữ trong bản nháp. Lưu cấu hình, kiểm tra kết nối rồi kích hoạt để áp dụng.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Quay lại
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || (!draft.id && !draft.apiKey && !secret.trim())}
          >
            Áp dụng vào bản nháp
          </Button>
        </div>
      </form>
    </Modal>
  );
}
