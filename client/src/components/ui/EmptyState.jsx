export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--esp-text-muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--esp-text-secondary)', marginBottom: 8 }}>{title}</p>
      {description && <p style={{ fontSize: 13, marginBottom: 20 }}>{description}</p>}
      {action}
    </div>
  );
}
