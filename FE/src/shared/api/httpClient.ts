export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
let csrfRequest: Promise<void> | undefined;
async function ensureCsrf() {
  if (document.cookie.split('; ').some(c => c.startsWith('XSRF-TOKEN='))) return;
  csrfRequest ??= fetch(`${baseUrl}/auth/csrf`, { credentials: 'include' }).then(response => {
    if (!response.ok) throw new ApiError(response.status, 'Không thể lấy mã xác thực bảo mật.');
  }).finally(() => { csrfRequest = undefined; });
  await csrfRequest;
}
export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (options.method && !['GET', 'HEAD'].includes(options.method)) {
    await ensureCsrf();
    const csrf = document.cookie
      .split('; ')
      .find((c) => c.startsWith('XSRF-TOKEN='))
      ?.slice('XSRF-TOKEN='.length);
    if (csrf) headers.set('X-XSRF-TOKEN', decodeURIComponent(csrf));
  }
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers,
      signal: options.signal ?? AbortSignal.timeout(30000),
    });
  } catch {
    throw new ApiError(0, 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
  }
  const data = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok)
    throw new ApiError(
      response.status,
      data?.message ||
        data?.detail ||
        {
          401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          403: 'Bạn không có quyền thực hiện thao tác này.',
          404: 'Không tìm thấy dữ liệu.',
          409: 'Dữ liệu vừa thay đổi. Vui lòng tải lại.',
          429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
        }[response.status] ||
        'Máy chủ gặp lỗi. Vui lòng thử lại.',
      data?.code,
      data,
    );
  return data as T;
}
export const jsonBody = (body: unknown): string => JSON.stringify(body);
