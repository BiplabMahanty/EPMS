import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { settingsApi } from '../../services/api';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function TaxSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['settings-tax'], queryFn: () => settingsApi.getTax().then((r) => r.data) });
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (d) => settingsApi.updateTax(d),
    onSuccess: () => { qc.invalidateQueries(['settings-tax']); toast.success('Tax settings saved'); },
    onError: () => toast.error('Failed to save'),
  });

  if (isLoading) return <AppLayout title="Tax Settings"><p style={{ color: 'var(--esp-text-muted)', padding: 24 }}>Loading…</p></AppLayout>;

  return (
    <AppLayout title="Tax Settings">
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header"><span style={{ fontWeight: 600 }}>GST Configuration</span></div>
        <form className="card-body" onSubmit={handleSubmit(mutate)}>
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Default GST Rate (%)</label>
              <select className="select-field" {...register('defaultGstRate')}>
                {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tax on Invoice</label>
              <select className="select-field" {...register('taxInclusive')}>
                <option value="false">Exclusive (add on top)</option>
                <option value="true">Inclusive (included in price)</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
