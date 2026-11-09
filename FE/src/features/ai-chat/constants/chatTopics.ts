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
      'Chọn, so sánh và tìm hiểu cách sử dụng điện thoại từ danh mục, tài liệu và kiến thức AI về điện thoại.',
    prompt: 'Tư vấn điện thoại khoảng 25–30 triệu, chụp ảnh đẹp và pin tốt.',
  },
  {
    id: 'SHOP_SUPPORT',
    title: 'Hỗ trợ cửa hàng',
    icon: 'support_agent',
    description: 'Tra cứu chính sách cửa hàng với nguồn tham khảo từ kho kiến thức được cung cấp.',
    prompt: 'Chính sách bảo hành của cửa hàng như thế nào?',
  },
];
export const normalizeTopic = (id: ChatTopic): ChatTopic =>
  id === 'PHONE_COMPARISON' || id === 'GENERAL_CHAT' ? 'PHONE_CONSULTATION' : id;
export const topicInfo = (id: ChatTopic) => chatTopics.find((t) => t.id === normalizeTopic(id))!;
