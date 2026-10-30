import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Api } from '../shared/api/contracts';
let backend: Api;
beforeEach(async () => {
  const values = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.resetModules();
  backend = (await import('./mockApi')).mockApi;
});
describe('Fake backend business contracts', () => {
  it('splits topic context only after confirmation and keeps original history', async () => {
    const old = await backend.createConversation('PHONE_CONSULTATION');
    const response = await backend.sendMessage(old.id, 'Shop có cho đổi trả trong 7 ngày không?');
    expect(response.type).toBe('SWITCH_REQUIRED');
    expect((await backend.conversation(old.id)).messages).toHaveLength(1);
    expect(await backend.conversations()).toHaveLength(1);
    if (response.type !== 'SWITCH_REQUIRED') throw new Error('Expected switch');
    const switched = await backend.confirmSwitch(response.switchRequestId);
    if (switched.type !== 'ANSWER') throw new Error('Expected answer');
    expect(switched.newConversationId).not.toBe(old.id);
    const next = await backend.conversation(switched.newConversationId!);
    expect(next.topic).toBe('SHOP_SUPPORT');
    expect(next.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect((await backend.conversation(old.id)).messages).toHaveLength(1);
    const retry = await backend.confirmSwitch(response.switchRequestId);
    expect(retry).toEqual(switched);
    expect(await backend.conversations()).toHaveLength(2);
  });
  it('cancels a pending switch without answering outside the topic', async () => {
    const chat = await backend.createConversation('GENERAL_CHAT');
    const response = await backend.sendMessage(chat.id, 'Shop có cho đổi trả trong 7 ngày không?');
    if (response.type !== 'SWITCH_REQUIRED') throw new Error('Expected switch');
    await backend.cancelSwitch(response.switchRequestId);
    const current = await backend.conversation(chat.id);
    expect(current.topic).toBe('GENERAL_CHAT');
    expect(current.pendingSwitch).toBeUndefined();
    expect(current.messages).toHaveLength(1);
    expect(await backend.conversations()).toHaveLength(1);
  });
  it('creates only one COD order for the same idempotency key', async () => {
    await backend.login({
      email: 'customer@demo.vn',
      password: 'Demo123!',
      guestCart: [{ variantId: 'iphone-16-pro-max-256gb-natural', quantity: 1 }],
    });
    const shipping = {
      fullName: 'Khách thử nghiệm',
      phone: '0912345678',
      address: 'TP. Hồ Chí Minh',
      note: '',
    };
    const preview = await backend.previewOrder(shipping);
    const body = { previewId: preview.previewId, shipping, paymentMethod: 'COD' as const };
    const first = await backend.placeOrder(body, 'same-request');
    const repeated = await backend.placeOrder(body, 'same-request');
    expect(first.id).toBe(repeated.id);
    expect(await backend.orders()).toHaveLength(1);
    expect((await backend.cart()).items).toHaveLength(0);
    expect(first.status).toBe('PENDING');
    expect((await backend.cancelOrder(first.id)).status).toBe('CANCELLED');
    await expect(async () => backend.cancelOrder(first.id)).rejects.toThrow('Chỉ đơn chờ xác nhận');
  });
  it('enforces ownership and admin role in the fake backend', async () => {
    const guest = await backend.createConversation('GENERAL_CHAT');
    await backend.login({ email: 'customer@demo.vn', password: 'Demo123!', guestCart: [] });
    await expect(async () => backend.dashboard()).rejects.toThrow('Chỉ quản trị viên');
    await expect(async () => backend.conversation(guest.id)).rejects.toThrow(
      'Cuộc hội thoại không tồn tại',
    );
  });
});
