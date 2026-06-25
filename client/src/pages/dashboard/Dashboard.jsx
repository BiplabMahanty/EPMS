import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { reportsApi, invoicesApi, dashboardApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import './Dashboard.css';

function KPICard({ label, value, sub, color }) {
  return (
    <div className="modern-kpi-card">
      <div className="kpi-label">{label}</div>

      <div
        className="kpi-value"
        style={{ color }}
      >
        {value}
      </div>

      {sub && (
        <div className="kpi-sub">
          {sub}
        </div>
      )}
    </div>
  );
}
<div className="quick-actions">

  <Link to="/sales/new" className="action-card">
    <span>🧾</span>
    New Sale
  </Link>

  <Link to="/purchases/new" className="action-card">
    <span>🛒</span>
    New Purchase
  </Link>

  <Link to="/products/new" className="action-card">
    <span>📦</span>
    Add Product
  </Link>

  <Link to="/customers/new" className="action-card">
    <span>👤</span>
    Add Customer
  </Link>

</div>


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
                <defs> <linearGradient
                  id="salesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#3b82f6"
                    stopOpacity={0.6}
                  />

                  <stop
                    offset="95%"
                    stopColor="#3b82f6"
                    stopOpacity={0}
                  />
                </linearGradient></defs>
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="total" stroke="var(--esp-primary)" fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="summary-card">

          <div className="summary-item">
            <h2>{countsData?.data?.products || 0}</h2>
            <span>Products</span>
          </div>

          <div className="summary-item">
            <h2>{countsData?.data?.customers || 0}</h2>
            <span>Customers</span>
          </div>

          <div className="summary-item">
            <h2>{countsData?.data?.suppliers || 0}</h2>
            <span>Suppliers</span>
          </div>

          <div className="summary-item">
            <h2>{countsData?.data?.employees || 0}</h2>
            <span>Employees</span>
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
          </div> {/* Recent Activity card */}

      </div> {/* Grid container */}

    </AppLayout>
  );
}
