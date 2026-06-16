import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useSidebarStore } from '../../store';

export default function AppLayout({ children, title }) {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const marginLeft = collapsed ? 64 : 240;

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft, paddingTop: 'var(--topnav-height)', minHeight: '100vh', background: 'var(--esp-surface)', transition: 'margin-left 0.2s' }}>
        <TopNav title={title} />
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </>
  );
}
