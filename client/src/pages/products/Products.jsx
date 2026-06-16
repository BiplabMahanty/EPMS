import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonRow } from '../../components/ui/Skeleton';
import { productsApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { useState } from 'react';

export default function Products() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsApi.list({ search, limit: 50 }).then((r) => r.data),
  });

  const del = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['products']); toast.success('Product deleted'); setDeleteId(null); },
    onError: () => toast.error('Delete failed'),
  });

  const products = data?.docs || [];

  return (
    <AppLayout title="Products">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <input className="input" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/products/categories" className="btn btn-secondary">Categories</Link>
          <Link to="/products/new" className="btn btn-primary">+ Add Product</Link>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Name</th><th>SKU</th><th>Sale Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)}
              {!isLoading && products.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon="📦" title="No products yet" description="Add your first product to get started" action={<Link to="/products/new" className="btn btn-primary">Add Product</Link>} /></td></tr>
              )}
              {products.map((p) => {
                const stockColor = p.currentStock <= 0 ? 'var(--esp-danger)' : p.currentStock <= p.lowStockThreshold ? 'var(--esp-warning)' : 'var(--esp-success)';
                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--esp-text-muted)' }}>{p.sku}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.salePrice)}</td>
                    <td><span style={{ color: stockColor, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.currentStock}</span></td>
                    <td><Badge label={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/products/${p._id}`} className="btn btn-secondary btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <ConfirmModal onCancel={() => setDeleteId(null)} onConfirm={() => del.mutate(deleteId)} loading={del.isPending} message="This will permanently delete the product." />
      )}
    </AppLayout>
  );
}
