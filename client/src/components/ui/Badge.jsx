const STATUS_MAP = {
  paid: 'green', unpaid: 'red', partial: 'yellow', draft: 'gray', cancelled: 'gray',
  active: 'green', inactive: 'gray',
  owner: 'blue', admin: 'orange', employee: 'gray', staff: 'gray',
  sale: 'blue', purchase: 'orange',
  low: 'red', ok: 'green', out: 'red',
  'low stock': 'yellow', 'out of stock': 'red',
  ordered: 'blue', received: 'green',
};

export default function Badge({ label, color, variant }) {
  const c = variant || color || STATUS_MAP[label?.toLowerCase()] || 'gray';
  return <span className={`badge badge-${c}`}>{label}</span>;
}
