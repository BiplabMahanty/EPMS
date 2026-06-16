import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import { Button, Input } from '../../components/ui/FormElements';
import { categoriesApi } from '../../services/api';

function CategoryModal({ onClose, onSave, initial }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  return (
    <Modal onClose={onClose} title={initial ? 'Edit Category' : 'Add Category'}>
      <form onSubmit={handleSubmit((d) => { onSave(d); reset(); })}>
        <div className="form-group"><label className="form-label">Name</label><Input {...register('name')} required /></div>
        <div className="form-group"><label className="form-label">Description</label><Input {...register('description')} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Color</label><Input {...register('colorLabel')} type="color" /></div>
          <div className="form-group"><label className="form-label">Icon (emoji)</label><Input {...register('icon')} placeholder="📦" /></div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Categories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list().then((r) => r.data) });

  const save = useMutation({
    mutationFn: (d) => modal?.id ? categoriesApi.update(modal.id, d) : categoriesApi.create(d),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Saved'); setModal(null); },
  });

  const del = useMutation({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Deleted'); },
  });

  return (
    <AppLayout title="Categories">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button onClick={() => setModal({})}>+ Add Category</Button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th></th></tr></thead>
            <tbody>
              {cats?.map((c) => (
                <tr key={c._id}>
                  <td>{c.icon}</td>
                  <td style={{ fontWeight: 500 }}><span style={{ color: c.colorLabel, marginRight: 6 }}>●</span>{c.name}</td>
                  <td style={{ color: 'var(--esp-text-muted)', fontSize: 13 }}>{c.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button variant="secondary" size="sm" onClick={() => setModal({ id: c._id, ...c })}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => del.mutate(c._id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && <CategoryModal onClose={() => setModal(null)} onSave={(d) => save.mutate(d)} initial={modal?.id ? modal : null} />}
    </AppLayout>
  );
}
