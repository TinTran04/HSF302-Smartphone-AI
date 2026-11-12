import type { AiProvider } from '../types/models';

/** Các nền tảng Chat AI Admin có thể cấu hình và hoán chuyển. Thứ tự trùng với BE. */
export const AI_PROVIDERS = ['GEMINI', 'GROQ', 'DEEPSEEK'] as const satisfies readonly AiProvider[];

export interface AiProviderInfo {
  label: string;
  icon: string;
  defaultModel: string;
  modelHint: string;
  keyPlaceholder: string;
  keyNote: string;
}

export const AI_PROVIDER_INFO: Record<AiProvider, AiProviderInfo> = {
  GEMINI: {
    label: 'Google Gemini',
    icon: 'auto_awesome',
    defaultModel: 'gemini-3.6-flash',
    modelHint: 'Nhập mã model Gemini trong project của bạn',
    keyPlaceholder: 'Nhập API key Gemini',
    keyNote: 'Các key Gemini cùng project dùng chung quota.',
  },
  GROQ: {
    label: 'Groq',
    icon: 'bolt',
    defaultModel: 'llama-3.3-70b-versatile',
    modelHint: 'Nhập mã model Groq, ví dụ llama-3.3-70b-versatile',
    keyPlaceholder: 'Nhập API key Groq (gsk_...)',
    keyNote: 'Các key Groq cùng tổ chức dùng chung giới hạn yêu cầu.',
  },
  DEEPSEEK: {
    label: 'DeepSeek',
    icon: 'psychology',
    defaultModel: 'deepseek-chat',
    modelHint: 'Nhập mã model DeepSeek, ví dụ deepseek-chat',
    keyPlaceholder: 'Nhập API key DeepSeek (sk-...)',
    keyNote: 'Tài khoản DeepSeek hết số dư sẽ được xử lý như hết quota và chuyển sang key dự phòng.',
  },
};

export const providerLabel = (provider: AiProvider) => AI_PROVIDER_INFO[provider]?.label ?? provider;
