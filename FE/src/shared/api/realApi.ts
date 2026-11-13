import type { Api } from './contracts';
import { ApiError, http, jsonBody, setAuthAccount } from './httpClient';
import type { Cart, CartEntry, CartItem, Product, Order, OrderPreview, User } from '../types/models';
import { guestCartMergeId } from '../utils/guestCartMerge';
import { AI_PROVIDERS } from '../constants/aiProviders';

type ServerCart = { items: (CartEntry & { product: Product | null; variant: CartItem['variant'] | null; unavailable: boolean; priceAtAdd: number })[]; total: number };
function mapCart(cart: ServerCart): Cart {
  return { total: cart.total,
    unavailableItems: cart.items.filter(i => i.unavailable).map(({ variantId, quantity, product, variant }) => ({ variantId, quantity, product, variant })),
    unavailableVariantIds: cart.items.filter(i => i.unavailable).map(i => i.variantId),
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
export function clearGuestToken() {
  try { sessionStorage.removeItem(tokenKey); } catch { /* Legacy storage can be unavailable. */ }
}
export const realAuth = {
  verify: async (challengeId: string, code: string, guestCart: CartEntry[]) => {
    const result = await post<{user: User}>('/auth/otp/verify', { challengeId, code, guestCart, guestCartMergeId: await guestCartMergeId(guestCart) });
    setAuthAccount(result.user.id);
    clearGuestToken();
    return result;
  },
  resend: (challengeId: string) => post('/auth/otp/resend', { challengeId }),
  reset: (email: string) => post<{challengeId:string}>('/auth/password-reset', { email }),
  resetVerify: (challengeId: string, code: string) => post<{resetToken: string; expiresAt: string}>('/auth/password-reset/verify', { challengeId, code }),
  resetConfirm: (challengeId: string, resetToken: string, newPassword: string) => post('/auth/password-reset/confirm', { challengeId, resetToken, newPassword }),
  acceptInvitation: (token: string, password: string) => post('/auth/account-invitations/accept', { token, password }),
};
export const realApi: Api = {
  me: async () => {
    try {
      const user = await http<User>('/users/me');
      setAuthAccount(user.id);
      return user;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && e.code !== 'AUTH_CONTEXT_CHANGED') {
        setAuthAccount(null);
        return null;
      }
      throw e;
    }
  },
  login: async (data) => {
    const result = await post<{user?: import('../types/models').User; challengeId?: string; expiresAt?: string; resendAfter?: string}>('/auth/login', { identifier: data.email, password: data.password, guestCart: data.guestCart, guestCartMergeId: await guestCartMergeId(data.guestCart) });
    if (result.user) {
      setAuthAccount(result.user.id);
      clearGuestToken();
    }
    return result.user ?? { challengeId: result.challengeId!, expiresAt: result.expiresAt, resendAfter: result.resendAfter };
  },
  register: (data) => post('/auth/register', { email: data.email, password: data.password, fullName: data.fullName, phone: data.phone }),
  logout: async () => {
    await post('/auth/logout');
    setAuthAccount(null);
  },
  updateProfile: (data) => http('/users/me', { method: 'PUT', body: jsonBody(data) }),
  addressSuggestions: (text, signal) => http(`/locations/autocomplete?${new URLSearchParams({ text: text.trim() })}`, { signal }),
  reverseLocation: (point, signal) => http(`/locations/reverse?${new URLSearchParams({ latitude: String(point.latitude), longitude: String(point.longitude) })}`, { signal }),
  products: (params = new URLSearchParams(), admin = false) => {
    const searchParams = new URLSearchParams(params);
    if (searchParams.has('keyword') && !searchParams.has('q')) {
      searchParams.set('q', searchParams.get('keyword')!);
    }
    return http(`/${admin ? 'admin/' : ''}products?${searchParams}`);
  },
  product: (id, admin = false) =>
    http(`/${admin ? 'admin/' : ''}products/${encodeURIComponent(id)}`),
  brands: (admin = false) => http(`/${admin ? 'admin/' : ''}brands`),
  cart: async () => mapCart(await http<ServerCart>('/cart')),
  resolveCart: async (entries) => {
    const batches = [];
    for (let i = 0; i < entries.length; i += 100) batches.push(entries.slice(i, i + 100));
    const results = await Promise.all(batches.map(items => post<ServerCart>('/cart/resolve', { items })));
    return mapCart({ items: results.flatMap(result => result.items), total: results.reduce((sum, result) => sum + result.total, 0) });
  },
  addCart: async (entry) => mapCart(await post<ServerCart>('/cart/items', entry)),
  updateCart: (id, quantity) =>
    http<ServerCart>(`/cart/items/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: jsonBody({ quantity }),
    }).then(mapCart),
  changeCartVariant: (id, targetVariantId) =>
    http<ServerCart>(`/cart/items/${encodeURIComponent(id)}/variant`, {
      method: 'PATCH',
      body: jsonBody({ variantId: targetVariantId }),
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
  conversations: () => http('/ai/conversations'),
  createConversation: async (topic, context) => {
    const result = await http<{ conversationId: string }>('/ai/conversations', { method: 'POST', body: jsonBody({
      topic,
      ...context,
    }) });
    return http(`/ai/conversations/${encodeURIComponent(result.conversationId)}`);
  },
  conversation: (id) => http(`/ai/conversations/${encodeURIComponent(id)}`),
  deleteConversation: (id) => http(`/ai/conversations/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  sendMessage: (id, content, requestId) => http(`/ai/conversations/${encodeURIComponent(id)}/messages`, { method: 'POST', body: jsonBody({ content, ...(requestId ? { requestId } : {}) }), signal: AbortSignal.timeout(400000) }),
  confirmSwitch: (id) => http(`/ai/topic-switches/${encodeURIComponent(id)}/confirm`, { method: 'POST', signal: AbortSignal.timeout(400000) }),
  cancelSwitch: (id) => http(`/ai/topic-switches/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
  dashboard: () => http('/admin/dashboard'),
  uploadProductImage: (file) => {
    const body = new FormData();
    body.append('file', file);
    return http('/admin/products/images', { method: 'POST', body });
  },
  deleteProduct: (id) => http(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  saveProduct: (product, creating) =>
    http(`/admin/products${creating ? '' : `/${encodeURIComponent(product.id)}`}`, {
      method: creating ? 'POST' : 'PUT',
      body: jsonBody({
        ...product,
        brandId: Number(product.brandId),
        variants: product.variants.map(v => ({
          ...v,
          id: /^\d+$/.test(v.id) ? Number(v.id) : undefined,
        })),
      }),
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
  aiKeyAlert: async () => {
    const result = await http<{ alert: import('../types/models').AiKeyAlert | null }>('/admin/ai-settings/key-alert');
    return result.alert;
  },
  aiNotifications: () => http('/admin/ai-settings/notifications'),
  markAiNotificationsRead: (throughId) => http('/admin/ai-settings/notifications/read', { method: 'POST', body: jsonBody({ throughId }) }),
  testBackupKey: (configId, keyId) => http('/admin/ai-settings/' + encodeURIComponent(configId) + '/backup-keys/' + encodeURIComponent(keyId) + '/test', { method: 'POST', signal: AbortSignal.timeout(130000) }),
  aiSettings: async () => {
    const configs = await http<import('../types/models').AiSettings[]>('/admin/ai-settings');
    return AI_PROVIDERS.map(provider => {
      const latest = configs.find(c => c.provider === provider) ?? { id: '', backupKeys: [], provider, model: '', maskedKey: '', maskedBackupKey: '', tested: false, active: false };
      const active = configs.find(c => c.provider === provider && c.active);
      return { ...latest, backupKeys: latest.backupKeys ?? [], ...(active ? { activeModel: active.model } : {}) };
    });
  },
  aiKeyManagement: (provider, before) =>
    http(
      `/admin/ai-settings/key-management?${new URLSearchParams({ provider, ...(before !== undefined ? { before: String(before) } : {}) })}`,
    ),
  renameAiKey: (configId, keyRef, name) =>
    http(`/admin/ai-settings/key-management/${encodeURIComponent(configId)}/name`, {
      method: 'PUT',
      body: jsonBody({ keyRef, name }),
    }),
  promoteAiKey: (configId, keyId) =>
    post(
      `/admin/ai-settings/key-management/${encodeURIComponent(configId)}/promote/${encodeURIComponent(keyId)}`,
    ),
  saveAiKey: (input) =>
    http('/admin/ai-settings/key-management/key', {
      method: 'POST',
      body: jsonBody(input),
      signal: AbortSignal.timeout(60000),
    }),
  checkAiKey: (configId, keyRef) =>
    post(
      `/admin/ai-settings/key-management/${encodeURIComponent(configId)}/check/${encodeURIComponent(keyRef)}`,
    ),
  removeAiKey: (configId, keyRef, replacementKeyRef) =>
    http(
      `/admin/ai-settings/key-management/${encodeURIComponent(configId)}/key/${encodeURIComponent(keyRef)}${replacementKeyRef ? `?replacementKeyRef=${encodeURIComponent(replacementKeyRef)}` : ''}`,
      { method: 'DELETE' },
    ),
  moveAiKey: (configId, keyRef, direction) =>
    post(
      `/admin/ai-settings/key-management/${encodeURIComponent(configId)}/key/${encodeURIComponent(keyRef)}/move?direction=${direction}`,
    ),
  aiQuota: (provider, model) =>
    http(
      `/admin/ai-settings/quota?${new URLSearchParams({ provider, ...(model ? { model } : {}) })}`,
    ),
  aiActivity: (provider, page) =>
    http(
      `/admin/ai-settings/key-management/activity?${new URLSearchParams({ provider, page: String(page), size: '10' })}`,
    ),
  aiSavedModels: (provider) =>
    http(`/admin/ai-settings/key-management/models?${new URLSearchParams({ provider })}`),
  saveAiSettings: (data) => http('/admin/ai-settings', { method: 'PUT', body: jsonBody(data) }),
  aiModelOptions: (provider, apiKey) => http('/admin/ai-settings/models', { method: 'POST', body: jsonBody({ provider, ...(apiKey ? { apiKey } : {}) }), signal: AbortSignal.timeout(60000) }),
  testAiConnection: (data) => http('/admin/ai-settings/test', { method: 'POST', body: jsonBody(data), signal: AbortSignal.timeout(130000) }),
  activateProvider: async (provider, configId) => {
    await post('/admin/ai-settings/activate', { provider, ...(configId ? { configId } : {}) });
    return realApi.aiSettings();
  },
};
