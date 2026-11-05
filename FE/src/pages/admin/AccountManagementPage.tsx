import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/AuthProvider';
import { isDemo } from '../../shared/api';
import { http, jsonBody } from '../../shared/api/httpClient';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeading,
  Skeleton,
  useToast,
} from '../../shared/components/Ui';
import { errorMessage } from '../../shared/utils/format';
import type { Role, User } from '../../shared/types/models';

type AccountEntry = {
  user: User;
  root: boolean;
  active: boolean;
  disabled: boolean;
  invitationId: string | null;
  invitationExpiresAt: string | null;
};

type AccountAction = {
  url: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  message: string;
};
type Confirmation = { title: string; message: string; request: AccountAction };

export default function AccountManagementPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const { notify } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const accounts = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: () => http<AccountEntry[]>('/admin/accounts'),
    enabled: !isDemo,
  });
  const action = useMutation({
    meta: { toast: false },
    mutationFn: (request: AccountAction) =>
      http(request.url, {
        method: request.method,
        ...(request.body === undefined ? {} : { body: jsonBody(request.body) }),
      }),
    onSuccess: async (_, request) => {
      setConfirmation(null);
      notify(request.message);
      if (request.url === '/admin/account-invitations') {
        setFullName('');
        setEmail('');
        setRole('CUSTOMER');
      }
      await client.invalidateQueries({ queryKey: ['admin-accounts'] });
      void client.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error) => notify(errorMessage(error), 'error'),
  });

  function ask(confirmation: Confirmation) {
    action.reset();
    setConfirmation(confirmation);
  }

  function changeRole(account: AccountEntry, nextRole: Role) {
    if (nextRole === account.user.role) return;
    ask({
      title: 'Xác nhận đổi vai trò',
      message: `Đổi vai trò của ${account.user.email} thành ${nextRole}? Phiên đăng nhập dùng quyền cũ sẽ hết hiệu lực.`,
      request: {
        url: `/admin/accounts/${account.user.id}/role`,
        method: 'PATCH',
        body: { role: nextRole },
        message: 'Đã cập nhật vai trò tài khoản.',
      },
    });
  }

  return (
    <>
      <PageHeading title="Quản lý tài khoản" />
      {isDemo ? (
        <p className="notice">Chức năng này cần kết nối backend.</p>
      ) : (
        <>
          {action.error && <ErrorState error={action.error} />}
          <section className="card panel mb-6">
            <h2 className="text-xl font-bold mb-3">Tạo tài khoản</h2>
            <p className="help-text mb-5">
              Người nhận sẽ nhận email để tự đặt mật khẩu và kích hoạt tài khoản. Liên kết có hiệu
              lực 24 giờ.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                action.mutate({
                  url: '/admin/account-invitations',
                  method: 'POST',
                  body: { fullName: fullName.trim(), email: email.trim(), role },
                  message: 'Đã tạo tài khoản và gửi email đặt mật khẩu.',
                });
              }}
            >
              <div className="grid lg:grid-cols-3 gap-4">
                <label className="form-field">
                  Họ tên
                  <input
                    required
                    maxLength={255}
                    autoComplete="off"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>
                <label className="form-field">
                  Email
                  <input
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="off"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label className="form-field">
                  Vai trò
                  <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                    <option value="CUSTOMER">CUSTOMER — Khách hàng</option>
                    <option value="ADMIN">ADMIN — Quản trị viên</option>
                  </select>
                </label>
              </div>
              <Button type="submit" className="mt-4" busy={action.isPending}>
                Tạo tài khoản và gửi email
              </Button>
            </form>
          </section>
          <section className="card panel">
            <h2 className="text-xl font-bold mb-3">Danh sách tài khoản</h2>
            <p className="help-text mb-5" id="account-role-help">
              Có thể đổi vai trò sau khi tài khoản được kích hoạt. Admin gốc và tài khoản đang đăng
              nhập được bảo vệ khi đổi quyền, vô hiệu hóa và xóa.
            </p>
            {accounts.error ? (
              <ErrorState error={accounts.error} retry={() => void accounts.refetch()} />
            ) : accounts.isPending ? (
              <Skeleton count={2} />
            ) : accounts.data?.length === 0 ? (
              <EmptyState title="Chưa có tài khoản" icon="manage_accounts" />
            ) : (
              <div className="table-scroll">
                <table className="admin-table min-w-[760px]">
                  <thead>
                    <tr>
                      <th>Tài khoản</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.data?.map((account) => {
                      const protectedAccount = account.root || account.user.id === user?.id;
                      return (
                        <tr key={account.user.id}>
                          <td>
                            <strong>{account.user.fullName}</strong>
                            <p className="help-text mt-1">{account.user.email}</p>
                            {account.root && <p className="help-text mt-1">Admin gốc</p>}
                            {account.user.id === user?.id && (
                              <p className="help-text mt-1">Tài khoản của bạn</p>
                            )}
                          </td>
                          <td>
                            <select
                              className="min-w-[132px]"
                              aria-label={`Vai trò của ${account.user.email}`}
                              aria-describedby="account-role-help"
                              value={account.user.role}
                              disabled={protectedAccount || !account.active || action.isPending}
                              onChange={(event) => changeRole(account, event.target.value as Role)}
                            >
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td>
                            <span>
                              {account.disabled
                                ? 'Đã vô hiệu hóa'
                                : account.active
                                  ? 'Đang hoạt động'
                                  : account.invitationId
                                    ? 'Chờ đặt mật khẩu'
                                    : 'Chờ xác minh email'}
                            </span>
                            {!account.disabled &&
                              !account.active &&
                              account.invitationExpiresAt && (
                                <p className="help-text mt-1">
                                  Hạn đặt mật khẩu{' '}
                                  {new Date(account.invitationExpiresAt).toLocaleString('vi-VN')}
                                </p>
                              )}
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                disabled={protectedAccount || action.isPending}
                                title={
                                  protectedAccount
                                    ? 'Admin gốc và tài khoản đang đăng nhập được bảo vệ.'
                                    : undefined
                                }
                                onClick={() =>
                                  ask({
                                    title: account.disabled
                                      ? 'Cho tài khoản hoạt động lại'
                                      : 'Vô hiệu hóa tài khoản',
                                    message: account.disabled
                                      ? `Cho ${account.user.email} hoạt động lại theo trạng thái xác minh trước đó?`
                                      : `Vô hiệu hóa ${account.user.email}? Các phiên đăng nhập sẽ bị thu hồi, dữ liệu tài khoản được giữ lại.`,
                                    request: {
                                      url: `/admin/accounts/${account.user.id}/status`,
                                      method: 'PATCH',
                                      body: { enabled: account.disabled },
                                      message: account.disabled
                                        ? 'Đã cho tài khoản hoạt động lại.'
                                        : 'Đã vô hiệu hóa tài khoản.',
                                    },
                                  })
                                }
                              >
                                {account.disabled ? 'Cho hoạt động lại' : 'Vô hiệu hóa'}
                              </Button>
                              {!account.disabled && !account.active && account.invitationId && (
                                <Button
                                  variant="secondary"
                                  disabled={action.isPending}
                                  onClick={() =>
                                    action.mutate({
                                      url: `/admin/account-invitations/${account.invitationId}/resend`,
                                      method: 'POST',
                                      message: 'Đã gửi lại email đặt mật khẩu.',
                                    })
                                  }
                                >
                                  Gửi lại lời mời
                                </Button>
                              )}
                              {!protectedAccount && account.user.role === 'ADMIN' && (
                                <Button
                                  variant="danger"
                                  disabled={action.isPending}
                                  onClick={() =>
                                    ask({
                                      title: 'Xác nhận xóa tài khoản',
                                      message: `Xóa mềm tài khoản ${account.user.email}? Tài khoản sẽ mất quyền truy cập, dữ liệu liên quan được giữ lại.`,
                                      request: {
                                        url: `/admin/admins/${account.user.id}`,
                                        method: 'DELETE',
                                        message: 'Đã xóa tài khoản quản trị.',
                                      },
                                    })
                                  }
                                >
                                  Xóa
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {confirmation && (
            <ConfirmDialog
              title={confirmation.title}
              message={confirmation.message}
              busy={action.isPending}
              error={action.error}
              onConfirm={() => action.mutate(confirmation.request)}
              onClose={() => {
                setConfirmation(null);
                action.reset();
              }}
            />
          )}
        </>
      )}
    </>
  );
}
