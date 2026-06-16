import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import { reportsApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';

export default function PnLReport() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const { data } = useQuery({
    queryKey: ['report-pnl', start, end],
    queryFn: () => reportsApi.pnl({ startDate: start, endDate: end }).then((r) => r.data),
  });

  const chartData = data ? [
    { name: 'Revenue', value: data.revenue },
    { name: 'COGS', value: data.cogs },
    { name: 'Gross Profit', value: data.grossProfit },
  ] : [];

  return (
    <AppLayout title="Profit & Loss">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ width: 160 }} />
        <input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ width: 160 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          ['Gross Revenue', data?.revenue, 'var(--esp-primary)'],
          ['Cost of Goods Sold', data?.cogs, 'var(--esp-danger)'],
          ['Gross Profit', data?.grossProfit, data?.grossProfit >= 0 ? 'var(--esp-success)' : 'var(--esp-danger)'],
        ].map(([l, v, color]) => (
          <div key={l} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--esp-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>{formatCurrency(v)}</p>
          </div>
        ))}
      </div>

      {data && (
        <div className="card card-body">
          <p style={{ fontWeight: 600, marginBottom: 16 }}>Revenue vs COGS vs Profit</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" fill="var(--esp-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AppLayout>
  );
}
