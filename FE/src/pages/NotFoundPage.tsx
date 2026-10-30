import { Link } from 'react-router-dom';
import { EmptyState } from '../shared/components/Ui';
export default function NotFoundPage() {
  return (
    <div className="container page">
      <EmptyState
        title="Không tìm thấy trang"
        description="Đường dẫn này không tồn tại hoặc đã được thay đổi."
        icon="explore_off"
        action={
          <Link className="button button-primary" to="/">
            Về trang chủ
          </Link>
        }
      />
    </div>
  );
}
