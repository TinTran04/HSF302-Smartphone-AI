import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, isDemo } from '../../shared/api';
import type { KnowledgeDocument } from '../../shared/types/models';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeading,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { formatDate, formatSize, knowledgeLabels } from '../../shared/utils/format';
import { http } from '../../shared/api/httpClient';
type DocumentAction = 'reindex' | 'enable' | 'disable' | 'delete';
export default function KnowledgeBasePage() {
  const client = useQueryClient();
  const { notify } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const replacementInput = useRef<HTMLInputElement>(null);
  const [replacementId, setReplacementId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<{
    doc: KnowledgeDocument;
    action: DocumentAction;
  } | null>(null);
  const [validation, setValidation] = useState('');
  const query = useQuery({
    queryKey: ['knowledge'],
    queryFn: api.documents,
    refetchInterval: (q) =>
      !isDemo && q.state.data?.some((d) => d.status === 'PROCESSING') ? 5000 : false,
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ['knowledge'] });
    void client.invalidateQueries({ queryKey: ['admin-dashboard'] });
  };
  const upload = useMutation({
    mutationFn: api.uploadDocument,
    onSuccess: () => {
      refresh();
      notify(
        isDemo
          ? 'Đã nhận tài liệu mẫu. Chế độ demo không tạo embedding thực tế.'
          : 'Đã tải tài liệu lên. Hệ thống đang xử lý.',
      );
      if (input.current) input.current.value = '';
    },
  });
  const action = useMutation({
    mutationFn: () => api.documentAction(selected!.doc.id, selected!.action),
    onSuccess: () => {
      refresh();
      setSelected(null);
      notify('Đã cập nhật tài liệu.');
    },
  });
  const replace = useMutation({ mutationFn: async (file: File) => {
    const form = new FormData(); form.append('file', file);
    return http(`/admin/knowledge/documents/${replacementId}/content`, { method: 'PUT', body: form });
  }, onSuccess: () => { setReplacementId(null); refresh(); notify('Đã gửi nội dung mới để lập chỉ mục.'); } });
  function handleFile(file?: File) {
    if (!file || upload.isPending) return;
    if (!/\.(pdf|txt)$/i.test(file.name)) {
      setValidation('Vui lòng chọn tài liệu PDF hoặc TXT.');
      return;
    }
    if (!file.size) {
      setValidation('Tài liệu đang trống. Vui lòng chọn file khác.');
      return;
    }
    setValidation('');
    upload.mutate(file);
  }
  return (
    <>
      <PageHeading
        title="Kho kiến thức AI"
        description="Tải tài liệu chính thức để cung cấp dữ liệu tham khảo cho AI."
        action={
          <Button
            variant="secondary"
            busy={query.isFetching}
            onClick={() => {
              void query.refetch();
            }}
          >
            Làm mới
          </Button>
        }
      />
      <div
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Chọn tài liệu PDF hoặc TXT để tải lên"
        aria-disabled={upload.isPending}
        onClick={() => !upload.isPending && input.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!upload.isPending) input.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <span className="icon-tile !w-16 !h-16">
          <Icon
            name={upload.isPending ? 'progress_activity' : 'cloud_upload'}
            className={upload.isPending ? 'spin !text-3xl' : '!text-3xl'}
          />
        </span>
        <h2 className="!text-xl">
          {upload.isPending
            ? 'Đang tải tài liệu lên…'
            : 'Kéo thả tài liệu vào đây hoặc nhấn để chọn file'}
        </h2>
        <p className="help-text">
          Hỗ trợ PDF và TXT. Nội dung sẽ được Backend trích xuất và xử lý.
        </p>
      </div>
      <input
        hidden
        ref={input}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        aria-label="File tài liệu"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input hidden ref={replacementInput} type="file" accept=".pdf,.txt,application/pdf,text/plain" aria-label="Nội dung tài liệu thay thế" onChange={e => { const file = e.target.files?.[0]; if (file && replacementId) replace.mutate(file); e.target.value = ''; }} />
      {replace.error && <ErrorState error={replace.error} />}
      {validation && (
        <p className="field-error mt-4" role="alert">
          {validation}
        </p>
      )}
      {upload.error && <ErrorState error={upload.error} />}
      <section className="card panel mt-8">
        <h2 className="!text-xl mb-6">Tài liệu trong hệ thống</h2>
        {query.isPending ? (
          <Skeleton count={1} />
        ) : query.error ? (
          <ErrorState
            error={query.error}
            retry={() => {
              void query.refetch();
            }}
          />
        ) : !query.data?.length ? (
          <EmptyState
            title="Chưa có tài liệu"
            description="Thêm tài liệu để xây dựng kho kiến thức của cửa hàng."
            icon="description"
          />
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tài liệu</th>
                  <th>Ngày tải lên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <strong className="flex items-center gap-2">
                        <Icon name="description" className="text-secondary !text-lg" />
                        {doc.name}
                      </strong>
                      <p className="help-text mt-2">{formatSize(doc.size)}</p>
                    </td>
                    <td className="whitespace-nowrap">{formatDate(doc.uploadedAt)}</td>
                    <td>
                      <span
                        className={`badge badge-${{ READY: 'success', PROCESSING: 'ai', FAILED: 'error', DISABLED: '' }[doc.status]}`}
                      >
                        {knowledgeLabels[doc.status]}
                      </span>
                      {doc.status === 'PROCESSING' && (
                        <p className="help-text mt-2">Đang trích xuất và tạo Embedding</p>
                      )}
                      {doc.error && <p className="field-error mt-2">{doc.error}</p>}
                    </td>
                    <td>
                      <div className="actions">
                        {!isDemo && <button className="icon-button" title="Thay nội dung" aria-label={`Thay nội dung ${doc.name}`} onClick={() => { setReplacementId(doc.id); replacementInput.current?.click(); }}><Icon name="upload_file" className="!text-lg" /></button>}
                        {doc.status !== 'PROCESSING' && (
                          <button
                            className="icon-button"
                            title="Xử lý lại"
                            aria-label={`Xử lý lại ${doc.name}`}
                            onClick={() => setSelected({ doc, action: 'reindex' })}
                          >
                            <Icon name="refresh" className="!text-lg" />
                          </button>
                        )}
                        <button
                          className="icon-button"
                          title={doc.status === 'DISABLED' ? 'Bật tài liệu' : 'Tắt tài liệu'}
                          aria-label={`${doc.status === 'DISABLED' ? 'Bật' : 'Tắt'} ${doc.name}`}
                          onClick={() =>
                            setSelected({
                              doc,
                              action: doc.status === 'DISABLED' ? 'enable' : 'disable',
                            })
                          }
                        >
                          <Icon
                            name={doc.status === 'DISABLED' ? 'toggle_off' : 'toggle_on'}
                            className="!text-lg"
                          />
                        </button>
                        <button
                          className="icon-button text-red-600"
                          aria-label={`Xóa ${doc.name}`}
                          onClick={() => setSelected({ doc, action: 'delete' })}
                        >
                          <Icon name="delete" className="!text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selected && (
        <ConfirmDialog
          title={
            {
              delete: 'Xóa tài liệu?',
              reindex: 'Xử lý lại tài liệu?',
              enable: 'Bật tài liệu?',
              disable: 'Tắt tài liệu?',
            }[selected.action]
          }
          message={`Xác nhận thao tác với tài liệu “${selected.doc.name}”.`}
          onConfirm={() => action.mutate()}
          onClose={() => {
            setSelected(null);
            action.reset();
          }}
          busy={action.isPending}
          error={action.error}
        />
      )}
    </>
  );
}
