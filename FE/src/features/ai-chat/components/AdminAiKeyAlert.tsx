import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { api } from '../../../shared/api';
import { Icon } from '../../../shared/components/Icon';
import { formatDate } from '../../../shared/utils/format';
import './AdminAiKeyAlert.css';

export const outcomes = {
  PRIMARY: 'Key AI chính đã hoạt động trở lại.',
  USING_BACKUP: 'Đã dùng key dự phòng để trả lời khách.',
  BACKUP_FAILED: 'Key dự phòng cũng gặp lỗi. AI chưa thể trả lời khách.',
  MISSING_BACKUP: 'Chưa có key dự phòng. AI chưa thể trả lời khách.',
};

export function reasonMessage(reason: string | null) {
  switch (reason) {
    case 'AI_PROVIDER_AUTH_ERROR':
      return 'Key hết hiệu lực hoặc không có quyền truy cập.';
    case 'AI_PROVIDER_RATE_LIMIT':
      return 'Đã chạm quota hoặc giới hạn sử dụng.';
    case 'AI_PROVIDER_MODEL_ERROR':
      return 'Model chưa khả dụng với key này.';
    case 'AI_PROVIDER_BUSY':
      return 'Dịch vụ AI đang quá tải hoặc tạm thời không khả dụng.';
    default:
      return 'Chưa thể kết nối dịch vụ AI.';
  }
}

export function AdminAiKeyAlert() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['ai-key-alert', user?.id],
    queryFn: api.aiKeyAlert,
    enabled: user?.role === 'ADMIN',
    refetchInterval: 15_000,
    refetchOnWindowFocus: 'always',
    retry: false,
  });
  const alert = query.data;
  if (!alert || user?.role !== 'ADMIN') return null;

  return (
    <section className="admin-ai-key-alert" aria-label="Cảnh báo API key AI" aria-live="polite">
      <Icon name="warning" />
      <div>
        <h2>API key AI chính cần kiểm tra</h2>
        <p>
          {reasonMessage(alert.reason)} {outcomes[alert.status]}
        </p>
        {alert.backupFailureReason && (
          <p>Lỗi key dự phòng. {reasonMessage(alert.backupFailureReason)}</p>
        )}
        <p className="help-text">
          Model {alert.model} · Phát hiện lúc {formatDate(alert.detectedAt)}
        </p>
        <p>Hãy kiểm tra và bổ sung API key, kiểm tra kết nối rồi kích hoạt cấu hình.</p>
        <Link to="/admin/ai-settings">
          Cập nhật API key <Icon name="arrow_forward" />
        </Link>
      </div>
    </section>
  );
}
