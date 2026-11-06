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
let refreshRequest: Promise<void> | undefined;
let refreshGeneration = 0;
let authGeneration = 0;
let cookieQueue = Promise.resolve();
export const AUTH_CONTEXT_STORAGE_KEY = 'smartphone-ai-auth-context';
let expectedAccountId: string | null = null;
export function setAuthAccount(id: string | null) {
  expectedAccountId = id;
}
const cookieChangingPaths = new Set([
  '/auth/login',
  '/auth/otp/verify',
  '/auth/logout',
  '/users/me/password',
]);

function authContext() {
  let shared = '';
  try {
    shared = localStorage.getItem(AUTH_CONTEXT_STORAGE_KEY) ?? '';
  } catch {
    /* Storage can be unavailable. */
  }
  return `${authGeneration}:${shared}`;
}

function checkAuthContext(context: string) {
  if (context !== authContext())
    throw new ApiError(
      401,
      'Tài khoản đăng nhập đã thay đổi. Vui lòng thực hiện lại thao tác.',
      'AUTH_CONTEXT_CHANGED',
    );
}

function changeAuthContext() {
  authGeneration++;
  try {
    localStorage.setItem(AUTH_CONTEXT_STORAGE_KEY, crypto.randomUUID());
  } catch {
    /* Keep the in-tab guard active. */
  }
}

async function withCookieLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks)
    return await navigator.locks.request('smartphone-ai-refresh', operation);
  const previous = cookieQueue;
  let release!: () => void;
  cookieQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
}
async function ensureCsrf() {
  if (document.cookie.split('; ').some((c) => c.startsWith('XSRF-TOKEN='))) return;
  csrfRequest ??= fetch(`${baseUrl}/auth/csrf`, { credentials: 'include' })
    .then((response) => {
      if (!response.ok) throw new ApiError(response.status, 'Không thể lấy mã xác thực bảo mật.');
    })
    .finally(() => {
      csrfRequest = undefined;
    });
  await csrfRequest;
}
function addCsrfHeader(headers: Headers) {
  const csrf = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
    ?.slice('XSRF-TOKEN='.length);
  if (csrf) headers.set('X-XSRF-TOKEN', decodeURIComponent(csrf));
}

async function send(path: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: 'include',
      signal: options.signal ?? AbortSignal.timeout(30000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError')
      throw new ApiError(
        0,
        'Máy chủ xử lý quá thời gian chờ. Vui lòng thử lại sau.',
        'REQUEST_TIMEOUT',
      );
    throw new ApiError(0, 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
  }
}

function renewAccessCookie(generation: number, context: string): Promise<void> {
  checkAuthContext(context);
  if (generation !== refreshGeneration) return Promise.resolve();
  if (!refreshRequest) {
    const renew = async () => {
      checkAuthContext(context);
      if (generation !== refreshGeneration) return;
      await ensureCsrf();
      const headers = new Headers({ Accept: 'application/json' });
      addCsrfHeader(headers);
      checkAuthContext(context);
      const response = await send('/auth/refresh', { method: 'POST', headers });
      checkAuthContext(context);
      if (!response.ok) {
        const data = await response.json().catch(() => undefined);
        throw new ApiError(
          response.status,
          data?.message ?? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          data?.code,
        );
      }
      refreshGeneration++;
    };
    refreshRequest = withCookieLock(renew).finally(() => {
      refreshRequest = undefined;
    });
  }
  return refreshRequest;
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const generation = refreshGeneration;
  const context = authContext();
  let resultContext = context;
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  const identityLookup = path === '/users/me' && (!options.method || options.method === 'GET');
  if (expectedAccountId && !path.startsWith('/auth/') && path !== '/maintenance' && !identityLookup)
    headers.set('X-Account-Id', expectedAccountId);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (options.method && !['GET', 'HEAD'].includes(options.method)) {
    await ensureCsrf();
    addCsrfHeader(headers);
  }
  const request = { ...options, headers };
  const sendRequest = async () => {
    checkAuthContext(context);
    const response = await send(path, request);
    checkAuthContext(context);
    if (
      response.ok &&
      cookieChangingPaths.has(path) &&
      (response.status === 200 || path === '/auth/logout' || path === '/users/me/password')
    ) {
      refreshGeneration++;
      if (path === '/auth/logout' || (response.status === 200 && path !== '/users/me/password'))
        changeAuthContext();
      resultContext = authContext();
    }
    return response;
  };
  const perform = () =>
    cookieChangingPaths.has(path) ? withCookieLock(sendRequest) : sendRequest();
  let response = await perform();
  if (response.status === 401 && !path.startsWith('/auth/') && !options.signal?.aborted) {
    let renewed = false;
    try {
      await renewAccessCookie(generation, context);
      renewed = true;
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 401 ||
        error.code === 'AUTH_CONTEXT_CHANGED'
      )
        throw error;
    }
    if (renewed) {
      if (options.method && !['GET', 'HEAD'].includes(options.method)) {
        await ensureCsrf();
        addCsrfHeader(headers);
      }
      response = await perform();
    }
  }
  const data = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  checkAuthContext(resultContext);
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
