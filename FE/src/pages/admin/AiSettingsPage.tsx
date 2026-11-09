import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import type { AiSettings } from '../../shared/types/models';
import {
  Button,
  ConfirmDialog,
  ErrorState,
  PageHeading,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
export default function AiSettingsPage() {
  const settings = useQuery({ queryKey: ['ai-settings'], queryFn: api.aiSettings });
  const provider = 'GEMINI';
  return (
    <>
      <PageHeading
        eyebrow="Trợ lý AI"
        title="Cấu hình Google Gemini"
        description="Lưu model và API key, kiểm tra kết nối, sau đó kích hoạt cho Chat."
      />
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
function ProviderForm({ setting }: { setting: AiSettings }) {
  const [model, setModel] = useState(setting.model);
  const [apiKey, setApiKey] = useState('');
  const [backupApiKey, setBackupApiKey] = useState('');
  const [removeBackupKey, setRemoveBackupKey] = useState(false);
  const [backupVisible, setBackupVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activate, setActivate] = useState(false);
  const client = useQueryClient();
  const { notify } = useToast();
  const body = () => ({
    provider: setting.provider,
    model: model.trim(),
    ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
    ...(backupApiKey.trim() ? { backupApiKey: backupApiKey.trim() } : {}),
    ...(removeBackupKey ? { removeBackupKey: true } : {}),
  });
  const save = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () => api.saveAiSettings(body()),
    onSuccess: (saved) => {
      setApiKey('');
      setBackupApiKey('');
      setRemoveBackupKey(false);
      client.setQueryData<AiSettings[]>(['ai-settings'], (previous) =>
        previous?.map((current) =>
          current.provider === saved.provider
            ? {
                ...saved,
                activeModel: current.activeModel || (current.active ? current.model : undefined),
              }
            : current,
        ),
      );
      void client.invalidateQueries({ queryKey: ['ai-settings'] });
      notify('Đã lưu cấu hình AI.');
    },
  });
  const test = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () => api.testAiConnection(body()),
    onSuccess: (data) => {
      void client.invalidateQueries({ queryKey: ['ai-settings'] });
      notify(data.message);
    },
  });
  const activation = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () => api.activateProvider(setting.provider),
    onSuccess: (data) => {
      client.setQueryData(['ai-settings'], data);
      setActivate(false);
      notify('Đã kích hoạt nhà cung cấp AI.');
    },
  });
  const busy = save.isPending || test.isPending || activation.isPending;
  const dirty =
    model.trim() !== setting.model || !!apiKey.trim() || !!backupApiKey.trim() || removeBackupKey;
  return (
    <>
      <form
        className="card panel max-w-4xl"
        onSubmit={(e) => {
          e.preventDefault();
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
              onChange={(e) => setModel(e.target.value)}
              disabled={busy}
              placeholder="Nhập mã model Gemini trong project của bạn"
            />
            <span className="help-text">Model hợp lệ được Backend và nhà cung cấp kiểm tra.</span>
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
                onChange={(e) => setApiKey(e.target.value)}
                disabled={busy}
                placeholder="Nhập khóa mới khi cần thay đổi"
              />
              <button
                className="icon-button"
                type="button"
                aria-label={visible ? 'Ẩn API Key mới' : 'Hiện API Key mới'}
                onClick={() => setVisible((v) => !v)}
              >
                <Icon name={visible ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>
          <label className="form-field">
            API Key dự phòng đã lưu
            <input
              aria-label="API Key dự phòng đã lưu"
              type="password"
              value={setting.maskedBackupKey || ''}
              readOnly
              placeholder="Chưa có key dự phòng"
            />
          </label>
          <label className="form-field">
            API Key dự phòng mới
            <div className="password-field">
              <input
                aria-label="API Key dự phòng mới"
                type={backupVisible ? 'text' : 'password'}
                autoComplete="off"
                value={backupApiKey}
                onChange={(e) => setBackupApiKey(e.target.value)}
                disabled={busy || removeBackupKey}
                placeholder="Để trống để giữ key đã lưu"
              />
              <button
                className="icon-button"
                type="button"
                aria-label={backupVisible ? 'Ẩn API Key dự phòng' : 'Hiện API Key dự phòng'}
                onClick={() => setBackupVisible((value) => !value)}
              >
                <Icon name={backupVisible ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>
          {setting.maskedBackupKey && (
            <label className="col-span-full flex items-center gap-3">
              <input
                type="checkbox"
                checked={removeBackupKey}
                disabled={busy}
                onChange={(e) => {
                  setRemoveBackupKey(e.target.checked);
                  setBackupApiKey('');
                }}
              />
              Xóa API Key dự phòng khi lưu
            </label>
          )}
        </div>
        <p className="help-text mt-4">
          Mỗi yêu cầu ưu tiên key chính. Khi nhà cung cấp trả lỗi 429 do quota hoặc giới hạn sử
          dụng, hệ thống thử key dự phòng một lần với cùng model. Các key Gemini cùng project dùng
          chung quota.
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
            onClick={() => setActivate(true)}
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
      {activate && (
        <ConfirmDialog
          title="Kích hoạt Google Gemini?"
          message={`Model ${setting.model} sẽ được sử dụng cho các yêu cầu Chat mới.`}
          onConfirm={() => activation.mutate()}
          onClose={() => {
            setActivate(false);
            activation.reset();
          }}
          busy={activation.isPending}
          error={activation.error}
        />
      )}
    </>
  );
}
