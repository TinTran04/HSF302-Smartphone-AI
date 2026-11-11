import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, jsonBody } from '../../shared/api/httpClient';
import { isDemo } from '../../shared/api';
import {
  Button,
  ConfirmDialog,
  ErrorState,
  Modal,
  PageHeading,
  useToast,
} from '../../shared/components/Ui';
import { errorMessage } from '../../shared/utils/format';
import type { Brand } from '../../shared/types/models';

const write = <T,>(url: string, method: string, body?: unknown) =>
  http<T>(url, { method, ...(body === undefined ? {} : { body: jsonBody(body) }) });
type Operation = { url: string; method: string; body?: unknown; message: string };
type Confirmation = { title: string; message: string; operation: Operation };
type EmbeddingSettings = {
  configured?: boolean;
  provider?: string;
  model?: string;
  dimensions?: number;
  maskedKey?: string;
  reindexRequired?: boolean;
};

export default function AdminOperationsPage({
  section,
}: {
  section: 'brands' | 'maintenance' | 'embedding';
}) {
  const client = useQueryClient();
  const { notify } = useToast();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editName, setEditName] = useState('');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const endpoint = {
    brands: '/admin/brands',
    maintenance: '/maintenance',
    embedding: '/admin/embedding-settings',
  }[section];
  const query = useQuery({
    queryKey: ['admin-ops', section],
    queryFn: () => http<unknown>(endpoint),
    enabled: !isDemo,
  });
  const embedding = query.data as EmbeddingSettings | undefined;
  const geminiEmbedding = embedding?.provider === 'GEMINI' ? embedding : undefined;
  const embeddingModel = geminiEmbedding?.model ?? 'gemini-embedding-001';
  const embeddingDimensions = geminiEmbedding?.dimensions ?? 768;
  const mutation = useMutation({
    meta: { toast: false },
    mutationFn: (request: Operation) => write<unknown>(request.url, request.method, request.body),
    onSuccess: (_, request) => {
      setConfirmation(null);
      setEditingBrand(null);
      notify(request.message);
      setName('');
      setApiKey('');
      void client.invalidateQueries({ queryKey: ['admin-ops', section] });
    },
    onError: (error) => notify(errorMessage(error), 'error'),
  });
  const act = (url: string, method: string, body: unknown, message: string) =>
    mutation.mutate({ url, method, body, message });
  const ask = (next: Confirmation) => {
    mutation.reset();
    setConfirmation(next);
  };
  const title = {
    brands: 'Quản lý thương hiệu',
    maintenance: 'Chế độ bảo trì',
    embedding: 'Cấu hình embedding',
  }[section];
  return (
    <>
      <PageHeading
        eyebrow={
          section === 'embedding' ? 'Trợ lý AI' : section === 'brands' ? 'Cửa hàng' : 'Hệ thống'
        }
        title={title}
        description={
          {
            brands: 'Sắp xếp danh mục thương hiệu để quản lý sản phẩm nhất quán.',
            maintenance: 'Theo dõi trạng thái cửa hàng và chủ động bật hoặc tắt chế độ bảo trì.',
            embedding: 'Model đã được thiết lập sẵn. Nhập API key Gemini để xử lý và truy xuất tài liệu.',
          }[section]
        }
      />
      {isDemo ? (
        <p className="notice">Chức năng này cần kết nối backend.</p>
      ) : (
        <>
          {query.error && <ErrorState error={query.error} />}
          {mutation.error && <ErrorState error={mutation.error} />}
          {section === 'brands' && (
            <div className="card panel admin-operations-panel">
              <form
                className="admin-brand-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  act('/admin/brands', 'POST', { name: name.trim() }, 'Đã thêm thương hiệu.');
                }}
              >
                <label className="form-field">
                  Tên thương hiệu
                  <input required value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <Button type="submit" busy={mutation.isPending}>
                  Thêm thương hiệu
                </Button>
              </form>
              {(query.data as Brand[] | undefined)?.map((brand) => (
                <div key={brand.id} className="admin-brand-row">
                  <span>{brand.name}</span>
                  <Button
                    variant="secondary"
                    disabled={mutation.isPending}
                    onClick={() => {
                      mutation.reset();
                      setEditingBrand(brand);
                      setEditName(brand.name);
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    disabled={mutation.isPending}
                    onClick={() =>
                      ask({
                        title: 'Xác nhận xóa thương hiệu',
                        message: `Xóa thương hiệu ${brand.name}?`,
                        operation: {
                          url: `/admin/brands/${brand.id}`,
                          method: 'DELETE',
                          message: 'Đã xóa thương hiệu.',
                        },
                      })
                    }
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}
          {section === 'maintenance' && (
            <div className="card panel admin-operations-panel">
              <p>
                Trạng thái:{' '}
                {(query.data as { enabled?: boolean } | undefined)?.enabled
                  ? 'Đang bảo trì'
                  : 'Đang hoạt động'}
              </p>
              <Button
                className="mt-4"
                disabled={!query.data || mutation.isPending}
                onClick={() => {
                  const enabled = !(query.data as { enabled: boolean }).enabled;
                  ask({
                    title: enabled ? 'Bật bảo trì' : 'Tắt bảo trì',
                    message: enabled
                      ? 'Tạm dừng chức năng cửa hàng để bảo trì?'
                      : 'Cho cửa hàng hoạt động trở lại?',
                    operation: {
                      url: '/admin/maintenance',
                      method: 'PUT',
                      body: { enabled },
                      message: enabled ? 'Đã bật bảo trì cửa hàng.' : 'Đã tắt bảo trì cửa hàng.',
                    },
                  });
                }}
              >
                {(query.data as { enabled?: boolean } | undefined)?.enabled
                  ? 'Tắt bảo trì'
                  : 'Bật bảo trì'}
              </Button>
            </div>
          )}
          {section === 'embedding' && (
            <form
              className="card panel admin-operations-panel admin-embedding-form"
              onSubmit={(e) => {
                e.preventDefault();
                act(
                  '/admin/embedding-settings',
                  'PUT',
                  {
                    provider: 'GEMINI',
                    ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
                  },
                  'Đã kiểm tra và lưu cấu hình embedding.',
                );
              }}
            >
              <p>{embedding?.configured ? 'Đã cấu hình embedding.' : 'Nhập API key để kích hoạt cấu hình embedding có sẵn.'}</p>
              {embedding?.reindexRequired && (
                <p className="notice">Một số tài liệu cần được lập chỉ mục lại.</p>
              )}
              <label className="form-field">
                Nhà cung cấp
                <input value="Google Gemini" readOnly />
              </label>
              <label className="form-field">
                Model
                <input
                  value={embeddingModel}
                  readOnly
                />
              </label>
              <label className="form-field">
                Số chiều
                <input
                  type="number"
                  value={embeddingDimensions}
                  readOnly
                />
              </label>
              <label className="form-field">
                API key đã lưu
                <input
                  type="password"
                  value={geminiEmbedding?.maskedKey || ''}
                  readOnly
                  placeholder="Chưa lưu API key Gemini"
                />
              </label>
              <label className="form-field">
                API key mới
                <input
                  aria-label="API key mới"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={query.isPending || mutation.isPending}
                  required={!geminiEmbedding?.maskedKey}
                />
                <span className="help-text">Để trống để giữ API key Gemini đã lưu.</span>
              </label>
              <p className="help-text mt-4">
                Model và số chiều đã được hệ thống thiết lập. Bạn chỉ cần nhập API key Gemini rồi
                kiểm tra và lưu. Sau đó xử lý lại các tài liệu đang báo thất bại.
              </p>
              <Button
                type="submit"
                busy={mutation.isPending}
                disabled={query.isPending || !!query.error || !embeddingModel.trim()}
              >
                Kiểm tra và lưu
              </Button>
            </form>
          )}
          {confirmation && (
            <ConfirmDialog
              title={confirmation.title}
              message={confirmation.message}
              busy={mutation.isPending}
              error={mutation.error}
              onConfirm={() => mutation.mutate(confirmation.operation)}
              onClose={() => {
                setConfirmation(null);
                mutation.reset();
              }}
            />
          )}
          {editingBrand && (
            <Modal
              title="Sửa thương hiệu"
              busy={mutation.isPending}
              onClose={() => {
                setEditingBrand(null);
                mutation.reset();
              }}
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  act(
                    `/admin/brands/${editingBrand.id}`,
                    'PUT',
                    { name: editName.trim() },
                    'Đã cập nhật thương hiệu.',
                  );
                }}
              >
                <label className="form-field">
                  Tên thương hiệu mới
                  <input
                    required
                    maxLength={255}
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                </label>
                {mutation.error && <ErrorState error={mutation.error} />}
                <div className="modal-actions">
                  <Button
                    variant="secondary"
                    disabled={mutation.isPending}
                    onClick={() => {
                      setEditingBrand(null);
                      mutation.reset();
                    }}
                  >
                    Quay lại
                  </Button>
                  <Button type="submit" busy={mutation.isPending}>
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </>
      )}
    </>
  );
}
