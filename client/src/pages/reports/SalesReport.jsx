import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import { reportsApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';

export default function SalesReport() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report-sales-full', start, end],
    queryFn: () => reportsApi.sales({ startDate: start, endDate: end }).then((r) => r.data),
  });

  const s = data?.summary || {};

  return (
    <AppLayout title="Sales Report">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ width: 160 }} />
        <input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ width: 160 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[['Total Sales', s.totalSales], ['Tax Collected', s.totalTax], ['Received', s.totalReceived], ['Outstanding', s.outstanding]].map(([l, v]) => (
          <div key={l} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--esp-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatCurrency(v)}</p>
          </div>
        ))}
      </div>

      <div className="card card-body">
        <p style={{ fontWeight: 600, marginBottom: 16 }}>Sales Over Time</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data?.daily || []}>
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Area type="monotone" dataKey="total" stroke="var(--esp-primary)" fill="#EFF6FF" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AppLayout>
  );
}
