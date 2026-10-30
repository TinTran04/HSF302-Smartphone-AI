import type { ChatTopic } from '../../../shared/types/models';
export const chatTopics: {
  id: ChatTopic;
  title: string;
  icon: string;
  description: string;
  prompt: string;
}[] = [
  {
    id: 'PHONE_CONSULTATION',
    title: 'Tư vấn mua điện thoại',
    icon: 'smartphone',
    description:
      'Tìm chiếc máy phù hợp với ngân sách, sở thích chụp ảnh và nhu cầu hằng ngày của bạn.',
    prompt: 'Tư vấn điện thoại khoảng 25–30 triệu, chụp ảnh đẹp và pin tốt.',
  },
  {
    id: 'PHONE_COMPARISON',
    title: 'So sánh điện thoại',
    icon: 'compare_arrows',
    description: 'Đặt 2–3 máy cạnh nhau để hiểu rõ khác biệt về hiệu năng, camera và trải nghiệm.',
    prompt: 'So sánh iPhone 16 Pro Max và Galaxy S24 Ultra.',
  },
  {
    id: 'SHOP_SUPPORT',
    title: 'Hỗ trợ cửa hàng',
    icon: 'support_agent',
    description: 'Tra cứu chính sách cửa hàng với nguồn tham khảo từ kho kiến thức được cung cấp.',
    prompt: 'Chính sách bảo hành của cửa hàng như thế nào?',
  },
  {
    id: 'GENERAL_CHAT',
    title: 'Trò chuyện cùng AI',
    icon: 'auto_awesome',
    description: 'Khám phá kiến thức công nghệ và trò chuyện về những điều bạn quan tâm.',
    prompt: 'Giải thích chip 3nm trên điện thoại một cách dễ hiểu.',
  },
];
export const topicInfo = (id: ChatTopic) => chatTopics.find((t) => t.id === id)!;
