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
  const [provider, setProvider] = useState('OPENAI');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dimensions, setDimensions] = useState(1536);
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
      <PageHeading title={title} />
      {isDemo ? (
        <p className="notice">Chức năng này cần kết nối backend.</p>
      ) : (
        <>
          {query.error && <ErrorState error={query.error} />}
          {mutation.error && <ErrorState error={mutation.error} />}
          {section === 'brands' && (
            <div className="card panel">
              <form
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
                <div key={brand.id} className="flex gap-4 items-center mt-4">
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
            <div className="card panel">
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
              className="card panel"
              onSubmit={(e) => {
                e.preventDefault();
                act(
                  '/admin/embedding-settings',
                  'PUT',
                  {
                    provider,
                    model: model.trim(),
                    dimensions,
                    ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
                  },
                  'Đã kiểm tra và lưu cấu hình embedding.',
                );
              }}
            >
              <p>
                Hiện tại: {(query.data as { model?: string } | undefined)?.model || 'Chưa cấu hình'}
              </p>
              {(query.data as { reindexRequired?: boolean } | undefined)?.reindexRequired && (
                <p className="notice">Một số tài liệu cần được lập chỉ mục lại.</p>
              )}
              <label className="form-field">
                Nhà cung cấp
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option>OPENAI</option>
                  <option>GEMINI</option>
                </select>
              </label>
              <label className="form-field">
                Model
                <input required value={model} onChange={(e) => setModel(e.target.value)} />
              </label>
              <label className="form-field">
                Số chiều
                <input
                  required
                  type="number"
                  min={1}
                  max={4096}
                  value={dimensions}
                  onChange={(e) => setDimensions(Number(e.target.value))}
                />
              </label>
              <label className="form-field">
                API key mới
                <input
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </label>
              <Button type="submit" busy={mutation.isPending}>
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
