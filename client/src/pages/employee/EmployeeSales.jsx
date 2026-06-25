import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import EmployeeLayout from './EmployeeLayout';
import { employeeAuthApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import InvoiceDetailsModal from '../../components/ui/InvoiceDetailsModal';

export default function EmployeeSales() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employee-sales'],
    queryFn: () => employeeAuthApi.getSales({ limit: 50 }).then((r) => r.data),
  });

  const invoices = data?.docs || [];

  return (
    <EmployeeLayout title="My Sales">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Link to="/employee/sales/new" className="btn btn-primary">+ New Sale</Link>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Invoice #</th><th>Date</th><th>Party</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)}
              {!isLoading && invoices.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon="" title="No sales yet" /></td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{inv.invoiceNumber}</td>
                  <td style={{ fontSize: 13 }}>{formatDate(inv.date)}</td>
                  <td>{inv.party?.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(inv.grandTotal)}</td>
                  <td><Badge label={inv.status} /></td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => setSelectedInvoice(inv)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </EmployeeLayout>
  );
}
