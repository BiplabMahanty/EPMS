import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import { Button, Input } from '../../components/ui/FormElements';
import ImageUpload from '../../components/ui/ImageUpload';
import { categoriesApi } from '../../services/api';

function CategoryModal({ onClose, onSave, initial, isPending }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  const [imageFile, setImageFile] = useState(null);

  const submit = (d) => {
    const fd = new FormData();
    Object.entries(d).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
    if (imageFile) fd.append('image', imageFile);
    onSave(fd);
  };
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <Modal onClose={onClose} title={initial?._id ? 'Edit Category' : 'Add Category'}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="form-group">
          <ImageUpload label="Category Image" onChange={setImageFile} value={initial?.image ? `${API_URL}${initial.image}`
      : ''} />
        </div>
        <div className="form-group"><label className="form-label">Name *</label><Input {...register('name')} required /></div>
        <div className="form-group"><label className="form-label">Description</label><Input {...register('description')} /></div>
        <div className="form-row">
          
          {/* This also includes optional fields for color and icon, which can be used for additional customization of the category. */}

          {/* <div className="form-group"><label className="form-label">Color</label><Input {...register('colorLabel')} type="color" /></div> */}
          {/* <div className="form-group"><label className="form-label"></label><Input {...register('icon')} placeholder="📦" /></div> */}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? '…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function SubcategoryModal({ onClose, onSave, initial, categories, isPending }) {
  const { register, handleSubmit } = useForm({ defaultValues: initial || {} });
  const [imageFile, setImageFile] = useState(null);

  const submit = (d) => {
    const fd = new FormData();
    Object.entries(d).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
    if (imageFile) fd.append('image', imageFile);
    onSave(fd);
  };
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <Modal onClose={onClose} title={initial?._id ? 'Edit Subcategory' : 'Add Subcategory'}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="form-group">
          <ImageUpload label="Subcategory Image" onChange={setImageFile} value={initial?.image ? `${API_URL}${initial.image}`
      : ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="select-field" {...register('categoryId')} required defaultValue={initial?.categoryId?._id || initial?.categoryId || ''}>
            <option value="">Select category</option>
            {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Name *</label><Input {...register('name')} required /></div>
        <div className="form-group"><label className="form-label">Description</label><Input {...register('description')} /></div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? '…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Categories() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('categories');
  const [modal, setModal] = useState(null);
  const [subModal, setSubModal] = useState(null);

  const { data: cats = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list().then((r) => r.data) });
  const { data: subs = [] } = useQuery({ queryKey: ['subcategories'], queryFn: () => categoriesApi.listSubs().then((r) => r.data) });

  const saveCat = useMutation({
    mutationFn: (fd) => modal?._id ? categoriesApi.update(modal._id, fd) : categoriesApi.create(fd),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Saved'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const delCat = useMutation({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const saveSub = useMutation({
    mutationFn: (fd) => subModal?._id ? categoriesApi.updateSub(subModal._id, fd) : categoriesApi.createSub(fd),
    onSuccess: () => { qc.invalidateQueries(['subcategories']); toast.success('Saved'); setSubModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const delSub = useMutation({
    mutationFn: (id) => categoriesApi.deleteSub(id),
    onSuccess: () => { qc.invalidateQueries(['subcategories']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const tabStyle = (active) => ({
    padding: '8px 20px', border: 'none', cursor: 'pointer', borderRadius: 6,
    background: active ? 'var(--esp-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--esp-text-muted)', fontWeight: 500, fontSize: 14,
  });

  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API_URL =", API_URL);

  return (
    <AppLayout title="Categories">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--esp-card)', padding: 4, borderRadius: 8, border: '1px solid var(--esp-border)' }}>
          <button style={tabStyle(tab === 'categories')} onClick={() => setTab('categories')}>Categories</button>
          <button style={tabStyle(tab === 'subcategories')} onClick={() => setTab('subcategories')}>Subcategories</button>
        </div>
        {tab === 'categories'
          ? <Button onClick={() => setModal({})}>+ Add Category</Button>
          : <Button onClick={() => setSubModal({})}>+ Add Subcategory</Button>}
      </div>

            
      {tab === 'categories' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="esp-table">
              <thead><tr><th>Image</th><th>Name</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c._id}>

                    {/* // Chages done here to fix the image url issue in category table */}
                    <td>{c.image ? <img src={`${API_URL}${c.image}`} alt={c.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} onError={(e) => console.log('Image Error:', e.target.src)} /> : '—'}</td>
                    {/* <td>{c.icon}</td> */}
                    <td style={{ fontWeight: 500 }}><span style={{ color: c.colorLabel, marginRight: 6 }}>●</span>{c.name}</td>
                    <td style={{ color: 'var(--esp-text-muted)', fontSize: 13 }}>{c.description}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="secondary" size="sm" className="btn-action-hover" onClick={() => setModal(c)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete category?')) delCat.mutate(c._id); }}>Del</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!cats.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--esp-text-muted)', padding: 32 }}>No categories yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'subcategories' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="esp-table">
              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id}>

                     {/* Chages done here to fix the image url issue in subcategory table */}
                    <td>{s.image ? <img src={`${API_URL}${s.image} `} alt={s.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} onError={(e) => console.log('Image Error:', e.target.src)} /> : '—'}</td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td style={{ fontSize: 13 }}>{s.categoryId?.name || '—'}</td>
                    <td style={{ color: 'var(--esp-text-muted)', fontSize: 13 }}>{s.description}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="secondary" size="sm" className="btn-action-hover" onClick={() => setSubModal(s)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete subcategory?')) delSub.mutate(s._id); }}>Del</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!subs.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--esp-text-muted)', padding: 32 }}>No subcategories yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal !== null && (
        <CategoryModal onClose={() => setModal(null)} onSave={(fd) => saveCat.mutate(fd)} initial={modal} isPending={saveCat.isPending} />
      )}
      {subModal !== null && (
        <SubcategoryModal onClose={() => setSubModal(null)} onSave={(fd) => saveSub.mutate(fd)} initial={subModal} categories={cats} isPending={saveSub.isPending} />
      )}
    </AppLayout>
  );
}
