// Purchase form is the same as SaleForm but with type='purchase' and supplier parties
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { invoicesApi, partiesApi, productsApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { calculateGST } from '../../utils/gstCalculator';

const emptyItem = { name: '', qty: 1, rate: 0, discount: 0, discountType: 'flat', gstRate: 18, unit: '' };

export default function PurchaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: parties } = useQuery({ queryKey: ['parties-supplier'], queryFn: () => partiesApi.list({ type: 'supplier', limit: 200 }).then((r) => r.data.docs) });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.list({ limit: 500 }).then((r) => r.data.docs) });

  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: { type: 'purchase', date: new Date().toISOString().slice(0, 10), lineItems: [emptyItem], amountPaid: 0, paymentMode: 'cash' },
  });

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
                            {[0,5,12,18,28].map((r) => <option key={r} value={r}>{r}%</option>)}
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
                <Button type="button" variant="secondary" size="sm" onClick={() => append(emptyItem)}>+ Add Line</Button>
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
