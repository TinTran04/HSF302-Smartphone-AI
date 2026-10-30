import type {
  AiProvider,
  AiSettings,
  Brand,
  Cart,
  CartEntry,
  ChatSendResponse,
  ChatTopic,
  Conversation,
  Dashboard,
  KnowledgeDocument,
  LoginInput,
  Order,
  OrderPreview,
  OrderStatus,
  PageResult,
  Product,
  RegisterInput,
  ShippingInfo,
  User,
} from '../types/models';
export type AuthResult = User | { challengeId: string; expiresAt?: string; resendAfter?: string };
export interface Api {
  me(): Promise<User | null>;
  login(data: LoginInput): Promise<AuthResult>;
  register(data: RegisterInput): Promise<AuthResult>;
  logout(): Promise<void>;
  updateProfile(data: Pick<User, 'fullName' | 'phone' | 'address'>): Promise<User>;
  products(params?: URLSearchParams, admin?: boolean): Promise<PageResult<Product>>;
  product(id: string, admin?: boolean): Promise<Product>;
  brands(): Promise<Brand[]>;
  cart(): Promise<Cart>;
  resolveCart(entries: CartEntry[]): Promise<Cart>;
  addCart(entry: CartEntry): Promise<Cart>;
  updateCart(variantId: string, quantity: number): Promise<Cart>;
  removeCart(variantId: string): Promise<Cart>;
  previewOrder(shipping: ShippingInfo, variantIds?: string[]): Promise<OrderPreview>;
  placeOrder(
    data: { previewId: string; shipping: ShippingInfo; paymentMethod: 'COD' },
    key: string,
  ): Promise<Order>;
  orders(admin?: boolean): Promise<Order[]>;
  order(id: string, admin?: boolean): Promise<Order>;
  cancelOrder(id: string): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
  conversations(): Promise<Conversation[]>;
  createConversation(topic: ChatTopic, context?: { productIds?: string[] }): Promise<Conversation>;
  conversation(id: string): Promise<Conversation>;
  sendMessage(id: string, content: string): Promise<ChatSendResponse>;
  confirmSwitch(id: string): Promise<ChatSendResponse>;
  cancelSwitch(id: string): Promise<void>;
  dashboard(): Promise<Dashboard>;
  saveProduct(product: Product, creating: boolean): Promise<Product>;
  productStatus(id: string, status: Product['status']): Promise<Product>;
  documents(): Promise<KnowledgeDocument[]>;
  uploadDocument(file: File): Promise<KnowledgeDocument>;
  documentAction(id: string, action: 'reindex' | 'enable' | 'disable' | 'delete'): Promise<void>;
  aiSettings(): Promise<AiSettings[]>;
  saveAiSettings(data: {
    provider: AiProvider;
    model: string;
    apiKey?: string;
  }): Promise<AiSettings>;
  testAiConnection(data: {
    provider: AiProvider;
    model: string;
    apiKey?: string;
  }): Promise<{ message: string }>;
  activateProvider(provider: AiProvider): Promise<AiSettings[]>;
}
