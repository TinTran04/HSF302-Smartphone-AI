import type { Api } from '../shared/api/contracts';
import { ApiError } from '../shared/api/httpClient';
import type {
  AiAnswer,
  AiSettings,
  Cart,
  CartEntry,
  CartItem,
  ChatSendResponse,
  ChatTopic,
  Conversation,
  KnowledgeDocument,
  Order,
  OrderPreview,
  OrderStatus,
  Product,
  TopicSwitchRequired,
  User,
} from '../shared/types/models';
import { mockBrands, mockProducts } from './products';
import { topicInfo } from '../features/ai-chat/constants/chatTopics';

// Local fake backend. It never connects to an AI provider or stores credentials.
// It is loaded only when the explicitly visible demo mode is enabled.
const read = <T>(key: string, initial: T): T => {
  try {
    return JSON.parse(sessionStorage.getItem(`smai-demo-${key}`) || 'null') ?? initial;
  } catch {
    return initial;
  }
};
const write = (key: string, value: unknown) => {
  try {
    sessionStorage.setItem(`smai-demo-${key}`, JSON.stringify(value));
  } catch {
    /* A full browser store must not break the interface. */
  }
};
let user = read<User | null>('user', null);
let products = read<Product[]>('products', structuredClone(mockProducts));
let carts = read<Record<string, CartEntry[]>>('carts', {});
let allOrders = read<Order[]>('orders', []);
let chats = read<Record<string, (Conversation & { owner: string; productIds?: string[] })[]>>(
  'chats',
  {},
);
let switches = read<
  Record<
    string,
    { conversationId: string; owner: string; question: string; topic: ChatTopic; answer?: AiAnswer }
  >
