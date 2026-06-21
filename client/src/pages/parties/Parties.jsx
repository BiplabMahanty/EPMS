import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import PartyModal from '../../components/ui/PartyModal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonRow } from '../../components/ui/Skeleton';
import { partiesApi } from '../../services/api';

export default function Parties() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['parties', search, type],
    queryFn: () => partiesApi.list({ search, type, limit: 50 }).then((r) => r.data),
  });

  const del = useMutation({
    mutationFn: (id) => partiesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['parties']); toast.success('Deleted'); setDeleteId(null); },
  });

  const parties = data?.docs || [];

  return (
    <AppLayout title="Parties">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Search parties…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="select-field" value={type} onChange={(e) => setType(e.target.value)} style={{ width: 140 }}>
          <option value="">All Types</option>
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
          <option value="both">Both</option>
        </select>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Party</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Name</th><th>Type</th><th>Phone</th><th>GSTIN</th><th></th></tr></thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={5} />)}
              {!isLoading && parties.length === 0 && (
                <tr><td colSpan={5}><EmptyState icon="" title="No parties add yet" /></td></tr>
              )}
              {parties.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><Badge label={p.type} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.phone}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--esp-text-muted)' }}>{p.gstin || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary btn-sm btn-action-hover" onClick={() => setEditId(p._id)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && <ConfirmModal onCancel={() => setDeleteId(null)} onConfirm={() => del.mutate(deleteId)} loading={del.isPending} />}
      {showAdd && <PartyModal onClose={() => setShowAdd(false)} />}
      {editId && <PartyModal id={editId} onClose={() => setEditId(null)} />}
    </AppLayout>
  );
}
