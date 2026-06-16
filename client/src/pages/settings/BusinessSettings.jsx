import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { settingsApi } from '../../services/api';

export default function BusinessSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['settings-business'], queryFn: () => settingsApi.getBusiness().then((r) => r.data) });
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (d) => settingsApi.updateBusiness(d),
    onSuccess: () => { qc.invalidateQueries(['settings-business']); toast.success('Business settings saved'); },
    onError: () => toast.error('Failed to save'),
  });

  if (isLoading) return <AppLayout title="Business Settings"><p style={{ color: 'var(--esp-text-muted)', padding: 24 }}>Loading…</p></AppLayout>;

  return (
    <AppLayout title="Business Settings">
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><span style={{ fontWeight: 600 }}>Business Profile</span></div>
        <form className="card-body" onSubmit={handleSubmit(mutate)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input className="input" {...register('name', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="input" {...register('tagline')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" type="tel" {...register('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" {...register('email')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="textarea-field" rows={3} {...register('address')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="input" {...register('website')} />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Prefix</label>
              <input className="input" placeholder="ESP" {...register('invoicePrefix')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Starting Invoice Number</label>
              <input className="input" type="number" min={1} {...register('invoiceStartNumber')} />
            </div>
            <div className="form-group">
              <label className="form-label">Financial Year Start</label>
              <select className="select-field" {...register('financialYearStart')}>
                <option value="4">April (India default)</option>
                <option value="1">January</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Terms & Conditions</label>
            <textarea className="textarea-field" rows={3} {...register('invoiceTerms')} />
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Footer Note</label>
            <input className="input" {...register('invoiceFooter')} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