>('switches', {});
let documents = read<KnowledgeDocument[]>('documents', [
  {
    id: 'demo-policy',
    name: 'Chinh-sach-minh-hoa.txt',
    size: 640,
    uploadedAt: '2026-10-01T08:00:00+07:00',
    status: 'READY',
  },
]);
let settings = read<AiSettings[]>('settings', [
  { provider: 'OPENAI', model: 'demo-chat-model', maskedKey: '••••••••', active: true },
  { provider: 'GEMINI', model: 'demo-chat-model', maskedKey: '', active: false },
]);
const previews = new Map<string, OrderPreview & { items: CartItem[] }>();
const idempotency = new Map<string, Order>();
const delay = async <T>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return structuredClone(value);
};
const uid = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const owner = () => user?.id || 'guest-session';
const signedIn = () => {
  if (!user) throw new ApiError(401, 'Vui lòng đăng nhập để tiếp tục.');
  return user;
};
const admin = () => {
  if (signedIn().role !== 'ADMIN')
    throw new ApiError(403, 'Chỉ quản trị viên được phép thực hiện thao tác này.');
};
const productById = (id: string) => {
  const p = products.find((p) => p.id === id);
  if (!p) throw new ApiError(404, 'Không tìm thấy sản phẩm.');
  return p;
};
const save = () => {
  write('products', products);
  write('carts', carts);
  write('orders', allOrders);
  write('chats', chats);
  write('switches', switches);
  write('documents', documents);
  write('settings', settings);
};
function resolveCart(entries: CartEntry[]): Cart {
  const unavailableVariantIds: string[] = [];
  const items = entries.flatMap((entry) => {
    const product = products.find((p) => p.variants.some((v) => v.id === entry.variantId));
    const variant = product?.variants.find((v) => v.id === entry.variantId);
    if (!product || !variant || product.status !== 'ACTIVE' || variant.status !== 'ACTIVE') {
      unavailableVariantIds.push(entry.variantId);
      return [];
    }
    return [{ ...entry, product, variant }];
  });
  return {
    items,
    unavailableVariantIds,
    total: items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0),
  };
}
function myCart() {
  const me = signedIn();
  return (carts[me.id] ||= []);
}
function myChat(id: string) {
  const chat = (chats[owner()] || []).find((c) => c.id === id);
  if (!chat) throw new ApiError(404, 'Cuộc hội thoại không tồn tại hoặc đã hết phiên.');
  return chat;
}
function findOrder(id: string, isAdmin = false) {
  if (isAdmin) admin();
  else signedIn();
  const order = allOrders.find((o) => o.id === id && (isAdmin || o.userId === user?.id));
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  return order;
}
function responseFor(chat: Conversation, question: string): AiAnswer {
  const answers: Record<ChatTopic, string> = {
    PHONE_CONSULTATION:
      'Đây là câu trả lời minh họa để xem bố cục tư vấn. Bạn có thể tham khảo các mẫu máy bên dưới và mở chi tiết để chọn phiên bản. Khi kết nối Backend, nội dung và sản phẩm gợi ý sẽ do AI trả về theo nhu cầu của bạn.',
    PHONE_COMPARISON:
      'Đây là bảng so sánh minh họa. Các máy có định hướng khác nhau về hệ điều hành, camera và hiệu năng. Khi tích hợp Backend, AI sẽ phân tích theo dữ liệu sản phẩm đã được xác minh.',
    SHOP_SUPPORT:
      'Đây là nội dung minh họa, không phải chính sách bán hàng có hiệu lực. Nguồn mẫu ghi rõ cửa hàng cần cung cấp tài liệu bảo hành, giao hàng và đổi trả thực tế trước khi sử dụng RAG.',
    GENERAL_CHAT:
      'Đây là cuộc trò chuyện minh họa. Khi kết nối Backend và cấu hình nhà cung cấp AI, bạn sẽ nhận được câu trả lời thực tế. Giao diện hiện tại chỉ dùng để kiểm tra bố cục và luồng hội thoại.',
  };
  const ids = (chats[owner()] || []).find((c) => c.id === chat.id)?.productIds;
  const compared = ids?.length ? products.filter((p) => ids.includes(p.id)) : products.slice(0, 2);
  const response: AiAnswer = {
    type: 'ANSWER',
    conversationId: chat.id,
    answer: answers[chat.topic],
    ...(chat.topic === 'PHONE_CONSULTATION'
      ? { recommendedProducts: products.filter((p) => p.status === 'ACTIVE').slice(0, 2) }
      : {}),
    ...(chat.topic === 'PHONE_COMPARISON' ? { comparedProducts: compared } : {}),
    ...(chat.topic === 'SHOP_SUPPORT'
      ? {
          sources: [
            {
              documentId: 'demo-policy',
              documentName: 'Chinh-sach-minh-hoa.txt',
              section: 'Tài liệu mẫu',
              excerpt: 'Chỉ dùng minh họa giao diện; không phải chính sách có hiệu lực.',
            },
          ],
        }
      : {}),
  };
  chat.messages.push({
    id: uid('msg'),
    role: 'assistant',
    content: response.answer,
    sources: response.sources,
    recommendedProducts: response.recommendedProducts,
    comparedProducts: response.comparedProducts,
  });
  if (chat.messages.filter((m) => m.role === 'user').length === 1)
    chat.title = question.slice(0, 55);
  return response;
}
export const mockApi: Api = {
  me: () => delay(user),
  login: async (data) => {
    if (!['customer@demo.vn', 'admin@demo.vn'].includes(data.email) || data.password !== 'Demo123!')
      throw new ApiError(
        401,
        'Tài khoản demo: customer@demo.vn hoặc admin@demo.vn, mật khẩu Demo123!',
      );
    user = {
      id: data.email.startsWith('admin') ? 'demo-admin' : 'demo-customer',
      fullName: data.email.startsWith('admin') ? 'Quản trị viên' : 'Nguyễn Minh Hoàng',
      email: data.email,
      phone: '0912345678',
      address: 'TP. Hồ Chí Minh',
      role: data.email.startsWith('admin') ? 'ADMIN' : 'CUSTOMER',
    };
    const cart = (carts[user.id] ||= []);
    for (const entry of data.guestCart) {
      const existing = cart.find((i) => i.variantId === entry.variantId);
      if (existing) existing.quantity += entry.quantity;
      else cart.push(entry);
    }
    write('user', user);
    save();
    return delay(user);
  },
  register: async (data) => {
    if (['customer@demo.vn', 'admin@demo.vn'].includes(data.email))
      throw new ApiError(409, 'Email demo này đã được sử dụng.');
    user = {
      id: uid('customer'),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: '',
      role: 'CUSTOMER',
    };
    carts[user.id] = [...data.guestCart];
    write('user', user);
    save();
    return delay(user);
  },
  logout: async () => {
    const previous = owner();
    user = null;
    delete chats[previous];
    delete chats['guest-session'];
    switches = {};
    write('user', null);
    save();
    await delay(undefined);
  },
  updateProfile: (data) => {
    user = { ...signedIn(), ...data };
    write('user', user);
    return delay(user);
  },
  products: (params = new URLSearchParams(), isAdmin = false) => {
    if (isAdmin) admin();
    let items = products.filter((p) => isAdmin || p.status === 'ACTIVE');
    const keyword = (params.get('keyword') || '').toLocaleLowerCase('vi-VN');
    const min = Number(params.get('minPrice') || 0),
      max = Number(params.get('maxPrice') || Infinity);
    items = items.filter(
      (p) =>
        p.name.toLocaleLowerCase('vi-VN').includes(keyword) &&
        (!params.get('brandId') || p.brandId === params.get('brandId')) &&
        (!params.get('ram') || p.specifications.RAM === params.get('ram')) &&
        p.variants.some(
          (v) =>
            (isAdmin || v.status === 'ACTIVE') &&
            v.price >= min &&
            v.price <= max &&
            (!params.get('storage') || v.storage === params.get('storage')),
        ) &&
        (!params.get('status') || p.status === params.get('status')),
    );
    const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
    if (params.get('sort') === 'price,asc') items.sort((a, b) => minPrice(a) - minPrice(b));
    if (params.get('sort') === 'price,desc') items.sort((a, b) => minPrice(b) - minPrice(a));
    if (params.get('sort') === 'name,asc') items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    const size = Math.max(1, Math.min(100, Number(params.get('size')) || 6));
    const totalPages = Math.max(1, Math.ceil(items.length / size));
    const page = Math.max(1, Math.min(totalPages, Number(params.get('page')) || 1));
    return delay({
      items: items.slice((page - 1) * size, page * size),
      totalItems: items.length,
      totalPages,
      page,
      size,
    });
  },
  product: (id, isAdmin = false) => {
    if (isAdmin) admin();
    const p = productById(id);
    if (!isAdmin && p.status !== 'ACTIVE')
      throw new ApiError(404, 'Sản phẩm hiện không được mở bán.');
    return delay(p);
  },
  brands: () => delay(mockBrands),
  cart: () => delay(resolveCart(myCart())),
  resolveCart: (entries) => delay(resolveCart(entries)),
  addCart: (entry) => {
    const cart = myCart();
    const resolved = resolveCart([entry]);
    if (!resolved.items.length) throw new ApiError(409, 'Phiên bản không khả dụng.');
    if (!Number.isInteger(entry.quantity) || entry.quantity < 1)
      throw new ApiError(400, 'Số lượng không hợp lệ.');
    const existing = cart.find((i) => i.variantId === entry.variantId);
    if (existing) existing.quantity += entry.quantity;
    else cart.push(entry);
    save();
    return delay(resolveCart(cart));
  },
  updateCart: (id, quantity) => {
    const cart = myCart();
    if (!Number.isInteger(quantity) || quantity < 1)
      throw new ApiError(400, 'Số lượng không hợp lệ.');
    const entry = cart.find((i) => i.variantId === id);
    if (entry) entry.quantity = quantity;
    save();
    return delay(resolveCart(cart));
  },
  removeCart: (id) => {
    carts[signedIn().id] = myCart().filter((i) => i.variantId !== id);
    save();
    return delay(resolveCart(myCart()));
  },
  previewOrder: (_shipping, variantIds) => {
    const cart = resolveCart(myCart());
    const items = variantIds?.length ? cart.items.filter(i => variantIds.includes(i.variantId)) : cart.items;
    if (!items.length || (variantIds?.length && items.length !== variantIds.length))
      throw new ApiError(409, 'Vui lòng kiểm tra giỏ hàng trước khi đặt.');
    const preview = {
      previewId: uid('preview'),
      total: items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0),
      items: structuredClone(items),
      priceChanged: false,
    };
    previews.set(preview.previewId, preview);
    return delay(preview);
  },
  placeOrder: (data, key) => {
    signedIn();
    const prior = idempotency.get(`${owner()}:${key}`);
    if (prior) return delay(prior);
    const preview = previews.get(data.previewId);
    if (!preview)
      throw new ApiError(409, 'Bản xem trước đã hết hạn. Vui lòng kiểm tra đơn hàng lại.');
    const cart = resolveCart(myCart());
    const chosen = cart.items.filter(i => preview.items.some(item => item.variantId === i.variantId));
    if (
      preview.total !== chosen.reduce((sum, i) => sum + i.variant.price * i.quantity, 0) ||
      JSON.stringify(preview.items.map((i) => [i.variantId, i.quantity])) !==
        JSON.stringify(chosen.map((i) => [i.variantId, i.quantity]))
    )
      throw new ApiError(
        409,
        'Giá hoặc giỏ hàng đã thay đổi. Vui lòng kiểm tra lại.',
        'PRICE_CHANGED',
      );
    const createdAt = new Date().toISOString();
    const order: Order = {
      id: uid('SMAI').toUpperCase(),
      userId: signedIn().id,
      customerName: signedIn().fullName,
      createdAt,
      status: 'PENDING',
      shipping: data.shipping,
      items: preview.items,
      total: preview.total,
      paymentMethod: 'COD',
      history: [{ status: 'PENDING', at: createdAt }],
    };
    allOrders.unshift(order);
    carts[signedIn().id] = myCart().filter(i => !preview.items.some(item => item.variantId === i.variantId));
    idempotency.set(`${owner()}:${key}`, order);
    previews.delete(data.previewId);
    save();
    return delay(order);
  },
  orders: (isAdmin = false) => {
    if (isAdmin) admin();
    else signedIn();
    return delay(allOrders.filter((o) => isAdmin || o.userId === user?.id));
  },
  order: (id, isAdmin = false) => delay(findOrder(id, isAdmin)),
  cancelOrder: (id) => {
    const o = findOrder(id);
    if (o.status !== 'PENDING') throw new ApiError(409, 'Chỉ đơn chờ xác nhận mới được hủy.');
    o.status = 'CANCELLED';
    o.history.push({ status: 'CANCELLED', at: new Date().toISOString() });
    save();
    return delay(o);
  },
  updateOrderStatus: (id, status) => {
    const o = findOrder(id, true);
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!transitions[o.status].includes(status))
      throw new ApiError(409, 'Không thể chuyển sang trạng thái này.');
    o.status = status;
    o.history.push({ status, at: new Date().toISOString() });
    save();
    return delay(o);
  },
  conversations: () => delay(chats[owner()] || []),
  createConversation: (topic, context) => {
    const conversation = {
      id: uid('conv'),
      topic,
      title: topicInfo(topic).title,
      messages: [],
      owner: owner(),
      productIds: context?.productIds,
    };
    (chats[owner()] ||= []).unshift(conversation);
    save();
    return delay(conversation);
  },
  conversation: (id) => delay(myChat(id)),
  sendMessage: (id, content): Promise<ChatSendResponse> => {
    const chat = myChat(id);
    if (chat.pendingSwitch)
      throw new ApiError(409, 'Vui lòng xác nhận hoặc hủy chuyển chủ đề trước.');
    chat.messages.push({ id: uid('msg'), role: 'user', content });
    // Explicit test fixture in the fake backend; the React client never classifies intent.
    if (content === 'Câu hỏi chưa rõ chủ đề') {
      chat.messages.push({
        id: uid('msg'),
        role: 'system',
        content: 'Bạn muốn hỏi về việc chọn máy, so sánh hay chính sách cửa hàng?',
      });
      save();
      return delay({
        type: 'CLARIFICATION_REQUIRED',
        message: 'Bạn muốn hỏi về việc chọn máy, so sánh hay chính sách cửa hàng?',
      });
    }
    if (content === 'Shop có cho đổi trả trong 7 ngày không?' && chat.topic !== 'SHOP_SUPPORT') {
      const pending: TopicSwitchRequired = {
        type: 'SWITCH_REQUIRED',
        switchRequestId: uid('switch'),
        currentTopic: chat.topic,
        suggestedTopic: 'SHOP_SUPPORT',
        message: 'Câu hỏi này thuộc chủ đề Hỗ trợ cửa hàng. Bạn có muốn chuyển chủ đề trò chuyện?',
      };
      switches[pending.switchRequestId] = {
        conversationId: chat.id,
        owner: owner(),
        question: content,
        topic: 'SHOP_SUPPORT',
      };
      chat.pendingSwitch = pending;
      save();
      return delay(pending);
    }
    const answer = responseFor(chat, content);
    save();
    return delay(answer);
  },
  confirmSwitch: (switchId) => {
    const pending = switches[switchId];
    if (!pending || pending.owner !== owner())
      throw new ApiError(404, 'Yêu cầu chuyển chủ đề đã hết hạn.');
    if (pending.answer) return delay(pending.answer);
    const old = myChat(pending.conversationId);
    const next = {
      id: uid('conv'),
      owner: owner(),
      topic: pending.topic,
      title: pending.question.slice(0, 55),
      messages: [{ id: uid('msg'), role: 'user' as const, content: pending.question }],
    };
    (chats[owner()] ||= []).unshift(next);
    delete old.pendingSwitch;
    const answer = responseFor(next, pending.question);
    pending.answer = {
      ...answer,
      newConversationId: next.id,
      originalQuestion: pending.question,
      topic: pending.topic,
    };
    save();
    return delay(pending.answer);
  },
  cancelSwitch: async (switchId) => {
    const pending = switches[switchId];
    if (!pending || pending.owner !== owner()) throw new ApiError(404, 'Yêu cầu đã hết hạn.');
    delete myChat(pending.conversationId).pendingSwitch;
    delete switches[switchId];
    save();
    await delay(undefined);
  },
  dashboard: () => {
    admin();
    return delay({
      products: products.length,
      orders: allOrders.length,
      pendingOrders: allOrders.filter((o) => o.status === 'PENDING').length,
      completedOrders: allOrders.filter((o) => o.status === 'COMPLETED').length,
      readyDocuments: documents.filter((d) => d.status === 'READY').length,
      processingDocuments: documents.filter((d) => d.status === 'PROCESSING').length,
    });
  },
  saveProduct: (p, creating) => {
    admin();
    if (creating) {
      if (products.some((x) => x.id === p.id)) throw new ApiError(409, 'Mã sản phẩm đã tồn tại.');
      products.push(p);
    } else products = products.map((x) => (x.id === p.id ? p : x));
    save();
    return delay(p);
  },
  productStatus: (id, status) => {
    admin();
    const p = productById(id);
    p.status = status;
    save();
    return delay(p);
  },
  documents: () => {
    admin();
    return delay(documents);
  },
  uploadDocument: (file) => {
    admin();
    if (!/\.(pdf|txt)$/i.test(file.name))
      throw new ApiError(400, 'Chỉ hỗ trợ tài liệu PDF hoặc TXT.');
    const doc: KnowledgeDocument = {
      id: uid('doc'),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'PROCESSING',
    };
    documents.unshift(doc);
    save();
    return delay(doc);
  },
  documentAction: async (id, action) => {
    admin();
    const doc = documents.find((d) => d.id === id);
    if (!doc) throw new ApiError(404, 'Tài liệu không tồn tại.');
    if (action === 'delete') documents = documents.filter((d) => d.id !== id);
    else doc.status = action === 'disable' ? 'DISABLED' : 'PROCESSING';
    save();
    await delay(undefined);
  },
  aiSettings: () => {
    admin();
    return delay(settings);
  },
  saveAiSettings: (data) => {
    admin();
    const current = settings.find((s) => s.provider === data.provider)!;
    current.model = data.model;
    if (data.apiKey) current.maskedKey = '••••••••';
    save();
    return delay(current);
  },
  testAiConnection: () => {
    admin();
    return delay({ message: 'Chế độ demo: chỉ kiểm tra giao diện, chưa gọi nhà cung cấp AI.' });
  },
  activateProvider: (provider) => {
    admin();
    if (!settings.find((s) => s.provider === provider)?.maskedKey)
      throw new ApiError(400, 'Vui lòng lưu cấu hình trước khi kích hoạt.');
    settings = settings.map((s) => ({ ...s, active: s.provider === provider }));
    save();
    return delay(settings);
  },
};
