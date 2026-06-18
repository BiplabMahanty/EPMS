import { useQuery } from '@tanstack/react-query';
import { employeeAuthApi } from '../../services/api';
import EmployeeLayout from './EmployeeLayout';

const StatCard = ({ label, value, icon }) => (
  <div className="card card-body" style={{ flex: 1, minWidth: 160 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 13, color: 'var(--esp-text-muted)' }}>{label}</div>
      </div>
    </div>
  </div>
);

export default function EmployeeDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['emp-dashboard'], queryFn: () => employeeAuthApi.getDashboard().then((r) => r.data) });

  return (
    <EmployeeLayout title="Dashboard">
      {isLoading ? (
        <div style={{ color: 'var(--esp-text-muted)' }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <StatCard label="Today's Sales" value={`₹${(data?.todaySales || 0).toLocaleString('en-IN')}`} icon="💰" />
            <StatCard label="Today's Orders" value={data?.todayOrders || 0} icon="🧾" />
            <StatCard label="Monthly Sales" value={`₹${(data?.monthlySales || 0).toLocaleString('en-IN')}`} icon="📈" />
            <StatCard label="Monthly Orders" value={data?.monthlyOrders || 0} icon="📦" />
          </div>
        </>
      )}
    </EmployeeLayout>
  );
}
