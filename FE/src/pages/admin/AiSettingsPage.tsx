import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, isDemo } from '../../shared/api';
import { http } from '../../shared/api/httpClient';
import type {
  AiModelOption,
  AiModelOptions,
  AiProvider,
  AiSettings,
} from '../../shared/types/models';
import { AI_PROVIDER_INFO } from '../../shared/constants/aiProviders';
import {
  Button,
  ConfirmDialog,
  ErrorState,
  PageHeading,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { AiKeyManagement } from './AiKeyManagement';
import './AiSettingsPage.css';

export default function AiSettingsPage() {
  const settings = useQuery({
    queryKey: ['ai-settings'],
    queryFn: api.aiSettings,
    refetchInterval: 15_000,
    refetchOnWindowFocus: 'always',
  });
  const [chosen, setChosen] = useState<AiProvider | null>(null);
  const activeProvider = settings.data?.find(
    (setting) => setting.active || setting.activeModel,
  )?.provider;
  const provider: AiProvider = chosen ?? activeProvider ?? 'GEMINI';
  return (
    <>
      <PageHeading
        eyebrow="Trợ lý AI"
        title="Cấu hình nền tảng Chat AI"
        description="Quản lý kết nối, API key và hạn mức của chatbot."
      />
      <AiMetrics />
      {settings.isPending ? (
        <Skeleton count={1} />
      ) : settings.error ? (
        <ErrorState error={settings.error} retry={() => void settings.refetch()} />
      ) : (
        settings.data && (
          <>
            <div
              className="provider-grid ai-provider-grid"
              role="group"
              aria-label="Chọn nền tảng Chat AI"
            >
              {settings.data.map((setting) => (
                <button
                  type="button"
                  className={`card provider-card${setting.provider === provider ? ' selected' : ''}`}
                  key={setting.provider}
                  aria-pressed={setting.provider === provider}
                  onClick={() => setChosen(setting.provider)}
                >
                  <span className="flex items-center gap-4">
                    <span className="icon-tile">
                      <Icon name={AI_PROVIDER_INFO[setting.provider].icon} />
                    </span>
                    <span>
                      <h2 className="ai-provider-name">
                        {AI_PROVIDER_INFO[setting.provider].label}
                      </h2>
                      <span className="help-text block mt-2">
                        {setting.activeModel || setting.model || 'Chưa cấu hình model'}
                      </span>
                    </span>
                  </span>
                  {(setting.active || setting.activeModel) && (
                    <span className="badge badge-success">Đang dùng</span>
                  )}
                </button>
              ))}
            </div>
            <ProviderForm
              key={provider}
              setting={settings.data.find((setting) => setting.provider === provider)!}
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
    queryFn: () =>
      http<{ requests: number; failures: number; averageMillis: number }>(
        '/admin/ai-settings/metrics',
      ),
    refetchInterval: 30_000,
    enabled: !isDemo,
    retry: false,
  });
  return (
    <section className="ai-metrics" aria-label="Hoạt động chatbot">
      {metrics.data ? (
        <>
          <div>
            <span>Yêu cầu</span>
            <strong>{metrics.data.requests}</strong>
          </div>
          <div>
            <span>Lỗi</span>
            <strong>{metrics.data.failures}</strong>
          </div>
          <div>
            <span>Phản hồi trung bình</span>
            <strong>{metrics.data.averageMillis} ms</strong>
          </div>
        </>
      ) : (
        <p className="help-text">
          {metrics.isError ? 'Không thể tải số liệu.' : 'Chưa có số liệu.'}
        </p>
      )}
      <p className="help-text">Từ lần khởi động backend gần nhất.</p>
    </section>
  );
}

export function modelOptionLabel(
  option: AiModelOption,
  source: AiModelOptions['source'],
  rank: number,
) {
  const usage = [
    option.requestsPerDay != null
      ? `${option.requestsPerDay.toLocaleString('vi-VN')} lượt/ngày`
      : '',
    option.tokensPerMinute != null
      ? `${option.tokensPerMinute.toLocaleString('vi-VN')} token/phút`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const suffix = usage
    ? ` — ${source === 'ESTIMATE' ? '~' : ''}${usage}${source === 'ESTIMATE' ? ' (ước tính)' : ''}`
    : '';
  return `${rank}. ${option.id}${suffix}`;
}
const initialModel = (setting: AiSettings) =>
  setting.model || (!setting.id ? AI_PROVIDER_INFO[setting.provider].defaultModel : '');

function ProviderForm({ setting }: { setting: AiSettings }) {
  const provider = setting.provider;
  const info = AI_PROVIDER_INFO[provider];
  const client = useQueryClient();
  const { notify } = useToast();
  const [tab, setTab] = useState<'connection' | 'keys' | 'history'>('connection');
  const [baseline, setBaseline] = useState(setting);
  const [model, setModel] = useState(() => initialModel(setting));
  const [modelTouched, setModelTouched] = useState(false);
  const [activating, setActivating] = useState(false);
  const dirty = model.trim() !== initialModel(baseline);
  useEffect(() => {
    if (
      !dirty &&
      (setting.id !== baseline.id ||
        setting.active !== baseline.active ||
        setting.tested !== baseline.tested)
    ) {
      setBaseline(setting);
      setModel(initialModel(setting));
    }
  }, [setting, baseline.id, baseline.active, baseline.tested, dirty]);
  const modelOptions = useQuery({
    queryKey: ['ai-models', provider, baseline.id, 0],
    queryFn: () => api.aiModelOptions(provider),
    enabled: !!baseline.maskedKey,
    staleTime: 10 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const topModel = modelOptions.data?.models[0]?.id;
  useEffect(() => {
    if (!baseline.id && !modelTouched && topModel) setModel(topModel);
  }, [baseline.id, modelTouched, topModel]);
  const suggestedChoices = (modelOptions.data?.models || []).slice(0, 3).map((option, index) => ({
    value: option.id,
    label: modelOptionLabel(option, modelOptions.data!.source, index + 1),
  }));
  const hasSuggestedModel = suggestedChoices.some((choice) => choice.value === model);
  function refresh(saved?: AiSettings) {
    if (saved) {
      setBaseline(saved);
      setModel(saved.model);
      client.setQueryData<AiSettings[]>(['ai-settings'], (previous) =>
        previous?.map((item) =>
          item.provider === provider
            ? { ...saved, activeModel: saved.active ? saved.model : saved.maskedKey ? item.activeModel : undefined }
            : item,
        ),
      );
    }
    for (const key of [
      'ai-settings',
      'ai-key-management',
      'ai-quota',
      'ai-activity',
      'ai-notifications',
    ])
      void client.invalidateQueries({ queryKey: [key] });
  }
  const save = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      api.saveAiSettings({ provider, configId: baseline.id || undefined, model: model.trim() }),
    onSuccess: (saved) => {
      refresh(saved);
      notify('Đã lưu model. Hãy kiểm tra kết nối và kích hoạt để áp dụng.');
    },
  });
  const testConnection = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      api.testAiConnection({ provider, configId: baseline.id, model: baseline.model }),
    onSuccess: (data) => {
      refresh();
      notify(data.message);
    },
    onSettled: () => refresh(),
  });
  const activation = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () => api.activateProvider(provider, baseline.id),
    onSuccess: (data) => {
      client.setQueryData(['ai-settings'], data);
      setActivating(false);
      refresh();
      notify(`Đã chuyển Chat sang ${info.label}.`);
    },
  });
  const busy = save.isPending || testConnection.isPending || activation.isPending;
  const tabs = [
    { id: 'connection' as const, label: 'Kết nối' },
    {
      id: 'keys' as const,
      label: `API key (${(baseline.backupKeys?.length || 0) + (baseline.maskedKey ? 1 : 0)})`,
    },
    { id: 'history' as const, label: 'Nhật ký' },
  ];

  return (
    <section className="card panel ai-provider-workspace">
      <div className="ai-section-heading">
        <div>
          <h2 className="!text-xl">Cấu hình chi tiết — {info.label}</h2>
          <p className="help-text mt-2">
            {setting.active
              ? 'Cấu hình đang hoạt động'
              : 'Lưu, kiểm tra kết nối rồi kích hoạt cấu hình.'}
          </p>
        </div>
        {dirty && <span className="badge">Có thay đổi model chưa lưu</span>}
      </div>
      <div className="ai-model-context mt-5">
        <label className="form-field">
          Chat Model
          <select
            aria-label="Chat Model"
            required
            value={hasSuggestedModel ? model : ''}
            disabled={busy}
            onChange={(event) => {
              setModelTouched(true);
              setModel(event.target.value);
            }}
          >
            {!hasSuggestedModel && (
              <option value="" disabled>
                {suggestedChoices.length ? 'Chọn model gợi ý' : 'Chưa có danh sách model'}
              </option>
            )}
            {suggestedChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </label>
        <p className="help-text" aria-live="polite">
          {modelOptions.isFetching
            ? 'Đang tải danh sách model…'
            : modelOptions.error
              ? 'Không tải được danh sách model. Hãy bấm Tải danh sách model để thử lại.'
              : modelOptions.data
                ? `Top ${suggestedChoices.length} model có hạn mức miễn phí lớn nhất. ${modelOptions.data.note}`
                : 'Thêm API key để tải danh sách model.'}
        </p>
      </div>
      <div className="ai-settings-tabs" role="tablist" aria-label="Quản lý cấu hình AI">
        {tabs.map((item, index) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            id={`ai-tab-${provider}-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`ai-panel-${provider}-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
              else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = tabs.length - 1;
              else return;
              event.preventDefault();
              setTab(tabs[next].id);
              document.getElementById(`ai-tab-${provider}-${tabs[next].id}`)?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        className="ai-settings-panel"
        hidden={tab !== 'connection'}
        id={`ai-panel-${provider}-connection`}
        aria-labelledby={`ai-tab-${provider}-connection`}
      >
        <div className="ai-connection-summary">
          <div>
            <span className="help-text">Model đang hoạt động</span>
            <strong>
              {setting.activeModel || (setting.active ? setting.model : 'Chưa kích hoạt')}
            </strong>
          </div>
          <div>
            <span className="help-text">API key</span>
            <div>
              {baseline.maskedKey
                ? `${(baseline.backupKeys?.length || 0) + 1} key đã lưu`
                : 'Chưa có key'}{' '}
              <Button variant="ghost" onClick={() => setTab('keys')}>
                Quản lý key →
              </Button>
            </div>
          </div>
          <div>
            <span className="help-text">Tự chuyển key</span>
            <p>Ưu tiên key khác khi đạt 80% ước tính hoặc key đang dùng gặp lỗi.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap mt-5">
          <Button
            variant="secondary"
            disabled={busy || !baseline.maskedKey}
            onClick={() => void modelOptions.refetch()}
          >
            <Icon name="refresh" />
            Tải danh sách model
          </Button>
          <span className="help-text">Kho kiến thức RAG dùng cấu hình embedding riêng.</span>
        </div>
        <div className="ai-settings-footer mt-5">
          <Button
            variant="secondary"
            busy={testConnection.isPending}
            disabled={busy || dirty || !baseline.id}
            onClick={() => testConnection.mutate()}
          >
            Kiểm tra kết nối
          </Button>
          <Button
            busy={save.isPending}
            disabled={busy || !hasSuggestedModel || !baseline.maskedKey}
            onClick={() => save.mutate()}
          >
            Lưu cấu hình
          </Button>
          <Button
            variant="ai"
            disabled={busy || baseline.active || dirty || !baseline.tested}
            onClick={() => setActivating(true)}
          >
            {baseline.active ? 'Đang hoạt động' : 'Kích hoạt'}
          </Button>
        </div>
      </div>
      <div
        role="tabpanel"
        className="ai-settings-panel"
        hidden={tab !== 'keys'}
        id={`ai-panel-${provider}-keys`}
        aria-labelledby={`ai-tab-${provider}-keys`}
      >
        <AiKeyManagement
          provider={provider}
          configId={baseline.id || ''}
          model={model.trim()}
          disabled={busy || (!!baseline.id && dirty)}
          mode="keys"
          onSaved={refresh}
        />
      </div>
      <div
        role="tabpanel"
        className="ai-settings-panel"
        hidden={tab !== 'history'}
        id={`ai-panel-${provider}-history`}
        aria-labelledby={`ai-tab-${provider}-history`}
      >
        <AiKeyManagement
          provider={provider}
          configId={baseline.id || ''}
          model={model.trim()}
          disabled={busy}
          mode="history"
          onSaved={refresh}
        />
      </div>
      {save.error && <ErrorState error={save.error} />}
      {testConnection.error && <ErrorState error={testConnection.error} />}
      {activating && (
        <ConfirmDialog
          title={`Kích hoạt ${info.label}?`}
          message={`Yêu cầu Chat mới sẽ dùng model ${baseline.model} và danh sách key của nền tảng này.`}
          busy={activation.isPending}
          error={activation.error}
          onClose={() => {
            if (!activation.isPending) setActivating(false);
          }}
          onConfirm={() => activation.mutate()}
        />
      )}
    </section>
  );
}
