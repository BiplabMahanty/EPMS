import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ProductEditModal from '../../components/ui/ProductEditModal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonRow } from '../../components/ui/Skeleton';
import { productsApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { useState } from 'react';
import './Products.css';
import ProductDetailsModal from '../../components/ui/ProductDetailsModal';



export default function Products() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsApi.list({ search, limit: 50 }).then((r) => r.data),
  });

  const del = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['products']); toast.success('Product deleted'); setDeleteId(null); },
    onError: () => toast.error('Delete failed'),
  });

  const products = data?.docs || [];
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <AppLayout title="Products">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <input className="input" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/products/categories" className="btn btn-secondary btn-action-hover">Categories</Link>
          <Link to="/products/new" className="btn btn-primary">+ Add Product</Link>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="esp-table">
            <thead>
              <tr>
              <th className = "table-header">Image</th>
              <th className="table-header">Name</th>
                  <th className="table-header">Product ID</th>
                  <th className="table-header">Sale Price</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Status</th>
                  <th className="table-header"></th>
            </tr>
            </thead>
            <tbody>
              {isLoading && Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)}
              {!isLoading && products.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon="" title="" description="" action={<Link to="/products/new" className="btn btn-primary">Add Product +</Link>} /></td></tr>
              )}
              {products.map((p) => {
                const stockColor = p.currentStock <= 0 ? 'var(--esp-danger)' : p.currentStock <= p.lowStockThreshold ? 'var(--esp-warning)' : 'var(--esp-success)';
                return (
                  <tr key={p._id}>
                    <td className="product-cell">
                      {p.thumbnail ? (<img src={`${API_URL}${p.thumbnail}`} alt={p.thumbnail} className="product-image" onError={(e) => {
                        console.log('Image failed:', `${API_URL}${p.thumbnail}`);
                        e.target.style.display = 'none';
                      }} />) : (<span>No Image</span>)} </td>
                    <td className="product-name" > <span className='product-link' onClick={()=> setSelectedProduct(p)}>{p.name}</span></td>
                    <td className="product-sku" >{p.sku}</td>
                    <td className="product-price" >{formatCurrency(p.salePrice)}</td>
                    <td className="product-cell" ><span className="product-stock" style={{ color: stockColor, }}>{p.currentStock}</span></td>
                    <td className="product-status"><Badge label={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm btn-action-hover" onClick={() => setEditId(p._id)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <ConfirmModal onCancel={() => setDeleteId(null)} onConfirm={() => del.mutate(deleteId)} loading={del.isPending} message="This will permanently delete the product." />
      )}
      {editId && <ProductEditModal id={editId} onClose={() => setEditId(null)} />} 
      

      {selectedProduct && (<ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)}
  />
)}

    </AppLayout>
  );
}
