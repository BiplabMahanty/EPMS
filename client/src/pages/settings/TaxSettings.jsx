import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { settingsApi, taxApi } from '../../services/api';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

function TaxForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initial || { name: '', rate: '', type: 'gst', isDefault: false } });
  useEffect(() => { if (initial) reset(initial); }, [initial, reset]);
  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Name</label>
        <input className="input" placeholder="e.g. GST" {...register('name', { required: true })} style={{ width: 120 }} />
      </div>
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Rate (%)</label>
        <input className="input" type="number" step="0.01" min="0" max="100" placeholder="18" {...register('rate', { required: true, valueAsNumber: true })} style={{ width: 80 }} />
      </div>
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Type</label>
        <select className="select-field" {...register('type')} style={{ width: 100 }}>
          <option value="gst">GST</option>
          <option value="vat">VAT</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 2 }}>
        <input type="checkbox" {...register('isDefault')} /> Default
      </label>
      <button className="btn btn-primary" type="submit" style={{ marginBottom: 2 }}>Save</button>
      {onCancel && <button className="btn btn-secondary" type="button" onClick={onCancel} style={{ marginBottom: 2 }}>Cancel</button>}
    </form>
  );
}

export default function TaxSettings() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: gstSettings, isLoading } = useQuery({ queryKey: ['settings-tax'], queryFn: () => settingsApi.getTax().then((r) => r.data) });
  const { data: taxes = [] } = useQuery({ queryKey: ['taxes'], queryFn: () => taxApi.list().then((r) => r.data) });

  const { register, handleSubmit, reset } = useForm();
  useEffect(() => { if (gstSettings) reset(gstSettings); }, [gstSettings, reset]);

  const { mutate: saveGst, isPending: gstPending } = useMutation({
    mutationFn: (d) => settingsApi.updateTax(d),
    onSuccess: () => { qc.invalidateQueries(['settings-tax']); toast.success('GST settings saved'); },
    onError: () => toast.error('Failed to save'),
  });

  const createTax = useMutation({
    mutationFn: (d) => taxApi.create(d),
    onSuccess: () => { qc.invalidateQueries(['taxes']); setShowAdd(false); toast.success('Tax added'); },
    onError: () => toast.error('Failed to add tax'),
  });

  const updateTax = useMutation({
    mutationFn: ({ id, ...d }) => taxApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries(['taxes']); setEditing(null); toast.success('Tax updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteTax = useMutation({
    mutationFn: (id) => taxApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['taxes']); toast.success('Tax deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  if (isLoading) return <AppLayout title="Tax Settings"><p style={{ color: 'var(--esp-text-muted)', padding: 24 }}>Loading…</p></AppLayout>;

  return (
    <AppLayout title="Tax Settings">
      <div style={{ display: 'grid', gap: 24, maxWidth: 680 }}>
        {/* GST Config */}
        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 600 }}>GST Configuration</span></div>
          <form className="card-body" onSubmit={handleSubmit(saveGst)}>
            <div className="form-group">
              <label className="form-label">GST Registration Type</label>
              <select className="select-field" {...register('gstRegistration')}>
                <option value="registered">Registered</option>
                <option value="unregistered">Unregistered</option>
                <option value="composition">Composition Dealer</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input className="input" placeholder="22AAAAA0000A1Z5" {...register('gstin')} style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Business State</label>
              <select className="select-field" {...register('businessState')}>
                <option value="">Select state…</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tax on Invoice</label>
              <select className="select-field" {...register('taxInclusive')}>
                <option value="false">Exclusive (add on top)</option>
                <option value="true">Inclusive (included in price)</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={gstPending}>{gstPending ? 'Saving…' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Tax List */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Tax Rates</span>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(true); setEditing(null); }}>+ Add Tax</button>
          </div>
          <div className="card-body">
            {showAdd && (
              <TaxForm onSave={(d) => createTax.mutate(d)} onCancel={() => setShowAdd(false)} />
            )}
            {taxes.length === 0 && !showAdd && (
              <p style={{ color: 'var(--esp-text-muted)', fontSize: 13 }}>No taxes added yet. Add your first tax rate.</p>
            )}
            {taxes.map((tax) => (
              <div key={tax._id}>
                {editing === tax._id ? (
                  <TaxForm
                    initial={{ name: tax.name, rate: tax.rate, type: tax.type, isDefault: tax.isDefault }}
                    onSave={(d) => updateTax.mutate({ id: tax._id, ...d })}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--esp-border)' }}>
                    <span style={{ flex: 1, fontWeight: 500 }}>{tax.name} — {tax.rate}%</span>
                    <span style={{ fontSize: 12, color: 'var(--esp-text-muted)', textTransform: 'uppercase' }}>{tax.type}</span>
                    {tax.isDefault && <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 7px', borderRadius: 999 }}>Default</span>}
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(tax._id); setShowAdd(false); }}>Edit</button>
                    <button className="btn btn-sm" style={{ color: 'var(--esp-danger)', border: '1px solid var(--esp-danger)', background: 'transparent' }} onClick={() => deleteTax.mutate(tax._id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
