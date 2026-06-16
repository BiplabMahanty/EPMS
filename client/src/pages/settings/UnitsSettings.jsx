import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { unitsApi } from '../../services/api';

export default function UnitsSettings() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', unit? }
  const [confirm, setConfirm] = useState(null);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');

  const { data: units = [], isLoading } = useQuery({ queryKey: ['units'], queryFn: () => unitsApi.list().then((r) => r.data) });

  const openAdd = () => { setName(''); setSymbol(''); setModal({ mode: 'add' }); };
  const openEdit = (u) => { setName(u.name); setSymbol(u.symbol); setModal({ mode: 'edit', unit: u }); };

  const save = useMutation({
    mutationFn: () => modal?.mode === 'edit' ? unitsApi.update(modal.unit._id, { name, symbol }) : unitsApi.create({ name, symbol }),
    onSuccess: () => { qc.invalidateQueries(['units']); toast.success('Saved'); setModal(null); },
    onError: () => toast.error('Failed to save'),
  });

  const del = useMutation({
    mutationFn: (id) => unitsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['units']); toast.success('Deleted'); setConfirm(null); },
    onError: () => toast.error('Cannot delete — unit is in use'),
  });

  return (
    <AppLayout title="Units">
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header">
          <span style={{ fontWeight: 600 }}>Units of Measure</span>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Unit</button>
        </div>
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Name</th><th>Symbol</th><th style={{ width: 80 }}></th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={3} style={{ padding: 24, textAlign: 'center', color: 'var(--esp-text-muted)' }}>Loading…</td></tr>
                : units.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.symbol}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openEdit(u)}>✏</button>
                        <button className="btn-icon" style={{ color: 'var(--esp-danger)' }} onClick={() => setConfirm(u._id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Unit' : 'Edit Unit'} onClose={() => setModal(null)}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kilogram" />
          </div>
          <div className="form-group">
            <label className="form-label">Symbol</label>
            <input className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="kg" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => save.mutate()} disabled={!name || !symbol || save.isPending}>
              {save.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmModal
          message="Delete this unit? This cannot be undone."
          onConfirm={() => del.mutate(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AppLayout>
  );
}
