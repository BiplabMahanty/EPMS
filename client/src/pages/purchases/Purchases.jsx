// Purchases mirrors Sales — same structure, type='purchase'
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { invoicesApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { useState } from 'react';

export default function Purchases() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['purchases', status],
    queryFn: () => invoicesApi.list({ type: 'purchase', status, limit: 50 }).then((r) => r.data),
  });

  const invoices = data?.docs || [];

  return (
    <AppLayout title="Purchases">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select className="select-field" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
          <option value="">All Statuses</option>
          {['draft','unpaid','partial','paid','cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/purchases/new" className="btn btn-primary">+ New Purchase</Link>
        </div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Bill #</th><th>Date</th><th>Supplier</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)}
              {!isLoading && invoices.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon="" title="No purchases yet" /></td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}><Link to={`/purchases/${inv._id}`} style={{ color: 'var(--esp-primary)' }}>{inv.invoiceNumber}</Link></td>
                  <td style={{ fontSize: 13 }}>{formatDate(inv.date)}</td>
                  <td>{inv.party?.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(inv.grandTotal)}</td>
                  <td><Badge label={inv.status} /></td>
                  <td><Link to={`/purchases/${inv._id}`} className="btn btn-secondary btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
