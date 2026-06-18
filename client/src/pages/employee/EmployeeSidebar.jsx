import { NavLink, useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '../../store';
import { employeeAuthApi } from '../../services/api';
import { useSidebarStore } from '../../store';
import { motion } from 'framer-motion';

const NAV = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/employee/orders', label: 'My Orders', icon: '🧾' },
  { to: '/employee/sales', label: 'Sales', icon: '📊' },
  { to: '/employee/attendance', label: 'Attendance', icon: '📅' },
  { to: '/employee/profile', label: 'Profile', icon: '👤' },
];

export default function EmployeeSidebar() {
  const navigate = useNavigate();
  const employee = useEmployeeStore((s) => s.employee);
  const clearAuth = useEmployeeStore((s) => s.clearAuth);
  const collapsed = useSidebarStore((s) => s.collapsed);

  const handleLogout = async () => {
    await employeeAuthApi.logout().catch(() => {});
    clearAuth();
    navigate('/employee/login');
  };

  return (
    <motion.nav
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'fixed', top: 0, left: 0, height: '100vh', background: 'var(--esp-sidebar)', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ padding: collapsed ? '20px 16px' : '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {collapsed ? <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>E</span> : <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Employee Portal</span>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, marginBottom: 2,
            color: isActive ? '#fff' : 'var(--esp-sidebar-text)', background: isActive ? 'var(--esp-sidebar-active)' : 'transparent',
            fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden',
          })}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            {!collapsed && label}
          </NavLink>
        ))}
      </div>
      <div style={{ padding: collapsed ? '12px 8px' : '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'var(--esp-sidebar-text)' }}>
        {!collapsed && (
          <>
            <div style={{ marginBottom: 8 }}>{employee?.name} · <span style={{ textTransform: 'uppercase', fontSize: 10 }}>{employee?.designation || 'Employee'}</span></div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--esp-sidebar-text)', cursor: 'pointer', fontSize: 12 }}>Sign out</button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
