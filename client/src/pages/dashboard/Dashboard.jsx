import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { reportsApi, invoicesApi ,dashboardApi} from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';

function KPICard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <p style={{ fontSize: 12, color: 'var(--esp-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: color || 'var(--esp-text-primary)' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--esp-text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', today],
    queryFn: () => reportsApi.sales({ startDate: today, endDate: today }).then((r) => r.data),
  });
  const { data: purchaseData, isLoading: purchaseLoading } = useQuery({
    queryKey: ['report-purchases', today],
    queryFn: () => reportsApi.purchases({ startDate: today, endDate: today }).then((r) => r.data),
  });
  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['invoices-recent'],
    queryFn: () => invoicesApi.list({ limit: 10 }).then((r) => r.data),
  });

  const { data: countsData } = useQuery({
  queryKey: ['dashboard-counts'],
  queryFn: () =>
    dashboardApi.counts().then((r) => r.data),
});

  const loading = salesLoading || purchaseLoading;

  return (
    <AppLayout title="Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} height={100} />) : (
          <>
            <KPICard label="Today's Sales" value={formatCurrency(salesData?.summary?.totalSales)} sub={`${salesData?.summary?.count || 0} invoices`} color="var(--esp-primary)" />
            <KPICard label="Today's Purchases" value={formatCurrency(purchaseData?.summary?.totalPurchases)} />
            <KPICard label="Outstanding" value={formatCurrency(salesData?.summary?.outstanding)} color="var(--esp-warning)" />
            <KPICard label="Received Today" value={formatCurrency(salesData?.summary?.totalReceived)} color="var(--esp-success)" />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 600 }}>Sales (Last 30 days)</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={salesData?.daily || []}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="total" stroke="var(--esp-primary)" fill="#EFF6FF" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600 }}>Business Overview</span>
          </div>

          <div
            className="card-body"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
  {
    label: 'Employees',
    count: countsData?.data?.employees || 0,
  },
  {
    label: 'Suppliers',
    count: countsData?.data?.suppliers || 0,
  },
  {
    label: 'Customers',
    count: countsData?.data?.customers || 0,
  },
  {
    label: 'Products',
    count: countsData?.data?.products || 0,
  },
].map((item) => (
              <div
                key={item.label}
                style={{
                  border: '1px solid var(--esp-border)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  background: 'var(--esp-surface)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'var(--esp-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--esp-border)';
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--esp-primary)',
                  }}
                >
                  {item.count}
                </span>

                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--esp-text-muted)',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 600 }}>Recent Activity</span></div>
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Invoice</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {recentLoading ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--esp-text-muted)' }}>Loading…</td></tr>
              ) : recentData?.docs?.length ? recentData.docs.map((inv) => (
                <tr key={inv._id}>
                  <td><Link to={`/${inv.type === 'sale' ? 'sales' : 'purchases'}/${inv._id}`} style={{ color: 'var(--esp-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{inv.invoiceNumber}</Link></td>
                  <td><Badge label={inv.type} /></td>
                  <td style={{ fontSize: 13 }}>{formatDate(inv.date)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(inv.grandTotal)}</td>
                  <td><Badge label={inv.status} /></td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--esp-text-muted)' }}>No recent activity</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
