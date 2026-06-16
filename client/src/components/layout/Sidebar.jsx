import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store';
import { useSidebarStore } from '../../store';
import { useSync } from '../../hooks/useSync';
import { authApi } from '../../services/api';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/inventory', label: 'Inventory', icon: '🗄', perm: 'canManageStock' },
  { to: '/parties', label: 'Parties', icon: '👥' },
  { to: '/sales', label: 'Sales', icon: '🧾', perm: 'canCreateInvoice' },
  { to: '/purchases', label: 'Purchases', icon: '🛒', perm: 'canAddPurchase' },
  { to: '/reports/sales', label: 'Reports', icon: '📊', perm: 'canViewSalesReport' },
];

function canAccess(user, perm) {
  if (!perm) return true;
  if (!user) return false;
  if (user.role === 'owner' || user.role === 'admin') return true;
  return !!user.permissions?.[perm];
}

const SETTINGS_NAV = [
  { to: '/settings/business', label: 'Business' },
  { to: '/settings/tax', label: 'Tax' },
  { to: '/settings/units', label: 'Units' },
  { to: '/settings/users', label: 'Users' },
  { to: '/settings/sync', label: 'Sync & Backup' },
];

export default function Sidebar() {
  const { user, clearAuth } = useAuth();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const { online, syncNow } = useSync();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    clearAuth();
  };

  return (
    <motion.nav
      className="sidebar"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        background: 'var(--esp-sidebar)', zIndex: 100,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div style={{ padding: collapsed ? '20px 16px' : '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {!collapsed && <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>ESP</span>}
        {collapsed && <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>E</span>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {NAV.map(({ to, label, icon, perm }) => {
          if (!canAccess(user, perm)) return null;
          return (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 6, marginBottom: 2, color: isActive ? '#fff' : 'var(--esp-sidebar-text)',
              background: isActive ? 'var(--esp-sidebar-active)' : 'transparent',
              fontSize: 14, fontWeight: 500, transition: 'background 0.15s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            })}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              {!collapsed && label}
            </NavLink>
          );
        })}

        {!collapsed && (
          <div style={{ marginTop: 16, marginBottom: 4, padding: '0 12px', fontSize: 11, color: 'var(--esp-sidebar-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settings</div>
        )}
        {SETTINGS_NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            borderRadius: 6, marginBottom: 2, color: isActive ? '#fff' : 'var(--esp-sidebar-text)',
            background: isActive ? 'var(--esp-sidebar-active)' : 'transparent',
            fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden',
          })}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚙</span>
            {!collapsed && label}
          </NavLink>
        ))}
      </div>

      <div style={{ padding: collapsed ? '12px 8px' : '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'var(--esp-sidebar-text)' }}>
        {!collapsed && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: online ? 'var(--esp-success)' : 'var(--esp-danger)', flexShrink: 0 }} />
              <span>{online ? 'Synced' : 'Offline'}</span>
              <button onClick={syncNow} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--esp-sidebar-text)', cursor: 'pointer', fontSize: 14 }}>↺</button>
            </div>
            <div style={{ marginBottom: 8 }}>{user?.name} · <span style={{ textTransform: 'uppercase', fontSize: 10 }}>{user?.role}</span></div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--esp-sidebar-text)', cursor: 'pointer', fontSize: 12 }}>Sign out</button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
