import { useQuery } from '@tanstack/react-query';
import AppLayout from '../../components/layout/AppLayout';
import { reportsApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';

export default function StockReport() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['report-stock'],
    queryFn: () => reportsApi.stock().then((r) => r.data),
  });

  const totalPurchaseValue = data.reduce((s, p) => s + (p.purchaseValue || 0), 0);
  const totalSaleValue = data.reduce((s, p) => s + (p.saleValue || 0), 0);

  return (
    <AppLayout title="Stock Report">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[['Total Items', data.length, ''], ['Stock Value (Purchase)', totalPurchaseValue, 'currency'], ['Stock Value (Sale)', totalSaleValue, 'currency']].map(([l, v, t]) => (
          <div key={l} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--esp-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{t === 'currency' ? formatCurrency(v) : v}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 600 }}>Product Stock Levels</span></div>
        <div className="table-wrapper">
          {isLoading ? <SkeletonTable rows={8} cols={6} /> : (
            <table className="esp-table">
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Stock</th><th>Threshold</th>
                  <th>Purchase Value</th><th>Sale Value</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => {
                  const status = p.currentStock === 0 ? 'out' : p.currentStock <= p.lowStockThreshold ? 'low' : 'ok';
                  return (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.sku}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: status === 'out' ? 'var(--esp-danger)' : status === 'low' ? 'var(--esp-warning)' : 'var(--esp-success)', fontWeight: 600 }}>{p.currentStock}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.lowStockThreshold}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.purchaseValue)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.saleValue)}</td>
                      <td>
                        <Badge label={status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'OK'}
                          variant={status === 'out' ? 'red' : status === 'low' ? 'yellow' : 'green'} />
                      </td>
                    </tr>
                  );
                })}
                {!data.length && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--esp-text-muted)' }}>No stock data</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
