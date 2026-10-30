import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, jsonBody } from '../../shared/api/httpClient';
import { isDemo } from '../../shared/api';
import { Button, ErrorState, PageHeading } from '../../shared/components/Ui';
import type { Brand, User } from '../../shared/types/models';

type AdminEntry = { user: User; root: boolean; active: boolean; invitationId?: string | null; invitationExpiresAt?: string | null };
const write = <T,>(url: string, method: string, body?: unknown) => http<T>(url, { method, ...(body === undefined ? {} : { body: jsonBody(body) }) });

export default function AdminOperationsPage({ section }: { section: 'brands' | 'admins' | 'maintenance' | 'embedding' }) {
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [invitationId, setInvitationId] = useState('');
  const [provider, setProvider] = useState('OPENAI');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dimensions, setDimensions] = useState(1536);
  const endpoint = { brands: '/admin/brands', admins: '/admin/admins', maintenance: '/maintenance', embedding: '/admin/embedding-settings' }[section];
  const query = useQuery({ queryKey: ['admin-ops', section], queryFn: () => http<unknown>(endpoint), enabled: !isDemo });
  const mutation = useMutation({ mutationFn: (request: { url: string; method: string; body?: unknown }) => write<unknown>(request.url, request.method, request.body), onSuccess: data => {
    if (section === 'admins' && data && typeof data === 'object' && 'id' in data) setInvitationId(String(data.id));
    setName(''); setEmail(''); setApiKey(''); void client.invalidateQueries({ queryKey: ['admin-ops', section] });
  } });
  const act = (url: string, method: string, body?: unknown) => mutation.mutate({ url, method, body });
  const title = { brands: 'Quản lý thương hiệu', admins: 'Quản lý quản trị viên', maintenance: 'Chế độ bảo trì', embedding: 'Cấu hình embedding' }[section];
  return <><PageHeading title={title} />
    {isDemo ? <p className="notice">Chức năng này cần kết nối backend.</p> : <>
      {query.error && <ErrorState error={query.error} />}{mutation.error && <ErrorState error={mutation.error} />}
      {mutation.isSuccess && <p className="notice" role="status">Đã thực hiện thao tác.</p>}
      {section === 'brands' && <div className="card panel"><form onSubmit={e => { e.preventDefault(); act('/admin/brands', 'POST', { name: name.trim() }); }}>
        <label className="form-field">Tên thương hiệu<input required value={name} onChange={e => setName(e.target.value)} /></label><Button type="submit" busy={mutation.isPending}>Thêm thương hiệu</Button></form>
        {(query.data as Brand[] | undefined)?.map(brand => <div key={brand.id} className="flex gap-4 items-center mt-4"><span>{brand.name}</span>
          <Button variant="secondary" onClick={() => { const value = window.prompt('Tên thương hiệu', brand.name); if (value?.trim()) act(`/admin/brands/${brand.id}`, 'PUT', { name: value.trim() }); }}>Sửa</Button>
          <Button variant="danger" onClick={() => { if (window.confirm(`Xóa thương hiệu ${brand.name}?`)) act(`/admin/brands/${brand.id}`, 'DELETE'); }}>Xóa</Button></div>)}</div>}
      {section === 'admins' && <div className="card panel"><form onSubmit={e => { e.preventDefault(); act('/admin/admin-invitations', 'POST', { email: email.trim(), fullName: name.trim() }); }}>
        <label className="form-field">Họ tên<input required value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="form-field">Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><Button type="submit" busy={mutation.isPending}>Gửi lời mời</Button></form>
        {invitationId && <Button variant="secondary" className="mt-4" onClick={() => act(`/admin/admin-invitations/${invitationId}/resend`, 'POST')}>Gửi lại lời mời vừa tạo</Button>}
        {(query.data as AdminEntry[] | undefined)?.map(item => <div key={item.user.id} className="flex gap-4 items-center mt-4"><span>{item.user.fullName} · {item.user.email || 'Admin gốc'} · {item.root ? 'Admin gốc' : item.active ? 'Đang hoạt động' : 'Đã mời'}</span>
          {!item.active && item.invitationId && <Button variant="secondary" onClick={() => act(`/admin/admin-invitations/${item.invitationId}/resend`, 'POST')}>Gửi lại lời mời</Button>}
          {!item.root && <><Button variant="secondary" onClick={() => { if (window.confirm('Chuyển tài khoản này thành khách hàng?')) act(`/admin/admins/${item.user.id}/role`, 'PATCH', { role: 'CUSTOMER' }); }}>Hạ quyền</Button>
          <Button variant="danger" onClick={() => { if (window.confirm('Xóa tài khoản quản trị này?')) act(`/admin/admins/${item.user.id}`, 'DELETE'); }}>Xóa</Button></>}</div>)}</div>}
      {section === 'maintenance' && <div className="card panel"><p>Trạng thái: {(query.data as {enabled?: boolean} | undefined)?.enabled ? 'Đang bảo trì' : 'Đang hoạt động'}</p>
        <Button className="mt-4" disabled={query.isPending} onClick={() => { const enabled = !(query.data as {enabled: boolean}).enabled; if (window.confirm(enabled ? 'Bật bảo trì cửa hàng?' : 'Tắt bảo trì cửa hàng?')) act('/admin/maintenance', 'PUT', { enabled }); }}>{(query.data as {enabled?: boolean} | undefined)?.enabled ? 'Tắt bảo trì' : 'Bật bảo trì'}</Button></div>}
      {section === 'embedding' && <form className="card panel" onSubmit={e => { e.preventDefault(); act('/admin/embedding-settings', 'PUT', { provider, model: model.trim(), dimensions, ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}) }); }}>
        <p>Hiện tại: {(query.data as {model?: string} | undefined)?.model || 'Chưa cấu hình'}</p>
        {(query.data as {reindexRequired?: boolean} | undefined)?.reindexRequired && <p className="notice">Một số tài liệu cần được lập chỉ mục lại.</p>}
        <label className="form-field">Nhà cung cấp<select value={provider} onChange={e => setProvider(e.target.value)}><option>OPENAI</option><option>GEMINI</option></select></label>
        <label className="form-field">Model<input required value={model} onChange={e => setModel(e.target.value)} /></label>
        <label className="form-field">Số chiều<input required type="number" min={1} max={4096} value={dimensions} onChange={e => setDimensions(Number(e.target.value))} /></label>
        <label className="form-field">API key mới<input type="password" autoComplete="off" value={apiKey} onChange={e => setApiKey(e.target.value)} /></label>
        <Button type="submit" busy={mutation.isPending}>Kiểm tra và lưu</Button></form>}
    </>}
  </>;
}
