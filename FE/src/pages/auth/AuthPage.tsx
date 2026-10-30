import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api, isDemo } from '../../shared/api';
import { useAuth } from '../../features/auth/AuthProvider';
import { clearGuestCart, readGuestCart } from '../../features/cart/guestCart';
import { Brand } from '../../shared/components/AppHeader';
import { Button, ErrorState, ProductImage } from '../../shared/components/Ui';
import { Icon } from '../../shared/components/Icon';
import { safeReturnPath } from '../../shared/utils/format';
import images from '../../design/product-images.json';
import { clearGuestToken, realAuth } from '../../shared/api/realApi';
function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          className="icon-button"
          aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} />
        </button>
      </div>
    </div>
  );
}
export default function AuthPage({ register = false }: { register?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [challenge, setChallenge] = useState<{challengeId: string; resendAfter?: string} | null>(null);
  const [code, setCode] = useState('');
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const submit = useMutation({
    mutationFn: () =>
      register
        ? api.register({
            email: email.trim(),
            password,
            fullName: fullName.trim(),
            phone: phone.trim(),
            guestCart: readGuestCart(),
          })
        : api.login({ email: email.trim(), password, guestCart: readGuestCart() }),
    onSuccess: (user) => {
      if ('challengeId' in user) { setChallenge(user); return; }
      if (user.role === 'CUSTOMER') clearGuestCart();
      if (!isDemo) clearGuestToken();
      auth.setUser(user);
      const from = location.state?.from;
      navigate(from ? safeReturnPath(from) : user.role === 'ADMIN' ? '/admin' : '/', {
        replace: true,
      });
    },
  });
  const verify = useMutation({
    mutationFn: () => realAuth.verify(challenge!.challengeId, code, readGuestCart()),
    onSuccess: ({ user }) => {
      clearGuestCart(); clearGuestToken(); auth.setUser(user);
      navigate(location.state?.from ? safeReturnPath(location.state.from) : '/', { replace: true });
    },
  });
  const resend = useMutation({ mutationFn: () => realAuth.resend(challenge!.challengeId) });
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submit.isPending) return;
    const next: Record<string, string> = {};
    if (register && password !== confirm) next.confirm = 'Mật khẩu xác nhận chưa khớp.';
    if (register && !fullName.trim()) next.fullName = 'Vui lòng nhập họ tên.';
    if (register && !/^[+\d][\d\s-]{8,14}$/.test(phone.trim()))
      next.phone = 'Số điện thoại chưa hợp lệ.';
    setErrors(next);
    if (!Object.keys(next).length) submit.mutate();
  }
  return (
    <div className="container page">
      <div className="auth-layout">
        <aside className="auth-visual">
          <div>
            <Brand />
            <h2>Trải nghiệm mua sắm chuẩn xác hơn với AI.</h2>
            <p className="muted text-sm leading-7">
              Một tài khoản để quản lý đơn hàng, lưu lịch sử trò chuyện và tiếp tục hành trình tìm
              chiếc máy phù hợp.
            </p>
            <ProductImage
              src={images['iphone-16-pro-max']?.[0]}
              alt="iPhone trong thiết kế SmartPhone AI"
              eager
            />
          </div>
          <p className="text-xs text-secondary mt-8 flex items-center gap-2">
            <Icon name="verified_user" />
            Thanh toán COD · Thông tin minh bạch
          </p>
        </aside>
        <section className="auth-form">
          <div className="tabs">
            <Link
              to="/login"
              state={location.state}
              className={`button ${!register ? 'button-primary' : 'button-secondary'} flex-1`}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              state={location.state}
              className={`button ${register ? 'button-primary' : 'button-secondary'} flex-1`}
            >
              Đăng ký
            </Link>
          </div>
          <h1 className="!text-2xl mt-8">
            {register ? 'Tạo tài khoản SmartPhone AI' : 'Chào mừng trở lại'}
          </h1>
          <p className="muted text-sm mt-3">
            {register
              ? 'Bắt đầu hành trình công nghệ của riêng bạn.'
              : 'Đăng nhập để tiếp tục mua sắm thông minh.'}
          </p>
          {isDemo && (
            <div className="notice mt-6 !text-xs">
              Demo: <strong>customer@demo.vn</strong> hoặc <strong>admin@demo.vn</strong>
              <br />
              Mật khẩu: <strong>Demo123!</strong>. Đăng ký demo chỉ có hiệu lực trong phiên.
            </div>
          )}
          {challenge ? <form onSubmit={(event) => { event.preventDefault(); verify.mutate(); }}>
            <p className="notice mt-6">Nhập mã OTP được gửi đến email của bạn. Mã có hiệu lực trong 5 phút.</p>
            <label className="form-field">Mã OTP<input required inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} /></label>
            {verify.error && <ErrorState error={verify.error} />}
            {resend.error && <ErrorState error={resend.error} />}
            {resend.isSuccess && <p role="status">Đã gửi lại mã xác minh.</p>}
            <Button type="submit" className="w-full mt-4" busy={verify.isPending}>Xác minh OTP</Button>
            <Button variant="ghost" className="mt-3" disabled={resend.isPending} onClick={() => resend.mutate()}>Gửi lại mã</Button>
          </form> : <form onSubmit={handleSubmit}>
            {register && (
              <>
                <label className="form-field">
                  Họ và tên
                  <input
                    name="fullName"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </label>
                {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                <label className="form-field">
                  Số điện thoại
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={!!errors.phone}
                  />
                </label>
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </>
            )}
            <label className="form-field">
              Email
              <input
                type={register ? 'email' : 'text'}
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <PasswordField
              id="auth-password"
              label="Mật khẩu"
              value={password}
              onChange={setPassword}
              autoComplete={register ? 'new-password' : 'current-password'}
            />
            {register && (
              <>
                <PasswordField
                  id="auth-confirm"
                  label="Xác nhận mật khẩu"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                />
                {errors.confirm && (
                  <p className="field-error" role="alert">
                    {errors.confirm}
                  </p>
                )}
              </>
            )}
            {submit.error && <ErrorState error={submit.error} />}
            <Button type="submit" className="w-full mt-7" busy={submit.isPending}>
              {register ? 'Tạo tài khoản' : 'Đăng nhập'}
              <Icon name="arrow_forward" />
            </Button>
          </form>}
          {!register && !challenge && <p className="mt-4 text-right"><Link className="text-link text-sm" to="/forgot-password">Quên mật khẩu?</Link></p>}
          <p className="help-text mt-6 text-center">
            {register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <Link
              className="text-link"
              to={register ? '/login' : '/register'}
              state={location.state}
            >
              {register ? 'Đăng nhập' : 'Đăng ký ngay'}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
