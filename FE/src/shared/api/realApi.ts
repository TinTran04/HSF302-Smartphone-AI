import type { Api } from './contracts';
import { ApiError, http, jsonBody } from './httpClient';
import type { Cart, CartEntry, CartItem, Product, Order, OrderPreview } from '../types/models';

type ServerCart = { items: (CartEntry & { product: Product | null; variant: CartItem['variant'] | null; unavailable: boolean; priceAtAdd: number })[]; total: number };
function mapCart(cart: ServerCart): Cart {
  return { total: cart.total, unavailableVariantIds: cart.items.filter(i => i.unavailable).map(i => i.variantId),
    items: cart.items.filter(i => !i.unavailable && i.product && i.variant) as CartItem[] };
}
type ServerOrder = Omit<Order, 'items'> & { items: { variantId: string; productName: string; color: string; storage: string; quantity: number; unitPrice: number }[] };
function mapOrder(order: ServerOrder): Order {
  return { ...order, items: order.items.map(i => ({ variantId: i.variantId, quantity: i.quantity,
    product: { id: '', name: i.productName, brandId: '', brandName: '', description: '', images: [], specifications: {}, variants: [], status: 'INACTIVE' },
    variant: { id: i.variantId, color: i.color, colorHex: '', storage: i.storage, price: i.unitPrice, status: 'INACTIVE' } })) };
}
const post = <T>(path: string, body?: unknown) =>
  http<T>(path, { method: 'POST', body: body === undefined ? undefined : jsonBody(body) });
