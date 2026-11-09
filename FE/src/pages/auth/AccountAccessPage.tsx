import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { realAuth } from '../../shared/api/realApi';
import { Button, ErrorState, PageHeading, useToast } from '../../shared/components/Ui';
import { PasswordField } from '../../shared/components/PasswordField';

export default function AccountAccessPage({ invitation = false }: { invitation?: boolean }) {
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [validationError, setValidationError] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [done, setDone] = useState(false);
  const { notify } = useToast();
  const begin = useMutation({
    meta: {
      toast: { success: 'Yêu cầu đặt lại mật khẩu đã được tiếp nhận. Vui lòng kiểm tra email.' },
    },
    mutationFn: () => realAuth.reset(email.trim()),
    onSuccess: (data) => setChallengeId(data.challengeId),
  });
  const resend = useMutation({
    mutationFn: () => realAuth.resend(challengeId),
    meta: { toast: { success: 'Đã gửi lại mã xác minh.' } },
    onSuccess: () => {
      setCode('');
      verification.reset();
    },
  });
  const verification = useMutation({
    meta: { toast: { success: 'Xác thực OTP thành công. Bạn có thể đặt mật khẩu mới.' } },
    mutationFn: () => realAuth.resetVerify(challengeId, code.trim()),
    onSuccess: (data) => {
      setResetToken(data.resetToken);
      setCode('');
    },
  });
  const finish = useMutation({
    meta: {
      toast: { success: invitation ? 'Đã kích hoạt tài khoản.' : 'Đặt lại mật khẩu thành công.' },
    },
    mutationFn: () =>
      invitation
        ? realAuth.acceptInvitation(params.get('token') ?? '', password)
        : realAuth.resetConfirm(challengeId, resetToken, password),
    onSuccess: () => setDone(true),
  });
  const canSetPassword = invitation || !!resetToken;
  const busy = begin.isPending || verification.isPending || resend.isPending || finish.isPending;
  function restart() {
    setChallengeId('');
    setResetToken('');
    setCode('');
    setPassword('');
    setConfirmation('');
    setValidationError('');
    begin.reset();
    verification.reset();
    resend.reset();
    finish.reset();
  }
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
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setValidationError('');
              if (busy) return;
              if (canSetPassword) {
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
              } else if (challengeId) verification.mutate();
              else begin.mutate();
            }}
          >
            {!invitation && !challengeId && (
              <label className="form-field">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  autoComplete="email"
                  disabled={busy}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {!invitation && challengeId && !resetToken && (
              <>
                <p className="notice">
                  Nếu tài khoản đủ điều kiện, mã xác minh đã được gửi tới email.
                </p>
                <label className="form-field">
                  Mã OTP
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    disabled={busy}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>
              </>
            )}
            {canSetPassword && (
              <>
                {!invitation && (
                  <p className="notice mb-5" role="status">
                    Đã xác thực OTP. Vui lòng đặt mật khẩu mới trong 5 phút.
                  </p>
                )}
                <p id="reset-password-help" className="help-text mb-5">
                  Mật khẩu phải có ít nhất 8 ký tự. Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc
                  biệt.
                </p>
                <PasswordField
                  id="reset-password"
                  label="Mật khẩu mới"
                  value={password}
                  onChange={setPassword}
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  describedBy="reset-password-help"
                  disabled={busy}
                />
                <PasswordField
                  id="reset-confirmation"
                  label="Xác nhận mật khẩu"
                  value={confirmation}
                  onChange={setConfirmation}
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  disabled={busy}
                />
              </>
            )}
            {invitation && !params.get('token') && (
              <p className="field-error">Liên kết lời mời không hợp lệ hoặc thiếu mã.</p>
            )}
            {(begin.error || verification.error || finish.error) && (
              <ErrorState error={begin.error || verification.error || finish.error} />
            )}
            {validationError && (
              <p className="field-error" role="alert">
                {validationError}
              </p>
            )}
            <Button
              type="submit"
              className="mt-5"
              busy={begin.isPending || verification.isPending || finish.isPending}
              disabled={resend.isPending || (invitation && !params.get('token'))}
            >
              {invitation
                ? 'Xác nhận'
                : resetToken
                  ? 'Đặt lại mật khẩu'
                  : challengeId
                    ? 'Xác thực OTP'
                    : 'Gửi mã xác minh'}
            </Button>
            {!invitation && challengeId && !resetToken && (
              <>
                <Button
                  variant="ghost"
                  className="mt-5"
                  busy={resend.isPending}
                  disabled={verification.isPending}
                  onClick={() => resend.mutate()}
                >
                  Gửi lại mã
                </Button>
                {resend.error && <ErrorState error={resend.error} />}
              </>
            )}
            {!invitation && challengeId && (
              <Button variant="ghost" className="mt-5" disabled={busy} onClick={restart}>
                {resetToken ? 'Yêu cầu mã xác minh mới' : 'Đổi email'}
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
