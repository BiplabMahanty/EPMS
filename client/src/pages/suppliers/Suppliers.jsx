import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { SkeletonRow } from '../../components/ui/Skeleton';
import { partiesApi } from '../../services/api';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import './Suppliers.css';

function getPlace(party) {
  const address = party?.billingAddress || party?.shippingAddress || '';
  if (!address.trim()) return '-';
  return address.split(',').map((part) => part.trim()).filter(Boolean).pop() || address;
}

function getDealQuantity(deal) {
  return deal?.lineItems?.reduce((sum, item) => sum + Number(item.qty || 0), 0) || 0;
}

function getAdjustmentAmount(deal) {
  const total = Number(deal?.grandTotal || 0);
  const paid = Number(deal?.amountPaid || 0);
  const due = Number(deal?.balanceDue || 0);
  return Math.max(total - paid - due, 0);
}

function getDealLabels(type) {
  if (type === 'purchase') {
    return {
      title: 'Purchase from supplier',
      dueLabel: 'We will pay',
      paidLabel: 'Paid to supplier',
      direction: 'Payable',
      tone: 'danger',
    };
  }

  return {
    title: 'Sale to supplier',
    dueLabel: 'We will receive',
    paidLabel: 'Received from supplier',
    direction: 'Receivable',
    tone: 'success',
  };
}

function getLedgerTotals(ledger = []) {
  return ledger.reduce(
    (totals, entry) => {
      const qty = getDealQuantity(entry);
      const paid = Number(entry.amountPaid || 0);
      const due = Number(entry.balanceDue || 0);
      const total = Number(entry.grandTotal || 0);

      if (entry.type === 'purchase') {
        totals.purchaseAmount += total;
        totals.boughtQty += qty;
        totals.paidToSupplier += paid;
        totals.payableDue += due;
      }

      if (entry.type === 'sale') {
        totals.salesAmount += total;
        totals.soldQty += qty;
        totals.receivedFromSupplier += paid;
        totals.receivableDue += due;
      }

      totals.deductedAmount += getAdjustmentAmount(entry);
      totals.dealCount += 1;

      return totals;
    },
    {
      boughtQty: 0,
      soldQty: 0,
      purchaseAmount: 0,
      salesAmount: 0,
      paidToSupplier: 0,
      receivedFromSupplier: 0,
      payableDue: 0,
      receivableDue: 0,
      deductedAmount: 0,
      dealCount: 0,
    }
  );
}

export default function Suppliers() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search, type],
    queryFn: () => partiesApi.list({ search, type, limit: 200 }).then((r) => r.data),
  });

  const suppliers = useMemo(() => {
    const docs = data?.docs || [];
    return docs.filter((party) => party.type === 'supplier' || party.type === 'both');
  }, [data]);

  return (
    <AppLayout title="Suppliers">
      <div className="supplier-toolbar">
        <input
          className="input"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select-field" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="supplier">Supplier</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Phone Number</th>
                <th>Type</th>
                <th>Place</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={5} />)}
              {!isLoading && suppliers.length === 0 && (
                <tr>
                  <td colSpan={5}><EmptyState icon="" title="No suppliers found" /></td>
                </tr>
              )}
              {suppliers.map((supplier) => (
                <tr
                  key={supplier._id}
                  className="supplier-click-row"
                  tabIndex={0}
                  onClick={() => setSelectedSupplier(supplier)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSupplier(supplier);
                    }
                  }}
                >
                  <td>
                    <button className="supplier-name-button" type="button">
                      {supplier.name}
                    </button>
                  </td>
                  <td style={{ fontSize: 13 }}>{formatDate(supplier.createdAt)}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{supplier.phone}</td>
                  <td><Badge label={supplier.type} /></td>
                  <td>{getPlace(supplier)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSupplier && (
        <SupplierDetailsModal supplier={selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      )}
    </AppLayout>
  );
}

