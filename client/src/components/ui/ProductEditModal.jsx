import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { Button, Input, Select, Textarea } from './FormElements';
import { productsApi, categoriesApi, unitsApi } from '../../services/api';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  unit: z.string().optional(),
  salePrice: z.coerce.number().min(0),
  purchasePrice: z.coerce.number().min(0).optional(),
  mrp: z.coerce.number().min(0).optional(),
  gstRate: z.coerce.number(),
  hsnCode: z.coerce.number().optional(),
  currentStock: z.coerce.number().default(0),
  lowStockThreshold: z.coerce.number().default(10),
  reorderLevel: z.coerce.number().default(5),
  status: z.string().default('active'),
  description: z.string().optional(),
});

export default function ProductEditModal({ id, onClose }) {
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list().then((r) => r.data) });
  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: () => unitsApi.list().then((r) => r.data) });
  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: () => selectedCategory ? categoriesApi.getSubsByCategory(selectedCategory).then((r) => r.data) : Promise.resolve([]),
    enabled: !!selectedCategory,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: async () => productsApi.get(id).then((r) => r.data),
  });

  const watchedCategory = watch('category');
  useEffect(() => {
    if (watchedCategory) { setSelectedCategory(watchedCategory); setValue('subcategory', ''); }
  }, [watchedCategory, setValue]);

  const save = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      return productsApi.update(id, fd);
    },
    onSuccess: () => {
      toast.success('Product updated');
      qc.invalidateQueries(['products']);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  return (
    <Modal title="Edit Product" onClose={onClose}>
      <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: 4 }}>
        <form onSubmit={handleSubmit((d) => save.mutate(d))}>
          <div className="card card-body" style={{ marginBottom: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <Input {...register('name')} error={errors.name?.message} />
              </div>
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <Input {...register('sku')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Barcode</label>
                <Input {...register('barcode')} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <Select {...register('unit')}>
                  <option value="">Select unit</option>
                  {units.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.symbol})</option>)}
                </Select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <Select {...register('category')}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Select>
              </div>
              <div className="form-group">
                <label className="form-label">Subcategory</label>
                <Select {...register('subcategory')} disabled={!selectedCategory}>
                  <option value="">{selectedCategory ? 'Select subcategory' : 'Select category first'}</option>
                  {subcategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </Select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <Textarea {...register('description')} rows={2} />
            </div>
          </div>

          <div className="card card-body" style={{ marginBottom: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sale Price (₹) *</label>
                <Input {...register('salePrice')} type="number" step="0.01" error={errors.salePrice?.message} />
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Price (₹)</label>
                <Input {...register('purchasePrice')} type="number" step="0.01" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">MRP (₹)</label>
                <Input {...register('mrp')} type="number" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">GST Rate (%)</label>
                <Select {...register('gstRate')}>
                  {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
                </Select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">HSN Code</label>
                <Input {...register('hsnCode')} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Stock</label>
                <Input {...register('currentStock')} type="number" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Low Stock Alert At</label>
                <Input {...register('lowStockThreshold')} type="number" />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <Input {...register('reorderLevel')} type="number" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <Select {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || save.isPending}>Update Product</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
