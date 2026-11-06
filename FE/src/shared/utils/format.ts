import type { Role } from '../types/models';

export const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
export const formatSize = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
export const orderLabels = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};
export const knowledgeLabels = {
  PROCESSING: 'Đang xử lý',
  READY: 'Sẵn sàng',
  FAILED: 'Xử lý thất bại',
  DISABLED: 'Đã tắt',
};
export const productPrice = (p: { variants: { price: number; status: string }[] }) => {
  const active = p.variants.filter((v) => v.status === 'ACTIVE');
  const prices = (active.length ? active : p.variants).map((v) => v.price);
  return prices.length ? Math.min(...prices) : null;
};
export const safeReturnPath = (value: unknown, role?: Role) =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('\\') &&
  !(role === 'CUSTOMER' && /^\/admin(\/|\?|#|$)/i.test(value)) &&
  !(role === 'ADMIN' && !/^\/admin(\/|\?|#|$)/i.test(value)) &&
  !/^\/(login|register)(\/|\?|$)/.test(value)
    ? value
    : role === 'ADMIN' ? '/admin' : '/';
