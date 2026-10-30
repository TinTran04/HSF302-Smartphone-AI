import type { TopicSwitchRequired } from '../../../shared/types/models';
import { topicInfo } from '../constants/chatTopics';
import { Button, ErrorState, Modal } from '../../../shared/components/Ui';
import { Icon } from '../../../shared/components/Icon';
export function TopicSwitchDialog({
  request,
  onConfirm,
  onCancel,
  busy,
  error,
}: {
  request: TopicSwitchRequired;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
  error?: unknown;
}) {
  return (
    <Modal title="Bạn có muốn chuyển chủ đề trò chuyện?" onClose={onCancel} busy={busy}>
      <div className="icon-tile mb-5">
        <Icon name="swap_horiz" />
      </div>
      <p className="muted text-sm">{request.message}</p>
      <div className="notice my-5">
        <p className="text-xs">Từ: {topicInfo(request.currentTopic).title}</p>
        <p className="font-semibold mt-2">Đến: {topicInfo(request.suggestedTopic).title}</p>
      </div>
      <p className="help-text">
        Câu hỏi đang chờ sẽ được xử lý trong cuộc hội thoại mới. Lịch sử cũ vẫn được giữ riêng.
      </p>
      {!!error && <ErrorState error={error} />}
      <div className="flex flex-col gap-3 mt-6">
        <Button variant="ai" busy={busy} onClick={onConfirm}>
          Chuyển sang {topicInfo(request.suggestedTopic).title}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={onCancel}>
          Ở lại chủ đề hiện tại
        </Button>
      </div>
    </Modal>
  );
}
