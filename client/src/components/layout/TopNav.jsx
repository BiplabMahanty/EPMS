import { useSidebarStore, useAuthStore } from '../../store';

export default function TopNav({ title }) {
  const toggle = useSidebarStore((s) => s.toggle);
  const user = useAuthStore((s) => s.user);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--topnav-height)',
      background: 'var(--esp-card)', borderBottom: '1px solid var(--esp-border)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      zIndex: 99,
    }}>
      <button onClick={toggle} className="btn-icon" style={{ fontSize: 18 }}>☰</button>
      <span style={{ fontWeight: 600, color: 'var(--esp-text-primary)', fontSize: 15 }}>{title}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--esp-text-secondary)' }}>{user?.name}</span>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--esp-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
