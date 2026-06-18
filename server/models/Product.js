const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  barcode: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  description: String,
  images: [{ url: String, isMain: { type: Boolean, default: false } }],
  thumbnail: String,
  salePrice: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, min: 0 },
  mrp: { type: Number, min: 0 },
  gstRate: { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
  hsnCode: String,
  currentStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  reorderLevel: { type: Number, default: 5 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

productSchema.index({ sku: 1, businessId: 1 }, { unique: true, sparse: true });
productSchema.index({ barcode: 1, businessId: 1 }, { sparse: true });
productSchema.index({ businessId: 1 });
productSchema.index({ category: 1, businessId: 1 });
productSchema.index({ subcategory: 1, businessId: 1 });
productSchema.index({ name: 'text' });
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