const tokenKey = 'smartphone-ai-guest-session';
let guestSessionRequest: Promise<string> | undefined;
export function guestToken() { return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(tokenKey); }
export function clearGuestToken() { sessionStorage.removeItem(tokenKey); }
async function chatHeaders() {
  let token = guestToken();
  if (!token) {
    guestSessionRequest ??= post<{guestSessionToken:string}>('/ai/guest-sessions').then(result => {
      sessionStorage.setItem(tokenKey, result.guestSessionToken);
      return result.guestSessionToken;
    }).finally(() => { guestSessionRequest = undefined; });
    token = await guestSessionRequest;
  }
  return { 'X-Guest-Session': token };
}
function authHeaders(): Record<string, string> { const token = guestToken(); return token ? { 'X-Guest-Session': token } : {}; }
async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const token = guestToken();
  try { return await http<T>(path, { method: 'POST', headers: authHeaders(), body: jsonBody(body) }); }
  catch (error) {
    if (!token || !(error instanceof ApiError) || error.status !== 401 || error.code !== 'UNAUTHORIZED') throw error;
    clearGuestToken();
    return http<T>(path, { method: 'POST', headers: {}, body: jsonBody(body) });
  }
}
async function chatRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  try { return await http<T>(path, { ...options, headers: await chatHeaders() }); }
  catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || error.code !== 'UNAUTHORIZED') throw error;
    clearGuestToken();
    return http<T>(path, { ...options, headers: await chatHeaders() });
  }
}
export const realAuth = {
  verify: (challengeId: string, code: string, guestCart: CartEntry[]) => authRequest<{user: import('../types/models').User}>('/auth/otp/verify', { challengeId, code, guestCart }),
  resend: (challengeId: string) => post('/auth/otp/resend', { challengeId }),
  reset: (email: string) => post<{challengeId:string}>('/auth/password-reset', { email }),
  resetConfirm: (challengeId: string, code: string, newPassword: string) => post('/auth/password-reset/confirm', { challengeId, code, newPassword }),
  acceptInvitation: (token: string, password: string) => post('/auth/admin-invitations/accept', { token, password }),
};
export const realApi: Api = {
  me: async () => {
    try {
      return await http('/users/me');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },
  login: async (data) => {
    const result = await authRequest<{user?: import('../types/models').User; challengeId?: string; expiresAt?: string; resendAfter?: string}>('/auth/login', { identifier: data.email, password: data.password });
    return result.user ?? { challengeId: result.challengeId!, expiresAt: result.expiresAt, resendAfter: result.resendAfter };
  },
  register: (data) => post('/auth/register', { email: data.email, password: data.password, fullName: data.fullName, phone: data.phone }),
  logout: () => post('/auth/logout'),
  updateProfile: (data) => http('/users/me', { method: 'PUT', body: jsonBody(data) }),
  products: (params = new URLSearchParams(), admin = false) =>
    http(`/${admin ? 'admin/' : ''}products?${params}`),
  product: (id, admin = false) =>
    http(`/${admin ? 'admin/' : ''}products/${encodeURIComponent(id)}`),
  brands: () => http('/brands'),
  cart: async () => mapCart(await http<ServerCart>('/cart')),
  resolveCart: async (entries) => entries.length ? mapCart(await post<ServerCart>('/cart/resolve', { items: entries })) : { items: [], unavailableVariantIds: [], total: 0 },
  addCart: async (entry) => mapCart(await post<ServerCart>('/cart/items', entry)),
  updateCart: (id, quantity) =>
    http<ServerCart>(`/cart/items/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: jsonBody({ quantity }),
    }).then(mapCart),
  removeCart: (id) => http<ServerCart>(`/cart/items/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(mapCart),
  previewOrder: (shipping, variantIds) => post<OrderPreview>('/orders/preview', { variantIds, shipping, paymentMethod: 'COD' }),
  placeOrder: (data, key) =>
    http<ServerOrder>('/orders', { method: 'POST', body: jsonBody(data), headers: { 'Idempotency-Key': key } }).then(mapOrder),
  orders: (admin = false) => http<ServerOrder[]>(`/${admin ? 'admin/' : ''}orders`).then(items => items.map(mapOrder)),
  order: (id, admin = false) => http<ServerOrder>(`/${admin ? 'admin/' : ''}orders/${encodeURIComponent(id)}`).then(mapOrder),
  cancelOrder: (id) => post<ServerOrder>(`/orders/${encodeURIComponent(id)}/cancel`).then(mapOrder),
  updateOrderStatus: (id, status) =>
    http<ServerOrder>(`/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: jsonBody({ status }),
    }).then(mapOrder),
  conversations: () => chatRequest('/ai/conversations'),
  createConversation: async (topic, context) => {
    const result = await chatRequest<{ conversationId: string }>('/ai/conversations', { method: 'POST', body: jsonBody({
      topic,
      ...context,
    }) });
    return chatRequest(`/ai/conversations/${encodeURIComponent(result.conversationId)}`);
  },
  conversation: (id) => chatRequest(`/ai/conversations/${encodeURIComponent(id)}`),
  sendMessage: (id, content) => chatRequest(`/ai/conversations/${encodeURIComponent(id)}/messages`, { method: 'POST', body: jsonBody({ content }) }),
  confirmSwitch: (id) => chatRequest(`/ai/topic-switches/${encodeURIComponent(id)}/confirm`, { method: 'POST' }),
  cancelSwitch: (id) => chatRequest(`/ai/topic-switches/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
  dashboard: () => http('/admin/dashboard'),
  saveProduct: (product, creating) =>
    http(`/admin/products${creating ? '' : `/${encodeURIComponent(product.id)}`}`, {
      method: creating ? 'POST' : 'PUT',
      body: jsonBody({ ...product, variants: product.variants.map(v => ({ ...v, id: /^\d+$/.test(v.id) ? v.id : undefined })) }),
    }),
  productStatus: (id, status) =>
    http(`/admin/products/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: jsonBody({ status }),
    }),
  documents: () => http('/admin/knowledge/documents'),
  uploadDocument: (file) => {
    const data = new FormData();
    data.append('file', file);
    return http('/admin/knowledge/documents', { method: 'POST', body: data });
  },
  documentAction: (id, action) =>
    action === 'delete'
      ? http(`/admin/knowledge/documents/${encodeURIComponent(id)}`, { method: 'DELETE' })
      : action === 'reindex'
        ? post(`/admin/knowledge/documents/${encodeURIComponent(id)}/reindex`)
        : http(`/admin/knowledge/documents/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: jsonBody({ enabled: action === 'enable' }),
          }),
  aiSettings: async () => {
    const configs = await http<import('../types/models').AiSettings[]>('/admin/ai-settings');
    return (['OPENAI', 'GEMINI'] as const).map(provider => configs.find(c => c.provider === provider) ?? { provider, model: '', maskedKey: '', active: false });
  },
  saveAiSettings: (data) => http('/admin/ai-settings', { method: 'PUT', body: jsonBody(data) }),
  testAiConnection: (data) => post('/admin/ai-settings/test', data),
  activateProvider: async (provider) => {
    await post('/admin/ai-settings/activate', { provider });
    return realApi.aiSettings();
  },
};
