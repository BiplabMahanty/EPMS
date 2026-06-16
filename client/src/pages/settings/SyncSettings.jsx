import AppLayout from '../../components/layout/AppLayout';
import { useSync } from '../../hooks/useSync';
import { formatDate } from '../../utils/format';

export default function SyncSettings() {
  const { online, lastSync, syncNow } = useSync();

  return (
    <AppLayout title="Sync & Backup">
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-header"><span style={{ fontWeight: 600 }}>Sync Status</span></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: online ? 'var(--esp-success)' : 'var(--esp-danger)', flexShrink: 0 }} />
            <span style={{ fontWeight: 500 }}>{online ? 'Online — All data synced' : 'Offline — Changes will sync when reconnected'}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--esp-text-muted)' }}>Last synced: {formatDate(lastSync)}</p>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={syncNow}>↺ Sync Now</button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480, marginTop: 16 }}>
        <div className="card-header"><span style={{ fontWeight: 600 }}>Data Export</span></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--esp-text-secondary)' }}>Export all your business data as a JSON backup. Use this to migrate or create a manual backup.</p>
          <a href="/api/settings/export" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} download>⬇ Export All Data (JSON)</a>
        </div>
      </div>
    </AppLayout>
  );
}
