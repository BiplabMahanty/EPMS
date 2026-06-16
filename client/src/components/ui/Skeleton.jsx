export function Skeleton({ width = '100%', height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}><Skeleton /></td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <table className="esp-table" style={{ width: '100%' }}>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}
      </tbody>
    </table>
  );
}

export function SkeletonCard({ height = 120 }) {
  return <div className="card" style={{ height }}><div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 10 }} /></div>;
}
