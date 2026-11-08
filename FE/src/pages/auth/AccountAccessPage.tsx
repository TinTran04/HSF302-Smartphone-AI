import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { realAuth } from '../../shared/api/realApi';
import { Button, ErrorState, PageHeading, useToast } from '../../shared/components/Ui';

export default function AccountAccessPage({ invitation = false }: { invitation?: boolean }) {
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [validationError, setValidationError] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [done, setDone] = useState(false);
  const { notify } = useToast();
  const begin = useMutation({
    meta: { toast: { success: 'Yêu cầu đặt lại mật khẩu đã được tiếp nhận. Vui lòng kiểm tra email.' } },
    mutationFn: () => realAuth.reset(email.trim()),
    onSuccess: (data) => setChallengeId(data.challengeId),
  });
  const resend = useMutation({
    mutationFn: () => realAuth.resend(challengeId),
    meta: { toast: { success: 'Đã gửi lại mã xác minh.' } },
  });
  const finish = useMutation({
    meta: { toast: { success: invitation ? 'Đã kích hoạt tài khoản.' : 'Đặt lại mật khẩu thành công.' } },
    mutationFn: () =>
      invitation
        ? realAuth.acceptInvitation(params.get('token') ?? '', password)
        : realAuth.resetConfirm(challengeId, code, password),
    onSuccess: () => setDone(true),
  });
  return (
    <div className="container page">
      <PageHeading title={invitation ? 'Kích hoạt tài khoản' : 'Đặt lại mật khẩu'} />
      <div className="card panel max-w-xl">
        {done ? (
          <p role="status">
            Đã cập nhật mật khẩu.{' '}
            <Link className="text-link" to="/login">
              Đăng nhập
            </Link>
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setValidationError('');
              if (invitation || challengeId) {
                if (password !== confirmation) {
                  setValidationError('Xác nhận mật khẩu chưa khớp.');
                  notify('Xác nhận mật khẩu chưa khớp.', 'error');
                  return;
                }
                if (new TextEncoder().encode(password).length > 72) {
                  setValidationError('Mật khẩu vượt quá giới hạn 72 byte.');
                  notify('Mật khẩu vượt quá giới hạn 72 byte.', 'error');
                  return;
                }
                finish.mutate();
              } else begin.mutate();
            }}
          >
            {!invitation && !challengeId && (
              <label className="form-field">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {!invitation && challengeId && (
              <>
                <p className="notice">
                  Nếu tài khoản đủ điều kiện, mã xác minh đã được gửi tới email.
                </p>
                <label className="form-field">
                  Mã OTP
                  <input
                    required
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>
              </>
            )}
            {(invitation || challengeId) && (
              <>
                {invitation && (
                  <p className="help-text mb-5">
                    Đặt mật khẩu có ít nhất 8 ký tự để kích hoạt tài khoản được mời.
                  </p>
                )}
                <label className="form-field">
                  Mật khẩu mới
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <label className="form-field">
                  Xác nhận mật khẩu
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                </label>
              </>
            )}
            {invitation && !params.get('token') && (
              <p className="field-error">Liên kết lời mời không hợp lệ hoặc thiếu mã.</p>
            )}
            {(begin.error || finish.error) && <ErrorState error={begin.error || finish.error} />}
            {validationError && (
              <p className="field-error" role="alert">
                {validationError}
              </p>
            )}
            <Button
              type="submit"
              className="mt-5"
              busy={begin.isPending || finish.isPending}
              disabled={invitation && !params.get('token')}
            >
              {invitation || challengeId ? 'Xác nhận' : 'Gửi mã xác minh'}
            </Button>
            {!invitation && challengeId && (
              <>
                <Button
                  variant="ghost"
                  className="mt-5"
                  busy={resend.isPending}
                  onClick={() => resend.mutate()}
                >
                  Gửi lại mã
                </Button>
                {resend.error && <ErrorState error={resend.error} />}
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
