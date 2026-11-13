import type {
  AddressSuggestion,
  AiProvider,
  AiKeyAlert,
  AiModelOptions,
  AiNotifications,
  AiSettings,
  AiKeyManagementState,
  Brand,
  Cart,
  CartEntry,
  ChatSendResponse,
  ChatTopic,
  Conversation,
  Dashboard,
  KnowledgeDocument,
  LoginInput,
  MapLocation,
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
  updateProfile(data: Pick<User, 'fullName' | 'phone' | 'address' | 'location'>): Promise<User>;
  addressSuggestions(text: string, signal?: AbortSignal): Promise<AddressSuggestion[]>;
  reverseLocation(point: MapLocation, signal?: AbortSignal): Promise<{ label: string } | null>;
  products(params?: URLSearchParams, admin?: boolean): Promise<PageResult<Product>>;
  product(id: string, admin?: boolean): Promise<Product>;
  brands(admin?: boolean): Promise<Brand[]>;
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
  deleteConversation(id: string): Promise<void>;
  sendMessage(id: string, content: string, requestId?: string): Promise<ChatSendResponse>;
  confirmSwitch(id: string): Promise<ChatSendResponse>;
  cancelSwitch(id: string): Promise<void>;
  dashboard(): Promise<Dashboard>;
  saveProduct(product: Product, creating: boolean): Promise<Product>;
  uploadProductImage(file: File): Promise<{ url: string }>;
  deleteProduct(id: string): Promise<void>;
  productStatus(id: string, status: Product['status']): Promise<Product>;
  documents(): Promise<KnowledgeDocument[]>;
  uploadDocument(file: File): Promise<KnowledgeDocument>;
  documentAction(id: string, action: 'reindex' | 'enable' | 'disable' | 'delete'): Promise<void>;
  aiSettings(): Promise<AiSettings[]>;
  aiKeyManagement(provider: AiProvider, before?: number): Promise<AiKeyManagementState>;
  renameAiKey(configId: string, keyRef: string, name: string): Promise<void>;
  promoteAiKey(configId: string, keyId: string): Promise<void>;
  saveAiKey(input: import('../types/models').AiKeyEditInput): Promise<AiSettings>;
  checkAiKey(configId: string, keyRef: string): Promise<void>;
  removeAiKey(configId: string, keyRef: string, replacementKeyRef?: string): Promise<AiSettings>;
  moveAiKey(configId: string, keyRef: string, direction: number): Promise<AiSettings>;
  aiQuota(provider: AiProvider, model?: string): Promise<import('../types/models').AiQuotaSettings>;
  aiActivity(provider: AiProvider, page: number): Promise<import('../types/models').AiActivityPage>;
  aiSavedModels(provider: AiProvider): Promise<string[]>;
  aiKeyAlert(): Promise<AiKeyAlert | null>;
  aiNotifications(): Promise<AiNotifications>;
  markAiNotificationsRead(throughId: string): Promise<void>;
  testBackupKey(configId: string, keyId: string): Promise<{ message: string }>;
  saveAiSettings(data: {
    configId?: string;
    backupKeys?: { id?: string; name: string; apiKey?: string }[];
    provider: AiProvider;
    model: string;
    apiKey?: string;
    backupApiKey?: string;
    removeBackupKey?: boolean;
  }): Promise<AiSettings>;
  testAiConnection(data: {
    configId?: string;
    provider: AiProvider;
    model: string;
    apiKey?: string;
    backupApiKey?: string;
    removeBackupKey?: boolean;
  }): Promise<{ message: string }>;
  activateProvider(provider: AiProvider, configId?: string): Promise<AiSettings[]>;
  /** Tối đa 3 model chat có hạn mức miễn phí lớn nhất; để trống apiKey thì BE dùng key đã lưu. */
  aiModelOptions(provider: AiProvider, apiKey?: string): Promise<AiModelOptions>;
}
