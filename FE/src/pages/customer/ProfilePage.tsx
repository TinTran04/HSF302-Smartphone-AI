import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { useAuth } from '../../features/auth/AuthProvider';
import { Button, ErrorState, PageHeading, useToast } from '../../shared/components/Ui';
import { http, jsonBody } from '../../shared/api/httpClient';
import { isDemo } from '../../shared/api';
export default function ProfilePage() {
  const auth = useAuth();
  const user = auth.user!;
  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const passwordChange = useMutation({ mutationFn: () => http('/users/me/password', { method: 'POST', body: jsonBody({ currentPassword, newPassword }) }), onSuccess: () => { setCurrentPassword(''); setNewPassword(''); notify('Đã đổi mật khẩu.'); } });
  const save = useMutation({
    mutationFn: () => api.updateProfile({ fullName: fullName.trim(), phone, address }),
    onSuccess: (updated) => {
      auth.setUser(updated);
      setEditing(false);
      notify('Đã cập nhật thông tin tài khoản.');
    },
  });
  return (
    <>
      <PageHeading
        title="Thông tin tài khoản"
        description="Quản lý thông tin liên hệ và địa chỉ nhận hàng của bạn."
      />
      <form
        className="card panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (!save.isPending) save.mutate();
        }}
      >
        <div className="form-grid">
          <label className="form-field">
            Họ và tên
            <input
              required
              readOnly={!editing}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="form-field">
            Email
            <input type="email" value={user.email} readOnly />
            <span className="help-text">Email được quản lý bởi hệ thống tài khoản.</span>
          </label>
          <label className="form-field">
            Số điện thoại
            <input
              type="tel"
              pattern="[+0-9][0-9 -]{8,14}"
              required
              readOnly={!editing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>
          <label className="form-field">
            Địa chỉ mặc định
            <input
              readOnly={!editing}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </label>
        </div>
        {save.error && <ErrorState error={save.error} />}
        <div className="flex justify-end gap-3 mt-7">
          {editing ? (
            <>
              <Button
                variant="secondary"
                disabled={save.isPending}
                onClick={() => {
                  setFullName(user.fullName);
                  setPhone(user.phone);
                  setAddress(user.address);
                  setEditing(false);
                  save.reset();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" busy={save.isPending}>
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Chỉnh sửa thông tin</Button>
          )}
        </div>
      </form>
      {!isDemo && <form className="card panel mt-6" onSubmit={e => { e.preventDefault(); passwordChange.mutate(); }}>
        <h2>Đổi mật khẩu</h2>
        <label className="form-field">Mật khẩu hiện tại<input type="password" required autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
        <label className="form-field">Mật khẩu mới<input type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label>
        {passwordChange.error && <ErrorState error={passwordChange.error} />}
        <Button type="submit" className="mt-5" busy={passwordChange.isPending}>Đổi mật khẩu</Button>
      </form>}
    </>
  );
}
