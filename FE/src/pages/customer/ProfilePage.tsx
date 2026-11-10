import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../shared/api';
import { useAuth } from '../../features/auth/AuthProvider';
import { Button, ErrorState, PageHeading, useToast } from '../../shared/components/Ui';
import { http, jsonBody } from '../../shared/api/httpClient';
import { isDemo } from '../../shared/api';
import './ProfilePage.css';
import { LocationPicker } from '../../shared/components/LocationPicker';
import type { MapLocation } from '../../shared/types/models';
import { AddressAutocomplete } from '../../shared/components/AddressAutocomplete';
import { useMapAddress } from '../../shared/hooks/useMapAddress';
import { PasswordField } from '../../shared/components/PasswordField';
export default function ProfilePage() {
  const auth = useAuth();
  const user = auth.user!;
  const isCustomer = user.role === 'CUSTOMER';
  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [location, setLocation] = useState<MapLocation | null>(user.location ?? null);
  const [mapSelection, setMapSelection] = useState(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const passwordChange = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      http('/users/me/password', {
        method: 'POST',
        body: jsonBody({ currentPassword, newPassword }),
      }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      notify('Đã đổi mật khẩu.');
    },
  });
  const save = useMutation({
    meta: { toast: { success: false } },
    mutationFn: () =>
      api.updateProfile({
        fullName: fullName.trim(),
        phone,
        address: isCustomer ? address : user.address,
        location: isCustomer ? location : (user.location ?? null),
      }),
    onSuccess: (updated) => {
      auth.setUser(updated);
      setFullName(updated.fullName);
      setPhone(updated.phone);
      setAddress(updated.address);
      setLocation(updated.location ?? null);
      setEditing(false);
      notify('Đã cập nhật thông tin tài khoản.');
    },
  });
  const mapAddress = useMapAddress({
    address,
    location,
    enabled: isCustomer && editing && !save.isPending,
    onChange: (nextAddress, point) => {
      setAddress(nextAddress);
      setLocation(point);
    },
  });
  return (
    <>
      <PageHeading
        title="Thông tin tài khoản"
        description={
          isCustomer
            ? 'Quản lý thông tin liên hệ và địa chỉ nhận hàng của bạn.'
            : 'Quản lý thông tin liên hệ và bảo mật tài khoản.'
        }
      />
      <form
        className="card panel profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (editing && !save.isPending && !mapAddress.resolving) save.mutate();
        }}
      >
        <div className="form-grid">
          <label className="form-field">
            Họ và tên
            <input
              required
              disabled={!editing || save.isPending}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="form-field">
            Email
            <input
              type="email"
              aria-label="Email"
              aria-describedby="profile-email-help"
              value={user.email ?? ''}
              disabled
            />
            <span id="profile-email-help" className="help-text">
              Email được quản lý bởi hệ thống tài khoản.
            </span>
          </label>
          <label className="form-field">
            Số điện thoại
            <input
              type="tel"
              pattern="[+0-9][0-9 -]{8,14}"
              required={isCustomer}
              placeholder={isCustomer ? undefined : 'Không bắt buộc'}
              disabled={!editing || save.isPending}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>
          {isCustomer && (
            <AddressAutocomplete
              label="Địa chỉ mặc định"
              value={address}
              maxLength={255}
              disabled={!editing || save.isPending}
              onChange={(value) => {
                mapAddress.cancel();
                setAddress(value);
                setLocation(null);
              }}
              onSelect={(suggestion) => {
                mapAddress.cancel();
                setAddress(suggestion.label);
                setLocation(suggestion.location);
                setMapSelection((value) => value + 1);
                notify('Đã chọn địa chỉ và cập nhật vị trí trên bản đồ.');
              }}
            />
          )}
        </div>
        {isCustomer && (
          <LocationPicker
            value={location}
            address={address}
            revealKey={mapSelection}
            onChange={mapAddress.select}
            resolvingAddress={mapAddress.resolving}
            disabled={!editing || save.isPending}
          />
        )}
        {mapAddress.resolving && (
          <p className="help-text" role="status">
            Đang lấy địa chỉ theo vị trí đã chọn…
          </p>
        )}
        {save.error && <ErrorState error={save.error} />}
        <div className="flex justify-end gap-3 mt-7">
          {editing ? (
            <>
              <Button
                variant="secondary"
                disabled={save.isPending}
                onClick={() => {
                  mapAddress.cancel();
                  setFullName(user.fullName);
                  setPhone(user.phone);
                  setAddress(user.address);
                  setLocation(user.location ?? null);
                  setEditing(false);
                  save.reset();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" busy={save.isPending} disabled={mapAddress.resolving}>
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Chỉnh sửa thông tin</Button>
          )}
        </div>
      </form>
      {!isDemo && (
        <form
          className="card panel mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            passwordChange.mutate();
          }}
        >
          <h2>Đổi mật khẩu</h2>
          <PasswordField
            id="profile-current-password"
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            disabled={passwordChange.isPending}
          />
          <PasswordField
            id="profile-new-password"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            minLength={8}
            autoComplete="new-password"
            disabled={passwordChange.isPending}
          />
          {passwordChange.error && <ErrorState error={passwordChange.error} />}
          <Button type="submit" className="mt-5" busy={passwordChange.isPending}>
            Đổi mật khẩu
          </Button>
        </form>
      )}
    </>
  );
}
