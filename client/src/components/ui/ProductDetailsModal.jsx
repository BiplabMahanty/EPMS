import Badge from './Badge';

export default function ProductDetailsModal({
  product,
  onClose,
}) {
  if (!product) return null;

  const API_URL = import.meta.env.VITE_API_URL;

  const statusColor = product.status === 'active'
    ? '#10B981'
    : product.status === 'inactive'
      ? '#EF4444'
      : '#F59E0B';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px',
    }} >
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '900px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', background: '#fff',
        borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,.18), 0 10px 25px rgba(0,0,0,.08)',
      }} >

        {/* HEADER */}

        <div style={{
          background: 'linear-gradient(135deg,#2563EB 0%,#4F46E5 50%,#7C3AED 100%)', padding: '28px 35px', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '24px 24px 0 0',
        }} >
          <div>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, }} > Product Details </h2>

            <p style={{ marginTop: 8, opacity: 0.9, }} > Complete Product Information </p> </div>

          <button onClick={onClose} style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '18px', background: 'rgba(255,255,255,.15)', color: '#fff', }}
          >
            ✕
          </button>
        </div>



        {/* BODY */}

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start', }} >

          {/* LEFT COLUMN */}
          <div style={{  background: '#fff', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '20px', boxShadow: '0 6px 20px rgba(0,0,0,.05)', }} >

            {/* PRODUCT IMAGE */}
            <div style={{ height: '250px', borderRadius: '16px', overflow: 'hidden', background: '#F8FAFC', }}>
              {product.thumbnail ? ( <img src={`${API_URL}${product.thumbnail}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', }} />
               ) : ( <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '18px', }} >
                 No Image Available
                </div>
              )}
            </div>

            {/* STATUS */}

            <div style={{ marginTop: '20px', textAlign: 'center', }} >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: `${statusColor}15`, color: statusColor, fontWeight: 600, }}>
                ● {product.status}
              </div>
            </div>

            {/* SYSTEM INFORMATION */}

            <div style={{
                marginTop: '24px',
                borderTop: '1px solid #E5E7EB',
                paddingTop: '20px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px',
                  color: '#0F172A',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                System Information
              </h3>

              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                }}
              >
                <InfoCard
                  label="Created"
                  value={
                    product.createdAt
                      ? new Date(product.createdAt).toLocaleString()
                      : '-'
                  }
                />

                <InfoCard
                  label="Last Updated"
                  value={
                    product.updatedAt
                      ? new Date(product.updatedAt).toLocaleString()
                      : '-'
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}

          <div
            style={{
              display: 'grid',
              gap: '20px',
            }}
          >
            {/* PRODUCT INFORMATION */}

            <div
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 6px 20px rgba(0,0,0,.05)',
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: '20px',
                  color: '#0F172A',
                }}
              >
                Product Information
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                  gap: '18px',
                }}
              >
                <InfoCard label="Product Name" value={product.name} />

                <InfoCard label="SKU" value={product.sku} />

                  {/* Udate category details in product details model */}
                 <InfoCard label="Category" value={ product.category?.name || product.categoryName || '-' } />
 
                        {/* Udate subCategory details in product details model  */}
                 <InfoCard label="Sub Category" value={ product.subcategory?.name || product.subcategoryName || '-' }/>

                <InfoCard
                  label="Sale Price"
                  value={`₹ ${product.salePrice}`}
                />

                <InfoCard
                  label="Purchase Price"
                  value={`₹ ${product.purchasePrice}`}
                />

                <InfoCard
                  label="Current Stock"
                  value={product.currentStock}
                />

                <InfoCard
                  label="Low Stock Alert"
                  value={product.lowStockThreshold}
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 6px 20px rgba(0,0,0,.05)',
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: '20px',
                }}
              >
                Description
              </h3>

              <p
                style={{
                  color: '#475569',
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {product.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </div> {/* Modal Content */}
    </div>

  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        background: '#F8FAFC',
        padding: '18px',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
      }}
    >
      <div
        style={{
          fontSize: '13px',
          color: '#64748B',
          marginBottom: '8px',
          fontWeight: 500,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#0F172A',
        }}
      >
        {value || '-'}
      </div>
    </div>
  );
}