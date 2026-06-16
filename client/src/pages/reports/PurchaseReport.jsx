import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '../../components/layout/AppLayout';
import { reportsApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';

export default function PurchaseReport() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const { data } = useQuery({
    queryKey: ['report-purchases-full', start, end],
    queryFn: () => reportsApi.purchases({ startDate: start, endDate: end }).then((r) => r.data),
  });

  const s = data?.summary || {};

  return (
    <AppLayout title="Purchase Report">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ width: 160 }} />
        <input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ width: 160 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[['Total Purchases', s.totalPurchases], ['Tax Paid', s.totalTax], ['Amount Paid', s.totalPaid], ['Outstanding', s.outstanding]].map(([l, v]) => (
          <div key={l} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--esp-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatCurrency(v)}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