function SupplierDetailsModal({ supplier, onClose }) {
  const [selectedDealId, setSelectedDealId] = useState(null);

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['supplier-ledger', supplier._id],
    queryFn: () => partiesApi.ledger(supplier._id).then((r) => r.data),
    enabled: !!supplier?._id,
  });

  useEffect(() => {
    if (!ledger.length) {
      setSelectedDealId(null);
      return;
    }

    setSelectedDealId((current) => (
      ledger.some((deal) => deal._id === current) ? current : ledger[0]._id
    ));
  }, [ledger]);

  const totals = useMemo(() => getLedgerTotals(ledger), [ledger]);
  const selectedDeal = ledger.find((deal) => deal._id === selectedDealId) || ledger[0];
  const netBalance = totals.payableDue - totals.receivableDue;
  const netLabel = netBalance >= 0 ? 'Net we will pay' : 'Net we will receive';

  return (
    <Modal title={supplier.name} className="supplier-modal" onClose={onClose}>
      <div className="supplier-details">
        <div className="supplier-profile-grid">
          <Detail label="Phone" value={supplier.phone} />
          <Detail label="Email" value={supplier.email || '-'} />
          <Detail label="GSTIN" value={supplier.gstin || '-'} />
          <Detail label="Type" value={supplier.type} />
          <Detail label="Place" value={getPlace(supplier)} />
          <Detail label="Opening Balance" value={formatCurrency(supplier.openingBalance)} />
        </div>

        <div className="supplier-summary-grid">
          <Summary label="Total Deals" value={formatNumber(totals.dealCount)} />
          <Summary label="Bought From Him" value={`${formatNumber(totals.boughtQty)} items`} />
          <Summary label="Sold To Him" value={`${formatNumber(totals.soldQty)} items`} />
          <Summary label="Purchase Amount" value={formatCurrency(totals.purchaseAmount)} />
          <Summary label="Sales Amount" value={formatCurrency(totals.salesAmount)} />
          <Summary label="Paid To Supplier" value={formatCurrency(totals.paidToSupplier)} />
          <Summary label="Received From Supplier" value={formatCurrency(totals.receivedFromSupplier)} />
          <Summary label="Money Deducted" value={formatCurrency(totals.deductedAmount)} />
          <Summary label="We Will Pay" value={formatCurrency(totals.payableDue)} tone="danger" />
          <Summary label="We Will Receive" value={formatCurrency(totals.receivableDue)} tone="success" />
          <Summary label={netLabel} value={formatCurrency(Math.abs(netBalance))} tone={netBalance >= 0 ? 'danger' : 'success'} />
        </div>

        {(supplier.billingAddress || supplier.notes) && (
          <div className="supplier-notes">
            {supplier.billingAddress && (
              <p><strong>Address:</strong> {supplier.billingAddress}</p>
            )}
            {supplier.notes && (
              <p><strong>Notes:</strong> {supplier.notes}</p>
            )}
          </div>
        )}

        <div className="supplier-deals-header">
          <div>
            <h3>Date-wise supplier deals</h3>
            <p>Select any purchase or sale to see full amount, payment, due, tax, and item details.</p>
          </div>
        </div>

        {isLoading && (
          <div className="supplier-deal-layout">
            <div className="supplier-deal-list">
              {Array(4).fill(0).map((_, i) => <div className="supplier-deal-button is-loading" key={i} />)}
            </div>
            <div className="supplier-deal-panel is-loading" />
          </div>
        )}

        {!isLoading && ledger.length === 0 && (
          <div className="supplier-ledger-empty">No purchase or sale details found for this supplier.</div>
        )}

        {!isLoading && ledger.length > 0 && (
          <div className="supplier-deal-layout">
            <div className="supplier-deal-list">
              {ledger.map((deal) => (
                <DealButton
                  key={deal._id}
                  deal={deal}
                  active={deal._id === selectedDeal?._id}
                  onClick={() => setSelectedDealId(deal._id)}
                />
              ))}
            </div>

            <DealDetails deal={selectedDeal} />
          </div>
        )}
      </div>
    </Modal>
  );
}

