import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api';
import type { AiProvider, AiSettings } from '../../shared/types/models';
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
  const [provider, setProvider] = useState<AiProvider>('OPENAI');
  return (
    <>
      <PageHeading
        title="Cấu hình nhà cung cấp AI"
        description="Quản lý Chat Model và nhà cung cấp đang hoạt động."
      />
      {settings.isPending ? (
        <Skeleton count={2} />
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
                <button
                  className={`card provider-card ${provider === s.provider ? 'selected' : ''}`}
                  key={s.provider}
                  onClick={() => setProvider(s.provider)}
                  aria-pressed={provider === s.provider}
                >
                  <span className="flex items-center gap-4">
                    <span className="icon-tile">
                      <Icon name={s.provider === 'OPENAI' ? 'neurology' : 'auto_awesome'} />
                    </span>
                    <span>
                      <h2 className="!text-xl">
                        {s.provider === 'OPENAI' ? 'OpenAI' : 'Google Gemini'}
                      </h2>
                      <span className="help-text block mt-2">
                        {s.model || 'Chưa cấu hình model'}
                      </span>
                    </span>
                  </span>
                  {s.active && <span className="badge badge-success">Đang hoạt động</span>}
                </button>
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
  const [visible, setVisible] = useState(false);
  const [activate, setActivate] = useState(false);
  const client = useQueryClient();
  const { notify } = useToast();
  const body = () => ({
    provider: setting.provider,
    model: model.trim(),
    ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
  });
  const save = useMutation({
    mutationFn: () => api.saveAiSettings(body()),
    onSuccess: () => {
      setApiKey('');
      void client.invalidateQueries({ queryKey: ['ai-settings'] });
      notify('Đã lưu cấu hình AI.');
    },
  });
  const test = useMutation({
    mutationFn: () => api.testAiConnection(body()),
    onSuccess: (data) => notify(data.message),
  });
  const activation = useMutation({
    mutationFn: () => api.activateProvider(setting.provider),
    onSuccess: (data) => {
      client.setQueryData(['ai-settings'], data);
      setActivate(false);
      notify('Đã kích hoạt nhà cung cấp AI.');
    },
  });
  const busy = save.isPending || test.isPending || activation.isPending;
  const dirty = model !== setting.model || !!apiKey.trim();
  return (
    <>
      <form
        className="card panel max-w-4xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) save.mutate();
        }}
      >
        <h2 className="!text-xl mb-7">
          Cấu hình chi tiết — {setting.provider === 'OPENAI' ? 'OpenAI' : 'Google Gemini'}
        </h2>
        <div className="form-grid">
          <label className="form-field">
            Chat Model
            <input
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={busy}
              placeholder="Nhập model theo cấu hình Backend"
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
        </div>
        <div className="notice mt-7">
          Thay đổi nhà cung cấp Chat không tự thay đổi Embedding Model. Backend sẽ quyết định có cần
          lập chỉ mục lại tài liệu hay không.
        </div>
        {save.error && <ErrorState error={save.error} />}
        {test.error && <ErrorState error={test.error} />}
        <div className="flex flex-wrap gap-3 justify-end mt-7">
          <Button
            variant="secondary"
            busy={test.isPending}
            disabled={busy || !model.trim()}
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
            disabled={busy || setting.active || dirty || !setting.maskedKey}
            onClick={() => setActivate(true)}
          >
            {setting.active ? 'Đang hoạt động' : 'Kích hoạt'}
          </Button>
        </div>
        {dirty && !setting.active && (
          <p className="help-text text-right mt-4">Lưu thay đổi trước khi kích hoạt.</p>
        )}
      </form>
      {activate && (
        <ConfirmDialog
          title="Kích hoạt nhà cung cấp?"
          message={`Nhà cung cấp ${setting.provider} sẽ được sử dụng cho các yêu cầu Chat mới.`}
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
