const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  description: String,
  images: [{ url: String, publicId: String }],
  salePrice: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, min: 0 },
  mrp: { type: Number, min: 0 },
  gstRate: { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
  hsnCode: String,
  currentStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  barcode: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

productSchema.index({ sku: 1, businessId: 1 }, { unique: true, sparse: true });
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
