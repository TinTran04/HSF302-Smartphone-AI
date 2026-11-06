import { useEffect, useId, useRef, useState } from 'react';
import { api } from '../api';
import { errorMessage } from '../utils/format';
import { useToast } from './Ui';
import './ImageUpload.css';

export function validateProductImage(file: Pick<File, 'size' | 'type'>): string | undefined {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    return 'Vui lòng chọn ảnh PNG, JPEG hoặc WebP.';
  if (!file.size) return 'Ảnh đang trống. Vui lòng chọn file khác.';
  if (file.size > 5 * 1024 * 1024) return 'Mỗi ảnh tối đa 5 MB. Vui lòng chọn ảnh nhỏ hơn.';
  return undefined;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onUploadingChange,
  multiple = false,
  disabled = false,
  className = '',
}: {
  label: string;
  value: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const uploading = useRef(false);
  const previewUrls = useRef<string[]>([]);
  const current = useRef({ value, onChange, onUploadingChange, disabled });
  current.current = { value, onChange, onUploadingChange, disabled };
  const { notify } = useToast();

  function clearPreviews() {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current = [];
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearPreviews();
    };
  }, []);

  async function upload(files: File[]) {
    if (!files.length || uploading.current || current.current.disabled) return;
    const selected = multiple ? files : files.slice(0, 1);
    const invalid = selected.map((file) => validateProductImage(file)).find(Boolean);
    if (invalid) {
      setError(invalid);
      notify(invalid, 'error');
      return;
    }
    uploading.current = true;
    setPending(true);
    setError('');
    current.current.onUploadingChange?.(true);
    try {
      const nextPreviews = selected.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrls.current.push(url);
        return { url, name: file.name };
      });
      setPreviews(nextPreviews);
      const results = await Promise.allSettled(
        selected.map((file) => api.uploadProductImage(file)),
      );
      if (!mounted.current) return;
      const urls = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value.url] : [],
      );
      if (urls.length)
        current.current.onChange(multiple ? [...current.current.value, ...urls] : [urls[0]]);
      const failures = results.flatMap((result, index) =>
        result.status === 'rejected'
          ? [`${selected[index].name}: ${errorMessage(result.reason)}`]
          : [],
      );
      if (failures.length) {
        const message = failures.join(' ');
        setError(message);
        notify(message, 'error');
      } else notify(`Đã tải lên ${urls.length} ảnh.`);
    } catch (cause) {
      if (mounted.current) {
        const message = errorMessage(cause);
        setError(message);
        notify(message, 'error');
      }
    } finally {
      clearPreviews();
      uploading.current = false;
      if (mounted.current) {
        setPending(false);
        setPreviews([]);
        current.current.onUploadingChange?.(false);
      }
    }
  }

  return (
    <div className={`form-field image-upload ${className}`} aria-busy={pending}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple={multiple}
        disabled={disabled || pending}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          void upload(files);
        }}
      />
      <p id={`${id}-help`} className="help-text">
        PNG, JPEG hoặc WebP, tối đa 5 MB mỗi ảnh. Bấm Lưu sản phẩm để lưu thay đổi hình ảnh.
      </p>
      {(value.length > 0 || previews.length > 0) && (
        <div className="image-upload-previews">
          {value.map((url, index) => (
            <div className="image-upload-preview" key={`${url}-${index}`}>
              <img src={url} alt={`${label} ${index + 1}`} />
              <button
                type="button"
                className="button button-secondary"
                disabled={disabled || pending}
                aria-label={`Bỏ ảnh ${label} ${index + 1}`}
                onClick={() => onChange(value.filter((_, item) => item !== index))}
              >
                Bỏ ảnh
              </button>
            </div>
          ))}
          {previews.map((preview) => (
            <div className="image-upload-preview image-upload-pending" key={preview.url}>
              <img src={preview.url} alt={`${preview.name} đang tải`} />
              <span className="help-text">Đang tải…</span>
            </div>
          ))}
        </div>
      )}
      {pending && (
        <p className="help-text" role="status">
          Đang tải ảnh lên…
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
