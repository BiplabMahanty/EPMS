import EmployeeSidebar from './EmployeeSidebar';
import { useSidebarStore } from '../../store';

export default function EmployeeLayout({ children, title }) {
  const collapsed = useSidebarStore((s) => s.collapsed);
  return (
    <>
      <EmployeeSidebar />
      <div style={{ marginLeft: collapsed ? 64 : 240, paddingTop: 'var(--topnav-height)', minHeight: '100vh', background: 'var(--esp-surface)', transition: 'margin-left 0.2s' }}>
        <div style={{ height: 'var(--topnav-height)', position: 'fixed', top: 0, left: collapsed ? 64 : 240, right: 0, background: 'var(--esp-card)', borderBottom: '1px solid var(--esp-border)', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 90, transition: 'left 0.2s' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h1>
        </div>
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </>
  );
}
