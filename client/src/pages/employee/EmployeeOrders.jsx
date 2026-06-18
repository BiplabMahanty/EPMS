import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeAuthApi } from '../../services/api';
import EmployeeLayout from './EmployeeLayout';
import { Input, Button } from '../../components/ui/FormElements';
import { format } from 'date-fns';

export default function EmployeeOrders() {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['emp-orders', page, search, from, to],
    queryFn: () => employeeAuthApi.getOrders({ page, limit: 20, search, from, to }).then((r) => r.data),
  });

  return (
    <EmployeeLayout title="My Orders">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input placeholder="Search invoice…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} />
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button variant="secondary" onClick={() => { setSearch(''); setFrom(''); setTo(''); setPage(1); }}>Clear</Button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>#</th><th>Invoice</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Loading…</td></tr>}
              {data?.docs?.map((inv, i) => (
                <tr key={inv._id}>
                  <td>{(page - 1) * 20 + i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{inv.invoiceNumber}</td>
                  <td>{inv.party?.name || '—'}</td>
                  <td>₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: 13 }}>{inv.createdAt ? format(new Date(inv.createdAt), 'dd MMM yyyy') : '—'}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: inv.status === 'paid' ? 'var(--esp-success-light)' : 'var(--esp-warning-light)', color: inv.status === 'paid' ? 'var(--esp-success)' : 'var(--esp-warning)' }}>{inv.status}</span></td>
                </tr>
              ))}
              {!isLoading && !data?.docs?.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--esp-text-muted)' }}>No orders found</td></tr>}
            </tbody>
          </table>
        </div>
        {data?.totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: 16, justifyContent: 'center' }}>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span style={{ padding: '4px 12px', fontSize: 14 }}>{page} / {data.totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>Next</Button>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
