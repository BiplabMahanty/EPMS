import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { invoicesApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import InvoiceDetailsModal from '../../components/ui/InvoiceDetailsModal';

export default function Sales() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['sales', status],
    queryFn: () => invoicesApi.list({ type: 'sale', status, limit: 50 }).then((r) => r.data),
  });

  const invoices = data?.docs || [];
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  

  return (
    <AppLayout title="Sales">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select className="select-field" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
          <option value="">All Statuses</option>
          {['draft','unpaid','partial','paid','cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/sales/new" className="btn btn-primary">+ New Sale</Link>
        </div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Invoice #</th><th>Date</th><th>Party</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)}
              {!isLoading && invoices.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon="" title="No sales yet"  /></td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>  {inv.invoiceNumber}</td>
                  <td style={{ fontSize: 13 }}>{formatDate(inv.date)}</td>
                  <td>{inv.party?.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(inv.grandTotal)}</td>
                  <td><Badge label={inv.status} /></td>
                  <td> <button className="btn btn-secondary btn-sm btn-action-hover" onClick={() => setSelectedInvoice(inv)} > View </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)}/>
    </AppLayout>
  );
}