function DealButton({ deal, active, onClick }) {
  const labels = getDealLabels(deal.type);

  return (
    <button
      className={`supplier-deal-button ${active ? 'is-active' : ''}`}
      type="button"
      onClick={onClick}
    >
      <div>
        <strong>{deal.invoiceNumber}</strong>
        <span>{formatDate(deal.date)}</span>
      </div>
      <Badge label={deal.type} />
      <div className="supplier-deal-button-money">
        <span>{formatCurrency(deal.grandTotal)}</span>
        <small>{labels.dueLabel}: {formatCurrency(deal.balanceDue)}</small>
      </div>
    </button>
  );
}

function DealDetails({ deal }) {
  if (!deal) return null;

  const labels = getDealLabels(deal.type);
  const qty = getDealQuantity(deal);
  const adjustmentAmount = getAdjustmentAmount(deal);
  const dueAmount = Number(deal.balanceDue || 0);

  return (
    <section className="supplier-deal-panel">
      <div className="supplier-deal-panel-header">
        <div>
          <p>{labels.title}</p>
          <h3>{deal.invoiceNumber}</h3>
          <span>{formatDate(deal.date)} {deal.dueDate ? `| Due ${formatDate(deal.dueDate)}` : ''}</span>
        </div>
        <Badge label={deal.status} />
      </div>

      <div className="supplier-deal-summary-grid">
        <Summary label="Total Amount" value={formatCurrency(deal.grandTotal)} />
        <Summary label={labels.paidLabel} value={formatCurrency(deal.amountPaid)} />
        <Summary label={labels.dueLabel} value={formatCurrency(dueAmount)} tone={labels.tone} />
        <Summary label="Deducted / Adjusted" value={formatCurrency(adjustmentAmount)} />
        <Summary label="Items Quantity" value={`${formatNumber(qty)} items`} />
        <Summary label="Payment Mode" value={deal.paymentMode || '-'} />
      </div>

      <div className="supplier-meta-grid">
        <Detail label="Direction" value={labels.direction} />
        <Detail label="Place Of Supply" value={deal.placeOfSupply || '-'} />
        <Detail label="Payment Reference" value={deal.paymentRef || '-'} />
        <Detail label="Notes" value={deal.notes || '-'} />
      </div>

      <div className="supplier-section-title">Item details</div>
      <div className="supplier-item-table-wrap">
        <table className="esp-table supplier-item-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Discount</th>
              <th>GST</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(deal.lineItems || []).map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                <td>
                  <strong>{item.name || item.product?.name || '-'}</strong>
                  <span>{item.product?.sku || item.hsn || ''}</span>
                </td>
                <td>{formatNumber(item.qty)} {item.unit || ''}</td>
                <td className="mono">{formatCurrency(item.rate)}</td>
                <td>{item.discount ? `${item.discount}${item.discountType === 'percent' ? '%' : ''}` : '-'}</td>
                <td>{item.gstRate || 0}%</td>
                <td className="mono">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            {(!deal.lineItems || deal.lineItems.length === 0) && (
              <tr><td colSpan={6}>No item rows found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="supplier-amount-breakup">
        <AmountRow label="Subtotal" value={deal.subtotal} />
        <AmountRow label="Discount" value={deal.totalDiscount} />
        <AmountRow label="CGST" value={deal.cgst} />
        <AmountRow label="SGST" value={deal.sgst} />
        <AmountRow label="IGST" value={deal.igst} />
        <AmountRow label="Round Off" value={deal.roundOff} />
        <AmountRow label="Grand Total" value={deal.grandTotal} strong />
        <AmountRow label={labels.paidLabel} value={deal.amountPaid} />
        <AmountRow label={labels.dueLabel} value={deal.balanceDue} strong tone={labels.tone} />
      </div>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="supplier-detail-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Summary({ label, value, tone = 'neutral' }) {
  return (
    <div className={`supplier-summary-box supplier-summary-box-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AmountRow({ label, value, strong = false, tone = 'neutral' }) {
  return (
    <div className={`supplier-amount-row ${strong ? 'is-strong' : ''} supplier-amount-row-${tone}`}>
      <span>{label}</span>
      <strong>{formatCurrency(value)}</strong>
    </div>
  );
}
