import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { inventoryApi } from '../../services/api';
import { useForm } from 'react-hook-form';

function AdjustModal({ onClose, onSave }) {
  const { register, handleSubmit, reset } = useForm();
  return (
    <Modal onClose={onClose} title="Adjust Stock">
      <form onSubmit={handleSubmit((d) => { onSave(d); reset(); })}>
        <div className="form-group"><label className="form-label">Product ID</label><Input {...register('productId')} required /></div>
        <div className="form-group"><label className="form-label">Quantity</label><Input {...register('quantity')} type="number" required /></div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <Select {...register('type')}>
            <option value="manual_add">Add Stock</option>
            <option value="manual_deduct">Deduct Stock</option>
          </Select>
        </div>
        <div className="form-group"><label className="form-label">Reason</label><Input {...register('reason')} /></div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Adjust</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Inventory() {
  const qc = useQueryClient();
  const [adjustOpen, setAdjustOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.list().then((r) => r.data),
  });

  const adjust = useMutation({
    mutationFn: (d) => inventoryApi.adjust(d),
    onSuccess: () => { qc.invalidateQueries(['inventory']); toast.success('Stock adjusted'); setAdjustOpen(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const products = Array.isArray(data) ? data : [];

  return (
    <AppLayout title="Inventory">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button onClick={() => setAdjustOpen(true)}>Adjust Stock</Button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)}
              {!isLoading && products.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon="🗄" title="No inventory data" description="Add products to track stock" /></td></tr>
              )}
              {products.map((p) => {
                const stockStatus = p.currentStock <= 0 ? 'out' : p.currentStock <= p.lowStockThreshold ? 'low' : 'ok';
                const stockColor = stockStatus === 'out' ? 'var(--esp-danger)' : stockStatus === 'low' ? 'var(--esp-warning)' : 'var(--esp-success)';
                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--esp-text-muted)' }}>{p.sku}</td>
                    <td>{p.category?.name || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: stockColor }}>{p.currentStock}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--esp-text-muted)' }}>{p.lowStockThreshold}</td>
                    <td><Badge label={stockStatus} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {adjustOpen && <AdjustModal onClose={() => setAdjustOpen(false)} onSave={(d) => adjust.mutate(d)} />}
    </AppLayout>
  );
}
