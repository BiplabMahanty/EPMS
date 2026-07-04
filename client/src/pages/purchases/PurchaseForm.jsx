// Purchase form is the same as SaleForm but with type='purchase' and supplier parties
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { invoicesApi, partiesApi, productsApi, taxApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { calculateGST } from '../../utils/gstCalculator';

export default function PurchaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: parties } = useQuery({ queryKey: ['parties-supplier'], queryFn: () => partiesApi.list({ type: 'supplier', limit: 200 }).then((r) => r.data.docs) });
  console.log('parties', parties);
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.list({ limit: 500 }).then((r) => r.data.docs) });
  const { data: taxes = [] } = useQuery({ queryKey: ['taxes'], queryFn: () => taxApi.list().then((r) => r.data) });

  const { data: purchase, isLoading: loadingPurchase } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => invoicesApi.get(id).then((r) => r.data),
    enabled: isEdit,
  });

  const defaultTax = taxes.find((t) => t.isDefault);
  const { register, control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: { type: 'purchase', date: new Date().toISOString().slice(0, 10), lineItems: [{ name: '', qty: 1, rate: 0, discount: 0, discountType: 'flat', gstRate: 18, unit: '' }], amountPaid: 0, paymentMode: 'cash' },
  });

  useEffect(() => {
    if (purchase) {
      reset({
        ...purchase,
        party: purchase.party?._id || purchase.party,
        date: purchase.date?.slice(0, 10),
        lineItems: purchase.lineItems?.map((item) => ({
          ...item,
          product: item.product?._id || item.product,
        })),
      });
    }
  }, [purchase, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const lineItems = watch('lineItems');
  const { items, subtotal, totalDiscount, cgst, sgst, igst } = calculateGST(lineItems, '', '');
  const grandTotal = subtotal + cgst + sgst + igst;

  const onProductSelect = (index, productId) => {
    const p = products?.find((x) => x._id === productId);
    if (!p) return;
    setValue(`lineItems.${index}.name`, p.name);
    setValue(`lineItems.${index}.rate`, p.purchasePrice || p.salePrice);
    setValue(`lineItems.${index}.gstRate`, p.gstRate);
    setValue(`lineItems.${index}.product`, p._id);
  };

  const save = useMutation({
    mutationFn: (d) => isEdit ? invoicesApi.update(id, d) : invoicesApi.create({ ...d, grandTotal }),
    onSuccess: () => { toast.success('Purchase saved'); navigate('/purchases'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  if (isEdit && loadingPurchase) {
  return (
    <AppLayout title="Purchase Details">
      <style>{`
        @keyframes skeletonPulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        .purchase-loading {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 16px;
        }

        .skeleton-card {
          background: var(--esp-surface, #fff);
          border: 1px solid var(--esp-border);
          border-radius: 12px;
          padding: 20px;
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            #f1f5f9 25%,
            #e2e8f0 37%,
            #f1f5f9 63%
          );
          background-size: 400% 100%;
          animation: skeletonPulse 1.5s ease-in-out infinite;
          border-radius: 8px;
        }

        .skeleton-title {
          width: 180px;
          height: 22px;
          margin-bottom: 24px;
        }

        .skeleton-input {
          height: 42px;
          margin-bottom: 16px;
        }

        .skeleton-table-row {
          display: grid;
          grid-template-columns: 2fr 80px 120px 90px 120px 40px;
          gap: 12px;
          margin-bottom: 12px;
        }

        .skeleton-cell {
          height: 42px;
        }

        .skeleton-summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .skeleton-summary-line div {
          width: 90px;
          height: 16px;
        }

        .skeleton-button {
          height: 44px;
          margin-top: 12px;
        }
      `}</style>

      <div className="purchase-loading">
        <div>
          <div className="skeleton-card">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-input"></div>
            <div className="skeleton skeleton-input"></div>
          </div>

          <div className="skeleton-card" style={{ marginTop: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-table-row">
                <div className="skeleton skeleton-cell"></div>
                <div className="skeleton skeleton-cell"></div>
                <div className="skeleton skeleton-cell"></div>
                <div className="skeleton skeleton-cell"></div>
                <div className="skeleton skeleton-cell"></div>
                <div className="skeleton skeleton-cell"></div>
              </div>
            ))}

            <div
              className="skeleton skeleton-button"
              style={{ width: 140 }}
            ></div>
          </div>
        </div>

        <div className="skeleton-card" style={{ height: "fit-content" }}>
          <div className="skeleton skeleton-title"></div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-summary-line">
              <div className="skeleton"></div>
              <div className="skeleton"></div>
            </div>
          ))}

          <div
            className="skeleton"
            style={{
              height: 1,
              margin: "18px 0",
            }}
          ></div>

          <div className="skeleton skeleton-input"></div>
          <div className="skeleton skeleton-input"></div>

          <div className="skeleton skeleton-button"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </AppLayout>
  );
}

  return (
    <AppLayout title={isEdit ? 'Edit Purchase' : 'New Purchase'}>
      <form onSubmit={handleSubmit((d) => save.mutate(d))}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
          <div>
            <div className="card card-body" style={{ marginBottom: 16 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Supplier *</label>
                  <Select {...register('party')} required>
                    <option value="">Select supplier</option>
                    {parties?.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <Input {...register('date')} type="date" />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="table-wrapper">
                <table className="esp-table">
                  <thead><tr><th>Product</th><th>Qty</th><th>Rate (₹)</th><th>GST%</th><th>Amount</th><th></th></tr></thead>
                  <tbody>
                    {fields.map((field, i) => (
                      <tr key={field.id}>
                        <td style={{ minWidth: 180 }}>
                          <select className="select-field" style={{ marginBottom: 4 }} onChange={(e) => onProductSelect(i, e.target.value)}>
                            <option value="">Pick product</option>
                            {products?.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                          </select>
                          <Input {...register(`lineItems.${i}.name`)} placeholder="Name" style={{ fontSize: 12 }} />
                        </td>
                        <td><Input {...register(`lineItems.${i}.qty`)} type="number" min="1" style={{ width: 70 }} /></td>
                        <td><Input {...register(`lineItems.${i}.rate`)} type="number" step="0.01" style={{ width: 100 }} /></td>
                        <td>
                          <Select {...register(`lineItems.${i}.gstRate`)} style={{ width: 80 }}>
                            {taxes.length > 0
                              ? taxes.map((t) => <option key={t._id} value={t.rate}>{t.name} {t.rate}%</option>)
                              : [0,5,12,18,28].map((r) => <option key={r} value={r}>{r}%</option>)}
                          </Select>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(items[i]?.amount || 0)}</td>
                        <td><button type="button" className="btn-icon" onClick={() => remove(i)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => append({ name: '', qty: 1, rate: 0, discount: 0, discountType: 'flat', gstRate: defaultTax?.rate ?? 18, unit: '' })}>+ Add Line</Button>
              </div>
            </div>
          </div>

          <div className="card card-body" style={{ position: 'sticky', top: 72 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Summary</h3>
            {[['Subtotal', formatCurrency(subtotal)], ['CGST', formatCurrency(cgst)], ['SGST', formatCurrency(sgst)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--esp-text-muted)' }}>{l}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--esp-border)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--esp-primary)' }}>{formatCurrency(grandTotal)}</span>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Payment Mode</label>
              <Select {...register('paymentMode')}>
                {['cash','upi','bank_transfer','credit','cheque'].map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Paid (₹)</label>
              <Input {...register('amountPaid')} type="number" step="0.01" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <Button type="submit" loading={save.isPending} style={{ width: '100%', justifyContent: 'center' }}>Save Purchase</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/purchases')} style={{ width: '100%', justifyContent: 'center' }}>Cancel</Button>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
