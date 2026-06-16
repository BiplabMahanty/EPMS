import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Input, Select, Textarea } from '../../components/ui/FormElements';
import { partiesApi } from '../../services/api';

const schema = z.object({
  name: z.string().min(1),
  type: z.string(),
  phone: z.string().min(10).max(10),
  email: z.string().email().optional().or(z.literal('')),
  gstin: z.string().optional(),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
});

export default function PartyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? async () => partiesApi.get(id).then((r) => r.data) : {},
  });

  const save = useMutation({
    mutationFn: (d) => isEdit ? partiesApi.update(id, d) : partiesApi.create(d),
    onSuccess: () => { toast.success(isEdit ? 'Updated' : 'Created'); navigate('/parties'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  return (
    <AppLayout title={isEdit ? 'Edit Party' : 'Add Party'}>
      <div style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit((d) => save.mutate(d))}>
          <div className="card card-body" style={{ marginBottom: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <Input {...register('name')} error={errors.name?.message} />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <Select {...register('type')}>
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                  <option value="both">Both</option>
                </Select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <Input {...register('phone')} placeholder="10-digit number" error={errors.phone?.message} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <Input {...register('email')} type="email" error={errors.email?.message} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <Input {...register('gstin')} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="form-group">
              <label className="form-label">Billing Address</label>
              <Textarea {...register('billingAddress')} rows={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <Textarea {...register('notes')} rows={2} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" loading={isSubmitting || save.isPending}>{isEdit ? 'Update' : 'Add Party'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/parties')}>Cancel</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
