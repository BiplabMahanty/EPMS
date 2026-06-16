import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { usersApi } from '../../services/api';
import { formatDate } from '../../utils/format';

const PERMISSIONS = [
  ['canAddProduct', 'Add Product'],
  ['canEditProduct', 'Edit Product'],
  ['canDeleteProduct', 'Delete Product'],
  ['canAddCategory', 'Add Category'],
  ['canCreateInvoice', 'Create Invoice'],
  ['canViewSalesReport', 'View Sales Report'],
  ['canViewPurchaseReport', 'View Purchase Report'],
  ['canAddPurchase', 'Add Purchase'],
  ['canManageStock', 'Manage Stock'],
];

const ROLE_VARIANT = { owner: 'blue', admin: 'orange', employee: 'gray' };

export default function UsersSettings() {
  const qc = useQueryClient();
  const [inviteModal, setInviteModal] = useState(false);
  const [permModal, setPermModal] = useState(null); // user object
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'employee' });
  const [perms, setPerms] = useState({});

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list().then((r) => r.data) });

  const invite = useMutation({
    mutationFn: () => usersApi.invite(inviteData),
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('Invite sent'); setInviteModal(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to invite'),
  });

  const savePerms = useMutation({
    mutationFn: () => usersApi.updatePermissions(permModal._id, perms),
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('Permissions updated'); setPermModal(null); },
    onError: () => toast.error('Failed to update'),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }) => usersApi.updateStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('Status updated'); },
  });

  const openPerms = (u) => { setPermModal(u); setPerms(u.permissions || {}); };

  return (
    <AppLayout title="User Management">
      <div className="card">
        <div className="card-header">
          <span style={{ fontWeight: 600 }}>Team Members</span>
          <button className="btn btn-primary btn-sm" onClick={() => setInviteModal(true)}>+ Invite User</button>
        </div>
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--esp-text-muted)' }}>Loading…</td></tr>
                : users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--esp-text-muted)' }}>{u.email}</td>
                    <td><Badge label={u.role.toUpperCase()} variant={ROLE_VARIANT[u.role]} /></td>
                    <td><Badge label={u.status} variant={u.status === 'active' ? 'green' : 'gray'} /></td>
                    <td style={{ fontSize: 12, color: 'var(--esp-text-muted)' }}>{u.lastLogin ? formatDate(u.lastLogin) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.role === 'employee' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openPerms(u)}>Permissions</button>
                        )}
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => toggleStatus.mutate({ id: u._id, status: u.status === 'active' ? 'inactive' : 'active' })}>
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {inviteModal && (
        <Modal title="Invite Team Member" onClose={() => setInviteModal(false)}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="input" value={inviteData.name} onChange={(e) => setInviteData((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" value={inviteData.email} onChange={(e) => setInviteData((d) => ({ ...d, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="select-field" value={inviteData.role} onChange={(e) => setInviteData((d) => ({ ...d, role: e.target.value }))}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setInviteModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => invite.mutate()} disabled={!inviteData.email || invite.isPending}>
              {invite.isPending ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </Modal>
      )}

      {permModal && (
        <Modal title={`Permissions — ${permModal.name}`} onClose={() => setPermModal(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {PERMISSIONS.map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--esp-border)' }}>
                <input type="checkbox" checked={!!perms[key]} onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--esp-primary)' }} />
                <span style={{ fontSize: 14 }}>{label}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setPermModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => savePerms.mutate()} disabled={savePerms.isPending}>
              {savePerms.isPending ? 'Saving…' : 'Save Permissions'}
            </button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
