import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isDemo } from '../../shared/api';
import { http, jsonBody } from '../../shared/api/httpClient';
import { Button, ErrorState, Skeleton, useToast } from '../../shared/components/Ui';

type QuotaKey = {
  keyRef: string;
  name: string;
  maskedKey: string;
  projectName: string | null;
  tpmLimit: number | null;
  estimatedInputTokens: number;
};
type QuotaSettings = { configId: string; model: string; keys: QuotaKey[] };
type QuotaDraft = { keyRef: string; projectName: string; tpmLimit: string };

export function quotaPayload(configId: string, drafts: QuotaDraft[]) {
  const id = Number(configId);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Hãy tải lại cấu hình Gemini.');
  const limits = new Map<string, number>();
  const keys = drafts.map((draft) => {
    const projectName = draft.projectName.trim().toLowerCase() || null;
    if (projectName && !/^[a-z0-9][a-z0-9._-]{0,99}$/.test(projectName))
      throw new Error(
        'Project ID có tối đa 100 ký tự, bắt đầu bằng chữ hoặc số, và chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch nối.',
      );
    const tpmLimit = draft.tpmLimit.trim() ? Number(draft.tpmLimit) : null;
    if (
      tpmLimit !== null &&
      (!Number.isSafeInteger(tpmLimit) || tpmLimit <= 0 || tpmLimit > 1_000_000_000)
    )
      throw new Error('Giới hạn input TPM phải là số nguyên từ 1 đến 1.000.000.000.');
    if ((projectName === null) !== (tpmLimit === null))
      throw new Error('Nhập cả Project ID và giới hạn input TPM, hoặc xóa cả hai.');
    if (projectName && tpmLimit !== null) {
      const previous = limits.get(projectName);
      if (previous !== undefined && previous !== tpmLimit)
        throw new Error('Các key cùng Project ID phải dùng cùng giới hạn input TPM.');
      limits.set(projectName, tpmLimit);
    }
    return { keyRef: draft.keyRef, projectName, tpmLimit };
  });
  return { configId: id, keys };
}

export function AiQuotaSettings({ configId }: { configId: string }) {
  const query = useQuery({
    queryKey: ['ai-quota'],
    queryFn: () => http<QuotaSettings>('/admin/ai-settings/quota'),
    enabled: !isDemo && !!configId,
    refetchInterval: 15_000,
  });
  return (
    <section className="card panel max-w-4xl mt-7" aria-label="Quota Gemini theo project">
      <h2 className="!text-xl">Tự chuyển key theo quota project</h2>
      <p className="help-text mt-4">
        Các key Gemini cùng Google Cloud Project ID dùng chung quota cho model. Nhập giới hạn input
        tokens/phút (TPM) của project cho model đang dùng. Hệ thống ưu tiên chuyển sang project khác
        khi mức sử dụng ước tính đạt 80% giới hạn.
      </p>
      <p className="help-text mt-4">
        Mức sử dụng là ước tính input token của Chat trong 60 giây gần nhất do backend này ghi nhận,
        theo từng project và model. Embedding và lưu lượng từ ứng dụng khác cần đối chiếu riêng.
        Giới hạn RPM/RPD và số liệu quota thực tế của Google có thể khác. Để trống cả hai trường để
        bỏ cấu hình quota của key.{' '}
        <a href="https://aistudio.google.com/usage" target="_blank" rel="noreferrer">
          Xem mức sử dụng trên Google AI Studio
        </a>
      </p>
      {isDemo ? (
        <p className="notice mt-4">Chức năng này cần kết nối backend.</p>
      ) : !configId ? (
        <p className="notice mt-4">Lưu cấu hình Gemini và các key trước khi thiết lập quota.</p>
      ) : query.isPending ? (
        <Skeleton count={1} />
      ) : query.error ? (
        <ErrorState
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : query.data && query.data.configId !== configId ? (
        <p className="notice mt-4">
          Cấu hình Gemini đã thay đổi. Tải lại cấu hình trước khi sửa quota.
        </p>
      ) : query.data ? (
        <QuotaForm key={configId} settings={query.data} />
      ) : null}
    </section>
  );
}

function QuotaForm({ settings }: { settings: QuotaSettings }) {
  const [drafts, setDrafts] = useState<QuotaDraft[]>(() =>
    settings.keys.map((key) => ({
      keyRef: key.keyRef,
      projectName: key.projectName ?? '',
      tpmLimit: key.tpmLimit?.toString() ?? '',
    })),
  );
  const client = useQueryClient();
  const { notify } = useToast();
  const save = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      http<QuotaSettings>('/admin/ai-settings/quota', {
        method: 'PUT',
        body: jsonBody(quotaPayload(settings.configId, drafts)),
      }),
    onSuccess: (saved) => {
      client.setQueryData(['ai-quota'], saved);
      void client.invalidateQueries({ queryKey: ['ai-quota'] });
      notify('Đã lưu quota project cho các key Gemini.');
    },
  });
  const update = (keyRef: string, field: 'projectName' | 'tpmLimit', value: string) => {
    setDrafts((current) =>
      current.map((draft) => (draft.keyRef === keyRef ? { ...draft, [field]: value } : draft)),
    );
  };
  const keySetChanged =
    settings.keys.length !== drafts.length ||
    settings.keys.some((key) => !drafts.some((draft) => draft.keyRef === key.keyRef));
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!save.isPending && !keySetChanged) save.mutate();
      }}
    >
      <p className="help-text mt-4">Model {settings.model}</p>
      <div className="ai-backup-list mt-4">
        {drafts.map((draft) => {
          const key = settings.keys.find((current) => current.keyRef === draft.keyRef);
          if (!key) return null;
          return (
            <fieldset
              className="ai-backup-row min-w-0"
              key={key.keyRef}
              disabled={save.isPending || keySetChanged}
            >
              <legend>{key.name}</legend>
              <div className="ai-backup-summary">
                <span className="help-text">{key.maskedKey}</span>
                <span className="help-text">
                  Ước tính input trong 60 giây · {key.estimatedInputTokens} token
                </span>
                {(!key.projectName || !key.tpmLimit) && (
                  <span className="help-text">Chưa thiết lập dự toán quota</span>
                )}
              </div>
              <div className="form-grid flex-1 min-w-0">
                <label className="form-field">
                  Project ID · {key.name}
                  <input
                    maxLength={100}
                    value={draft.projectName}
                    onChange={(event) => update(key.keyRef, 'projectName', event.target.value)}
                    placeholder="my-google-cloud-project"
                  />
                </label>
                <label className="form-field">
                  Input TPM · {key.name}
                  <input
                    type="number"
                    min="1"
                    step="1"
                    max={1_000_000_000}
                    value={draft.tpmLimit}
                    onChange={(event) => update(key.keyRef, 'tpmLimit', event.target.value)}
                    placeholder="Ví dụ 1000000"
                  />
                </label>
              </div>
            </fieldset>
          );
        })}
      </div>
      {keySetChanged && (
        <p className="notice mt-4">Danh sách key đã thay đổi. Tải lại cấu hình để sửa quota.</p>
      )}
      {save.error && <ErrorState error={save.error} />}
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          busy={save.isPending}
          disabled={save.isPending || keySetChanged || drafts.length === 0}
        >
          Lưu quota
        </Button>
      </div>
    </form>
  );
}
