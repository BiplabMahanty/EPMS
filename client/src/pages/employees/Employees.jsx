import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import { Button, Input, Select } from '../../components/ui/FormElements';
import ImageUpload from '../../components/ui/ImageUpload';
import { employeesApi } from '../../services/api';
import { format } from 'date-fns';

function EmployeeModal({ onClose, onSave, initial, isPending }) {
  const { register, handleSubmit } = useForm({ defaultValues: initial || {} });
  const [photoFile, setPhotoFile] = useState(null);

  const submit = (d) => {
    const fd = new FormData();
    Object.entries(d).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
    if (photoFile) fd.append('image', photoFile);
    onSave(fd);
  };

  return (
    <Modal onClose={onClose} title={initial?._id ? 'Edit Employee' : 'Add Employee'}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="form-group"><ImageUpload label="Photo" onChange={setPhotoFile} value={initial?.photo} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name *</label><Input {...register('name')} required /></div>
          <div className="form-group"><label className="form-label">Employee ID</label><Input {...register('employeeId')} placeholder="Auto" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email *</label><Input {...register('email')} type="email" required disabled={!!initial?._id} /></div>
          {!initial?._id && <div className="form-group"><label className="form-label">Password *</label><Input {...register('password')} type="password" required /></div>}
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Phone</label><Input {...register('phone')} /></div>
          <div className="form-group"><label className="form-label">Designation</label><Input {...register('designation')} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Department</label><Input {...register('department')} /></div>
          <div className="form-group"><label className="form-label">Joining Date</label><Input {...register('joiningDate')} type="date" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Salary Amount</label><Input {...register('salary.amount')} type="number" /></div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <Select {...register('status')}><option value="active">Active</option><option value="inactive">Inactive</option></Select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? '…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Employees() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({ queryKey: ['employees', page], queryFn: () => employeesApi.list({ page, limit: 20 }).then((r) => r.data) });

  const save = useMutation({
    mutationFn: (fd) => modal?._id ? employeesApi.update(modal._id, fd) : employeesApi.create(fd),
    onSuccess: () => { qc.invalidateQueries(['employees']); toast.success('Saved'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const remove = useMutation({
    mutationFn: (id) => employeesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['employees']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <AppLayout title="Employees">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button onClick={() => setModal({})}>+ Add Employee</Button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Photo</th><th>Name</th><th>ID</th><th>Designation</th><th>Email</th><th>Joined</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>Loading…</td></tr>}
              {data?.docs?.map((e) => (
                <tr key={e._id}>
                  <td><img src={e.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.name)}&size=36`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /></td>
                  <td style={{ fontWeight: 500 }}>{e.name}</td>
                  <td style={{ fontSize: 13 }}>{e.employeeId}</td>
                  <td style={{ fontSize: 13 }}>{e.designation || '—'}</td>
                  <td style={{ fontSize: 13 }}>{e.email}</td>
                  <td style={{ fontSize: 13 }}>{e.joiningDate ? format(new Date(e.joiningDate), 'dd MMM yyyy') : '—'}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: e.status === 'active' ? 'var(--esp-success-light)' : 'var(--esp-danger-light)', color: e.status === 'active' ? 'var(--esp-success)' : 'var(--esp-danger)' }}>{e.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button variant="secondary" size="sm" onClick={() => setModal(e)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete employee?')) remove.mutate(e._id); }}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.docs?.length && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--esp-text-muted)' }}>No employees yet</td></tr>}
            </tbody>
          </table>
        </div>
        {data?.totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: 16, justifyContent: 'center' }}>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span style={{ padding: '4px 12px', fontSize: 14 }}>{page} / {data.totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>Next</Button>
          </div>
        )}
      </div>
      {modal !== null && <EmployeeModal onClose={() => setModal(null)} onSave={(fd) => save.mutate(fd)} initial={modal} isPending={save.isPending} />}
    </AppLayout>
  );
}
