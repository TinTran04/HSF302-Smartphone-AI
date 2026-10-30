export type Role = 'CUSTOMER' | 'ADMIN';
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
}
export type ActiveStatus = 'ACTIVE' | 'INACTIVE';
export interface ProductVariant {
  id: string;
  color: string;
  colorHex: string;
  storage: string;
  price: number;
  status: ActiveStatus;
  image?: string;
}
export interface Product {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  description: string;
  images: string[];
  specifications: Record<string, string | number | null>;
  variants: ProductVariant[];
  status: ActiveStatus;
}
export interface Brand {
  id: string;
  name: string;
}
export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
export interface CartEntry {
  variantId: string;
  quantity: number;
}
export interface CartItem extends CartEntry {
  product: Product;
  variant: ProductVariant;
}
export interface Cart {
  items: CartItem[];
  unavailableVariantIds: string[];
  total: number;
}
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  note: string;
}
export interface Order {
  id: string;
  userId: string;
  customerName: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  shipping: ShippingInfo;
  total: number;
  paymentMethod: 'COD';
  history: { status: OrderStatus; at: string }[];
}
export interface OrderPreview {
  previewId: string;
  total: number;
  items: (CartEntry & { product?: Product; variant?: ProductVariant; oldUnitPrice?: number; currentUnitPrice?: number; priceChanged?: boolean })[];
  priceChanged: boolean;
}
export type ChatTopic = 'PHONE_CONSULTATION' | 'PHONE_COMPARISON' | 'SHOP_SUPPORT' | 'GENERAL_CHAT';
export interface RagSource {
  documentId: string;
  documentName: string;
  pageNumber?: number;
  section?: string;
  excerpt?: string;
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: RagSource[];
  recommendedProducts?: Product[];
  comparedProducts?: Product[];
}
export interface Conversation {
  id: string;
  topic: ChatTopic;
  title: string;
  messages: ChatMessage[];
  pendingSwitch?: TopicSwitchRequired;
}
export interface AiAnswer {
  type: 'ANSWER';
  conversationId: string;
  newConversationId?: string;
  topic?: ChatTopic;
  originalQuestion?: string;
  answer: string;
  sources?: RagSource[];
  recommendedProducts?: Product[];
  comparedProducts?: Product[];
}
export interface TopicSwitchRequired {
  type: 'SWITCH_REQUIRED';
  switchRequestId: string;
  currentTopic: ChatTopic;
  suggestedTopic: ChatTopic;
  message: string;
}
export type ChatSendResponse =
  AiAnswer | TopicSwitchRequired | { type: 'CLARIFICATION_REQUIRED'; message: string };
export type KnowledgeStatus = 'PROCESSING' | 'READY' | 'FAILED' | 'DISABLED';
export interface KnowledgeDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: KnowledgeStatus;
  error?: string;
}
export type AiProvider = 'OPENAI' | 'GEMINI';
export interface AiSettings {
  provider: AiProvider;
  model: string;
  maskedKey: string;
  active: boolean;
}
export interface Dashboard {
  products: number;
  orders: number;
  pendingOrders: number;
  completedOrders: number;
  readyDocuments: number;
  processingDocuments: number;
}
export interface LoginInput {
  email: string;
  password: string;
  guestCart: CartEntry[];
}
export interface RegisterInput extends LoginInput {
  fullName: string;
  phone: string;
}
