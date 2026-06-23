import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Input, Select, Textarea } from '../../components/ui/FormElements';
import ImageUpload from '../../components/ui/ImageUpload';
import { productsApi, categoriesApi, unitsApi } from '../../services/api';
import './ProductForm.css';

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

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [imageFiles, setImageFiles] = useState([]);
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
    defaultValues: isEdit ? async () => productsApi.get(id).then((r) => r.data) : {},
  });

  const watchedCategory = watch('category');
  useEffect(() => {
    if (watchedCategory) { setSelectedCategory(watchedCategory); setValue('subcategory', ''); }
  }, [watchedCategory, setValue]);

  const save = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      imageFiles.forEach((f) => fd.append('images', f));
      for (let pair of fd.entries()) {
    console.log(pair[0], pair[1]);
    }
      return isEdit ? productsApi.update(id, fd) : productsApi.create(fd);
    },
    onSuccess: () => { toast.success(isEdit ? 'Product updated' : 'Product created'); navigate('/products'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  const [showModal, setShowModal] = useState(true);
  const [step, setStep] = useState(1);

  return (
    <AppLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <div style={{ maxWidth: 760 }}>
        
        

          {showModal && (
  <div className="product-modal-overlay">
    <div className="product-modal">

      <div className="product-modal-header">
        <div>
          <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p>
            Step {step} of 2
          </p>
        </div>

        <button
        type="button"
          className="close-btn"
          onClick={() => navigate('/products')}
        >
          ✕
        </button>
      </div>

      <div className="step-progress">
        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
          Basic Information
        </div>

        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
          Pricing & Inventory
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => save.mutate(d))}>
        
        {/* STEP 1 */}

        {step === 1 && (
          <>
            <div className="card card-body">

              <ImageUpload
                label="Product Images"
                multiple
                maxFiles={5}
                onChange={setImageFiles}
              />

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Product Name *
                  </label>

                  <Input
                    {...register('name')}
                    error={errors.name?.message}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Product ID
                  </label>

                  <Input {...register('sku')} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Barcode
                  </label>

                  <Input {...register('barcode')} />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Unit
                  </label>

                  <Select {...register('unit')}>
                    <option value="">Select Unit</option>
                    {units.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Category
                  </label>

                  <Select {...register('category')}>
                    <option value="">
                      Select Category
                    </option>

                    {categories.map((c) => (
                      <option
                        key={c._id}
                        value={c._id}
                      >
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Subcategory
                  </label>

                  <Select
                    {...register('subcategory')}
                    disabled={!selectedCategory}
                  >
                    <option value="">
                      Select Subcategory
                    </option>

                    {subcategories.map((s) => (
                      <option
                        key={s._id}
                        value={s._id}
                      >
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description
                </label>

                <Textarea
                  {...register('description')}
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => setStep(2)}
              >
                Next →
              </Button>
            </div>
          </>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <>
            <div className="card card-body">

              <div className="form-row">
                <div className="form-group">
                  <label>Sale Price *</label>
                  <Input
                    {...register('salePrice')}
                    type="number"
                  />
                </div>

                <div className="form-group">
                  <label>Purchase Price</label>
                  <Input
                    {...register('purchasePrice')}
                    type="number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>MRP</label>
                  <Input
                    {...register('mrp')}
                    type="number"
                  />
                </div>

                <div className="form-group">
                  <label>GST Rate</label>

                  <Select {...register('gstRate')}>
                    {[0, 5, 12, 18, 28].map((r) => (
                      <option
                        key={r}
                        value={r}
                      >
                        {r}%
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>HSN Code</label>
                  <Input {...register('hsnCode')} />
                </div>

                <div className="form-group">
                  <label>Opening Stock</label>
                  <Input
                    {...register('currentStock')}
                    type="number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Low Stock Alert</label>
                  <Input
                    {...register('lowStockThreshold')}
                    type="number"
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level</label>
                  <Input
                    {...register('reorderLevel')}
                    type="number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>

                <Select {...register('status')}>
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </Select>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>

              <Button
                type="submit"
                loading={save.isPending}
              >
                Save Product
              </Button>
            </div>
          </>
        )}

      </form>
    </div>
  </div>
)}
      
      </div>
    </AppLayout>
  );
}
